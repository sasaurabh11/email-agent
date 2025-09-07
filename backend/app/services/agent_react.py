import re
from langchain.agents import initialize_agent, Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.callbacks.base import BaseCallbackHandler
from app.services.agent_tools import (
    sync_summarization_tool, 
    sync_filtering_tool, 
    sync_draft_tool, 
    sync_schedule_tool, 
    sync_snooze_tool
)
from app.core.config import settings
import asyncio
import time
import threading
from typing import Dict, Any, List

class EnhancedThoughtCaptureHandler(BaseCallbackHandler):
    def __init__(self):
        self.logs = []
        self.current_step = 0
        self.thoughts = []
        self.actions = []
        self.observations = []

    def on_agent_action(self, action, **kwargs):
        self.current_step += 1
        
        thought_match = re.search(r'Thought:\s*(.*?)(?=Action:|$)', action.log, re.DOTALL)
        if thought_match:
            thought = thought_match.group(1).strip()
            self.thoughts.append({
                "step": self.current_step,
                "thought": thought,
                "timestamp": time.strftime('%H:%M:%S')
            })
            self.logs.append(f"Step {self.current_step} - Thought: {thought}")

        action_info = {
            "step": self.current_step,
            "tool": action.tool,
            "tool_input": action.tool_input,
            "timestamp": time.strftime('%H:%M:%S')
        }
        self.actions.append(action_info)
        self.logs.append(f"Step {self.current_step} - Action: {action.tool}")
        self.logs.append(f"Step {self.current_step} - Action Input: {action.tool_input}")

    def on_tool_end(self, output, **kwargs):
        observation = {
            "step": self.current_step,
            "output": str(output),
            "timestamp": time.strftime('%H:%M:%S')
        }
        self.observations.append(observation)
        self.logs.append(f"Step {self.current_step} - Observation: {output}")

    def on_llm_start(self, serialized, prompts, **kwargs):
        self.logs.append(f"LLM Call Starting at {time.strftime('%H:%M:%S')}")

    def on_llm_end(self, response, **kwargs):
        self.logs.append(f"LLM Call Completed at {time.strftime('%H:%M:%S')}")

    def on_agent_finish(self, finish, **kwargs):
        self.logs.append(f"Final Answer: {finish.return_values.get('output', '')}")

    def on_text(self, text: str, **kwargs) -> None:
        if "Thought:" in text:
            self.logs.append(f"Additional Thought: {text}")

    def get_logs(self):
        return self.logs

    def get_structured_data(self):
        return {
            "thoughts": self.thoughts,
            "actions": self.actions,
            "observations": self.observations,
            "raw_logs": self.logs
        }

def extract_email(sender: str) -> str:
    match = re.search(r'<(.+?)>', sender)
    if match:
        return match.group(1)
    return sender.strip()

gemini_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=settings.GEMINI_API_KEY_2,
    temperature=0,
)

def get_tools(user_id: str, email_id: str, email_doc: dict):    
    def summarize_wrapper(text: str):
        return sync_summarization_tool(text)
    
    def filter_wrapper(text: str):
        return sync_filtering_tool(text)
    
    def draft_wrapper(input_data: str):
        return sync_draft_tool(f"{user_id}|{input_data}")
    
    def schedule_wrapper(input_str: str):
        target_email = extract_email(email_doc.get("sender", ""))
        return sync_schedule_tool(f"{user_id}|{email_id}|{input_str}|{target_email}")
    
    def snooze_wrapper(days: str):
        return sync_snooze_tool(f"{email_id}|{days}")
    
    return [
        Tool(
            name="summarize_email", 
            func=summarize_wrapper, 
            description="Summarize an email. Input: email_text (or email_text|mode where mode is 'short' or 'long')"
        ),
        Tool(
            name="filter_email", 
            func=filter_wrapper, 
            description="Classify an email category. Input: email_text"
        ),
        Tool(
            name="draft_email", 
            func=draft_wrapper, 
            description="Generate a reply draft using RAG + user style. Input: recipient|subject|context|original_email_body"
        ),
        Tool(
            name="schedule_meeting", 
            func=schedule_wrapper, 
            description="Schedule a meeting in Google Calendar. Input: meeting_details|target_user_email (target email auto-extracted from sender)"
        ),
        Tool(
            name="snooze_email", 
            func=snooze_wrapper, 
            description="Snooze an email for X days. Input: number_of_days"
        )
    ]

