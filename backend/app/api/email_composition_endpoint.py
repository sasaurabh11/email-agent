from fastapi import APIRouter, Query, Body
from app.services.email_composition import build_user_profile
from app.services.llm_client import generate_personalized_email
from app.models.email_model import DraftRequest
import asyncio

router = APIRouter()

@router.post("/drafts/reply")
async def reply_draft(
    user_id: str = Query(...),
    draft_req: DraftRequest = Body(...)
):
    print(draft_req)
    profile = await build_user_profile(user_id)

    draft = await generate_personalized_email(
        profile,
        draft_req.recipient,
        draft_req.subject,
        draft_req.context,
        reply_to=draft_req.reply_to
    )

    return {
        "user_id": user_id,
        "recipient": draft_req.recipient,
        "subject": draft_req.subject,
        "context": draft_req.context,
        "reply_to": draft_req.reply_to,
        "style_profile": profile,
        "draft": draft
    }
