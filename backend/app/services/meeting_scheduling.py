from datetime import datetime, timedelta
from typing import Dict, Any
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase
import aiohttp
import logging
from app.models.email_model import MeetingCreate, MeetingStatus

class SchedulingService:
    def __init__(self, db: AsyncIOMotorDatabase, cal_com_api_key: str = None):
        self.db = db
        self.meetings_collection = db.meetings
        self.cal_com_api_key = cal_com_api_key

    async def create_cal_com_meeting(self, meeting_data: MeetingCreate, user_id: str) -> Dict[str, Any]:
        """Create meeting using Cal.com API"""
        headers = {
            "Authorization": f"Bearer {self.cal_com_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "title": meeting_data.title,
            "description": meeting_data.description,
            "startTime": meeting_data.start_time.isoformat(),
            "endTime": meeting_data.end_time.isoformat(),
            "attendees": [{"email": email} for email in meeting_data.attendees],
            "location": {"type": "integrations:zoom"}  # or "integrations:meet", etc.
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post("https://api.cal.com/v1/bookings", 
                                  json=payload, headers=headers) as response:
                if response.status not in [200, 201]:
                    raise Exception(f"Failed to create Cal.com meeting: {await response.text()}")
                
                cal_data = await response.json()
                
                meeting_doc = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "email_id": meeting_data.email_id,
                    "title": meeting_data.title,
                    "description": meeting_data.description,
                    "start_time": meeting_data.start_time,
                    "end_time": meeting_data.end_time,
                    "attendees": meeting_data.attendees,
                    "meeting_link": cal_data.get("location", {}).get("link", ""),
                    "status": MeetingStatus.SCHEDULED,
                    "platform": "cal.com",
                    "external_id": str(cal_data.get("id")),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                await self.meetings_collection.insert_one(meeting_doc)
                return meeting_doc

    async def schedule_meeting_from_email(self, user_id: str, email_id: str, details: str) -> str:
        """Parse email content and schedule meeting"""
        # Use LLM to extract meeting details from natural language
        meeting_details = await self._extract_meeting_details(details)
        
        meeting_data = MeetingCreate(
            title=meeting_details.get("title", "Meeting"),
            description=meeting_details.get("description", ""),
            start_time=datetime.fromisoformat(meeting_details["start_time"]),
            end_time=datetime.fromisoformat(meeting_details["end_time"]),
            attendees=meeting_details.get("attendees", []),
            email_id=email_id
        )
        
        # Try Calendly first, fallback to Cal.com
        try:
            if self.calendly_token:
                meeting = await self.create_calendly_meeting(meeting_data, user_id)
                return f"Meeting scheduled via Calendly: {meeting['meeting_link']}"
        except Exception as e:
            logging.warning(f"Calendly failed: {e}")
        
        try:
            if self.cal_com_api_key:
                meeting = await self.create_cal_com_meeting(meeting_data, user_id)
                return f"Meeting scheduled via Cal.com: {meeting['meeting_link']}"
        except Exception as e:
            logging.warning(f"Cal.com failed: {e}")
        
        # Fallback: store meeting without external platform
        meeting_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "email_id": email_id,
            "title": meeting_data.title,
            "description": meeting_data.description,
            "start_time": meeting_data.start_time,
            "end_time": meeting_data.end_time,
            "attendees": meeting_data.attendees,
            "meeting_link": "",
            "status": MeetingStatus.SCHEDULED,
            "platform": "internal",
            "external_id": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.meetings_collection.insert_one(meeting_doc)
        return f"Meeting scheduled internally: {meeting_data.title} at {meeting_data.start_time}"

    async def _extract_meeting_details(self, details: str) -> Dict[str, Any]:
        """Extract meeting details using LLM"""
        from app.services.llm_client import extract_meeting_info  # You'll need to implement this
        return await extract_meeting_info(details)