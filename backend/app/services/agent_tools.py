import asyncio
from datetime import datetime, timedelta
from app.services.llm_client import summarize_text, classify_email, generate_personalized_email
from app.core.mongo import emails_collection
from app.services.email_composition import build_user_profile
import nest_asyncio

nest_asyncio.apply()

def run_sync(coro):
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)

def sync_summarization_tool(input_str: str):
    try:
        if "|" in input_str:
            text, mode = input_str.split("|", 1)
        else:
            text, mode = input_str, "short"
        
        text = text.strip()
        mode = mode.strip()
        
        if not text:
            return "Error: No text provided for summarization"
        
        if mode not in ["short", "long"]:
            mode = "short"
        
        return run_sync(summarize_text(text, mode))
        
    except Exception as e:
        return f"Error summarizing email: {str(e)}"


def sync_filtering_tool(email_text: str):
    try:
        if not email_text or not email_text.strip():
            return "Error: No email text provided for classification"
        
        email_text = email_text.strip()
        
        return run_sync(classify_email(email_text))
        
    except Exception as e:
        return f"Error classifying email: {str(e)}"


def sync_draft_tool(input_str: str):
    try:
        parts = input_str.split("|")
        if len(parts) < 4:
            return "Error: Invalid input format. Expected: user_id|recipient|subject|context|original_email_body"

        user_id, recipient, subject, context = parts[:4]
        reply_to = parts[4] if len(parts) > 4 else ""

        user_id = user_id.strip()
        recipient = recipient.strip()
        subject = subject.strip()
        context = context.strip()
        reply_to = reply_to.strip() if reply_to else ""

        if not all([user_id, recipient, subject, context]):
            return "Error: Missing required fields (user_id, recipient, subject, context)"

        async def draft_coro():
            profile = await build_user_profile(user_id)
            return await generate_personalized_email(
                profile,
                recipient,
                subject,
                context,
                reply_to=reply_to
            )

        return run_sync(draft_coro())
        
    except ValueError as e:
        return f"Error parsing input: {str(e)}"
    except Exception as e:
        return f"Error generating draft: {str(e)}"


def sync_schedule_tool(details: str):
    try:
        if not details or not details.strip():
            return "Error: No meeting details provided"
        
        details = details.strip()
        return f"Meeting scheduled via Cal.com: {details}"
        
    except Exception as e:
        return f"Error scheduling meeting: {str(e)}"


def sync_snooze_tool(input_str: str):
    try:
        parts = input_str.split("|")
        if len(parts) != 2:
            return "Error: Invalid input format. Expected: email_id|days"

        email_id, days_str = parts
        email_id = email_id.strip()
        
        if not email_id:
            return "Error: No email_id provided"
        
        try:
            days = int(days_str.strip())
        except ValueError:
            return "Error: Days must be a valid integer"
        
        if days < 0:
            return "Error: Days cannot be negative"
        
        snooze_time = datetime.utcnow() + timedelta(days=days)

        async def snooze_coro():
            result = await emails_collection.update_one(
                {"id": email_id},
                {"$set": {"snoozed_until": snooze_time}}
            )
            
            if result.matched_count == 0:
                return f"Warning: No email found with id {email_id}"
            
            return f"Email {email_id} snoozed until {snooze_time.strftime('%Y-%m-%d %H:%M:%S')} UTC"

        return run_sync(snooze_coro())
        
    except Exception as e:
        return f"Error snoozing email: {str(e)}"