def get_agent_executor(user_id, email_id, email_doc):
    handler = EnhancedThoughtCaptureHandler()
    agent = initialize_agent(
        tools=get_tools(user_id, email_id, email_doc),
        llm=gemini_model,
        agent="zero-shot-react-description",
        verbose=True,
        callbacks=[handler],
        max_iterations=5,
        early_stopping_method="generate"
    )
    return agent, handler

async def run_agent_on_email(email: dict, user_id: str, user_input: str | None = None):
    email_id = email.get("id")
    email_body = email.get("body") or email.get("plain_body") or email.get("snippet", "")
    email_subject = email.get("subject", "No subject")
    email_sender = email.get("sender", "Unknown sender")

    agent, handler = get_agent_executor(user_id, email_id, email)

    if not user_input:  
        query = f"""
Process this email step by step:

Subject: {email_subject}
From: {email_sender}
Body: {email_body}

Steps:
1. Classify email using filter_email tool
2. Summarize it using summarize_email tool
3. Decide next actions based on email content
4. If you need more info from user, respond in this format:
   <<REQUEST_INFO: your question here>>

IMPORTANT INSTRUCTIONS FOR MEETING SCHEDULING:
- If the email is requesting to schedule a meeting:
  * If specific time and details are provided in the email, use the schedule_meeting tool immediately with those details. DO NOT ask for confirmation.
  * If no specific time is mentioned, schedule the meeting for tomorrow at a reasonable default time (e.g., 2:00 PM). DO NOT ask the user for confirmation.
  * If meeting purpose is not clear, make a reasonable assumption based on the email context and schedule it anyway.
  * NEVER ask the user "What is the meeting about?" or "What time?" - always proceed with scheduling using available information or reasonable defaults.
  * Example input for schedule_meeting: "Team discussion meeting tomorrow 2:00 PM" or "Project review meeting as discussed"

Think step by step and use the tools available to you.
"""
    else:
        query = f"User provided additional info: {user_input}. Continue processing the email with this new information."

    print(f"Starting agent execution at {time.strftime('%H:%M:%S')}")
    
    try:
        result = agent.invoke({"input": query})
        print(f"Agent execution completed at {time.strftime('%H:%M:%S')}")

        output = result.get("output", "")

        logs = handler.get_logs()
        structured_thoughts = handler.get_structured_data()

        match = re.search(r'<<REQUEST_INFO:(.*?)>>', output)
        if match:
            return {
                "responses": [output],
                "thoughts": logs,
                "structured_thoughts": structured_thoughts,
                "needs_input": True,
                "prompt": match.group(1).strip()
            }

        return {
            "responses": [output],
            "thoughts": logs,
            "structured_thoughts": structured_thoughts,
            "needs_input": False
        }
        
    except Exception as e:
        print(f"Agent execution failed: {str(e)}")
        
        logs = handler.get_logs()
        structured_thoughts = handler.get_structured_data()
        
        return {
            "responses": [f"Error occurred: {str(e)}"],
            "thoughts": logs,
            "structured_thoughts": structured_thoughts,
            "needs_input": False,
            "error": str(e)
        }

def format_thoughts_for_frontend(thoughts_data: dict) -> dict:
    formatted_steps = []
    
    max_steps = max(
        len(thoughts_data.get("thoughts", [])),
        len(thoughts_data.get("actions", [])),
        len(thoughts_data.get("observations", []))
    )
    
    for i in range(1, max_steps + 1):
        step_data = {"step": i}
        
        thought = next((t for t in thoughts_data.get("thoughts", []) if t["step"] == i), None)
        if thought:
            step_data["thought"] = thought["thought"]
            step_data["thought_timestamp"] = thought["timestamp"]
        
        action = next((a for a in thoughts_data.get("actions", []) if a["step"] == i), None)
        if action:
            step_data["action"] = {
                "tool": action["tool"],
                "input": action["tool_input"],
                "timestamp": action["timestamp"]
            }
        
        observation = next((o for o in thoughts_data.get("observations", []) if o["step"] == i), None)
        if observation:
            step_data["observation"] = {
                "output": observation["output"],
                "timestamp": observation["timestamp"]
            }
        
        formatted_steps.append(step_data)
    
    return {
        "steps": formatted_steps,
        "raw_logs": thoughts_data.get("raw_logs", [])
    }