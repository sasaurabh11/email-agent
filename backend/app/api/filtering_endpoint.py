from fastapi import APIRouter, HTTPException
from app.services.llm_client import classify_email
from app.core.mongo import emails_collection

router = APIRouter()

@router.post("/emails/{email_id}/filter")
async def filter_email(email_id: str, user_id: str):
    email_doc = await emails_collection.find_one({"id": email_id, "user_id": user_id})
    if not email_doc:
        raise HTTPException(status_code=404, detail="Email not found")

    body_text = email_doc.get("body", "") or email_doc.get("snippet", "")
    classification = await classify_email(body_text)

    await emails_collection.update_one(
        {"id": email_id, "user_id": user_id},
        {"$set": {"classification": classification}}
    )

    return {"email_id": email_id, "classification": classification}


@router.post("/emails/filter-all")
async def filter_all_emails(user_id: str):
    cursor = emails_collection.find({"user_id": user_id})
    emails = await cursor.to_list(length=100)

    classified = []
    for e in emails:
        body_text = e.get("body", "") or e.get("snippet", "")
        classification = await classify_email(body_text)
        await emails_collection.update_one(
            {"id": e["id"], "user_id": user_id},
            {"$set": {"classification": classification}}
        )
        classified.append({"id": e["id"], "classification": classification})

    return {"classified_emails": classified}
