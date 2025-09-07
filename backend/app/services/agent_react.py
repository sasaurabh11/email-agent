import re
from langchain.agents import initialize_agent, Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
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

class ThoughtCaptureHandler(BaseCallbackHandler):
    def __init__(self):
        self.logs = []

    def on_agent_action(self, action, **kwargs):
        # Capture intermediate "Thought/Action/Action Input"
        text = f"Thought: {action.log}"
        self.logs.append(text)

    def on_tool_end(self, output, **kwargs):
        # Capture tool results (Observation)
        self.logs.append(f"Observation: {output}")

    def on_llm_start(self, serialized, prompts, **kwargs):
        """Log when LLM call starts"""
        self.logs.append(f"LLM Call Starting at {time.strftime('%H:%M:%S')}")

    def on_llm_end(self, response, **kwargs):
        # Capture when LLM call ends
        self.logs.append(f"LLM Call Completed at {time.strftime('%H:%M:%S')}")

    def get_logs(self):
        return self.logs

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
    memory = ConversationBufferMemory(memory_key="chat_history")
    handler = ThoughtCaptureHandler()
    agent = initialize_agent(
        tools=get_tools(user_id, email_id, email_doc),
        llm=gemini_model,
        agent="zero-shot-react-description",
        memory=memory,
        verbose=True,
        callbacks=[handler],
        max_iterations=5,  # Limit iterations to prevent excessive calls
        early_stopping_method="generate"  # Stop early if possible
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
1. Classify email
2. Summarize it
3. Decide next actions
4. If you need more info from user, respond in this format:
   <<REQUEST_INFO: your question here>>
"""
    else:
        query = f"User provided additional info: {user_input}"

    print(f"Starting agent execution at {time.strftime('%H:%M:%S')}")
    result = agent.run(query)
    print(f"Agent execution completed at {time.strftime('%H:%M:%S')}")

    logs = handler.get_logs()   # <-- capture thought process

    match = re.search(r'<<REQUEST_INFO:(.*?)>>', result)
    if match:
        return {
            "responses": [result],
            "thoughts": logs,
            "needs_input": True,
            "prompt": match.group(1).strip()
        }

    return {
        "responses": [result],
        "thoughts": logs,
        "needs_input": False
    }