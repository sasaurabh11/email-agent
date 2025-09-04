from fastapi import APIRouter, HTTPException
from app.services.llm_client import summarize_text
from app.core.mongo import emails_collection

router = APIRouter()

@router.post("/emails/{email_id}/summarize")
async def summarize_email(email_id: str, user_id: str, mode: str = "short"):
    email_doc = await emails_collection.find_one({"id": email_id, "user_id": user_id})
    if not email_doc:
        raise HTTPException(status_code=404, detail="Email not found")
    
    if "summaries" in email_doc and mode in email_doc["summaries"]:
        return {
            "email_id": email_id,
            "mode": mode,
            "summary": email_doc["summaries"][mode],
            "cached": True
        }

    body_text = email_doc.get("body", "") or email_doc.get("snippet", "")
    summary = await summarize_text(body_text, mode)

    await emails_collection.update_one(
        {"id": email_id, "user_id": user_id},
        {"$set": {f"summaries.{mode}": summary}}
    )

    return {"email_id": email_id, "mode": mode, "summary": summary}


@router.post("/threads/{thread_id}/summarize")
async def summarize_thread(thread_id: str, user_id: str, mode: str = "short"):
    # Check if already summarized in any email of this thread
    existing = await emails_collection.find_one(
        {"thread_id": thread_id, "user_id": user_id, f"thread_summaries.{mode}": {"$exists": True}},
        projection={f"thread_summaries.{mode}": 1}
    )
    if existing and "thread_summaries" in existing and mode in existing["thread_summaries"]:
        return {
            "thread_id": thread_id,
            "mode": mode,
            "summary": existing["thread_summaries"][mode],
            "cached": True
        }

    cursor = emails_collection.find({"thread_id": thread_id, "user_id": user_id}).sort("date", 1)
    emails = await cursor.to_list(length=50)

    if not emails:
        raise HTTPException(status_code=404, detail="Thread not found")

    combined_text = "\n\n".join(
        [f"From: {e['sender']}\nSubject: {e['subject']}\n{e.get('body','')}" for e in emails]
    )

    summary = await summarize_text(combined_text, mode)

    await emails_collection.update_many(
        {"thread_id": thread_id, "user_id": user_id},
        {"$set": {f"thread_summaries.{mode}": summary}}
    )

    return {"thread_id": thread_id, "mode": mode, "summary": summary}
