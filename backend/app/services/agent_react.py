from langchain.agents import initialize_agent, Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from app.services.agent_tools import (
    sync_summarization_tool, 
    sync_filtering_tool, 
    sync_draft_tool, 
    sync_schedule_tool, 
    sync_snooze_tool
)
from app.core.config import settings

gemini_model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    api_key=settings.GEMINI_API_KEY,
    temperature=0,
)

def get_tools(user_id: str, email_id: str):    
    def summarize_wrapper(text: str):
        return sync_summarization_tool(text)
    
    def filter_wrapper(text: str):
        return sync_filtering_tool(text)
    
    def draft_wrapper(input_data: str):
        return sync_draft_tool(f"{user_id}|{input_data}")
    
    def schedule_wrapper(details: str):
        return sync_schedule_tool(details)
    
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
            description="Schedule a meeting. Input: meeting_details"
        ),
        Tool(
            name="snooze_email", 
            func=snooze_wrapper, 
            description="Snooze an email for X days. Input: number_of_days"
        )
    ]

def get_agent(user_id: str, email_id: str):
    tools = get_tools(user_id, email_id)
    return initialize_agent(
        tools=tools,
        llm=gemini_model,
        agent="zero-shot-react-description",
        verbose=True
    )

async def run_agent_on_email(email: dict, user_id: str):
    email_id = email.get("id")
    email_body = email.get("body") or email.get("plain_body") or email.get("snippet", "")
    email_subject = email.get("subject", "No subject")
    email_sender = email.get("sender", "Unknown sender")
    
    query = f"""
    Process this email step by step:

    Subject: {email_subject}
    From: {email_sender}
    Body: {email_body}

    Steps to follow:
    1. First classify this email using filter_email tool (pass only the email body text)
    2. Then summarize it using summarize_email tool (pass only the email body text)
    3. Based on classification, decide if any other actions are needed
    
    Important: For filter_email and summarize_email, pass ONLY the email body text, not the full email details.
    """
    
    agent = get_agent(user_id, email_id)
    
    try:
        result = agent.invoke({"input": query})
        return result
    except Exception as e:
        return {"error": f"Agent processing failed: {str(e)}"}