from fastapi import APIRouter, HTTPException, Body
from app.core.mongo import emails_collection
from app.services.agent_react import run_agent_on_email

router = APIRouter()

@router.post("/agent/run/{email_id}")
async def agent_run(
    email_id: str, 
    user_id: str, 
    user_input: str = Body(default=None) 
):
    email_doc = await emails_collection.find_one({"id": email_id, "user_id": user_id})
    if not email_doc:
        raise HTTPException(status_code=404, detail="Email not found")
    
    result = await run_agent_on_email(email_doc, user_id, user_input)
    return {
        "email_id": email_id,
        "result": result["responses"],
        "needs_input": result["needs_input"],
        "prompt": result.get("prompt") 
    }
