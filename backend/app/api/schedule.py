from fastapi import APIRouter, Depends, HTTPException
from app.services.meeting_scheduling import sched_service

router = APIRouter()

@router.post("/schedule/from-email")
async def schedule_from_email(user_id: str, email_id: str, details: str, target_user_email: str):
    try:
        result = await sched_service.schedule_meeting_from_email(user_id, email_id, details, target_user_email)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
