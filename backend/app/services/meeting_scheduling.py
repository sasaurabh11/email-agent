from datetime import datetime
from typing import Dict, Any, List
import uuid
import json

from motor.motor_asyncio import AsyncIOMotorDatabase
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

from app.models.email_model import MeetingCreate, MeetingStatus
from app.core.mongo import db
from app.core.config import settings
from app.services.llm_client import extract_meeting_details

SCOPES = settings.GMAILSCOPES


class SchedulingService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.meetings_collection = db.meetings
        self.users_collection = db.users

    async def _extract_meeting_details(self, details: str) -> Dict[str, Any]:
        return await extract_meeting_details(details=details)

    async def _get_google_service(self, user_id: str):
        user_doc = await self.users_collection.find_one({"id": user_id})
        if not user_doc or "google_credentials" not in user_doc:
            raise Exception("User not authenticated with Google")

        creds = Credentials.from_authorized_user_info(
            json.loads(user_doc["google_credentials"]), SCOPES
        )

        # TODO: handle refresh if expired
        if not creds.valid and creds.refresh_token:
            try:
                creds.refresh(Request())
                await self.users_collection.update_one(
                    {"id": user_id},
                    {"$set": {"google_credentials": creds.to_json(),
                              "updated_at": datetime.utcnow()}}
                )
            except Exception as e:
                print(f"Failed to refresh token: {e}")
                raise Exception("Google credentials expired. Please re-authenticate.")

        return build("calendar", "v3", credentials=creds)

    async def create_google_calendar_event(self, meeting_data: MeetingCreate, user_id: str, target_user_email: str):
        service = await self._get_google_service(user_id)

        current_user = await self.users_collection.find_one({"id": user_id})
        attendees = set(meeting_data.attendees or [])
        attendees.add(current_user["email"])
        attendees.add(target_user_email)

        event = {
            "summary": meeting_data.title,
            "description": meeting_data.description,
            "start": {
                "dateTime": meeting_data.start_time.isoformat(),
                "timeZone": "UTC",
            },
            "end": {
                "dateTime": meeting_data.end_time.isoformat(),
                "timeZone": "UTC",
            },
            "attendees": [{"email": a} for a in attendees],
            "conferenceData": {
                "createRequest": {
                    "requestId": str(uuid.uuid4()),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }

        created_event = service.events().insert(
            calendarId="primary",
            body=event,
            conferenceDataVersion=1
        ).execute()

        meeting_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "email_id": meeting_data.email_id,
            "title": meeting_data.title,
            "description": meeting_data.description,
            "start_time": meeting_data.start_time,
            "end_time": meeting_data.end_time,
            "attendees": list(attendees),
            "meeting_link": created_event.get("hangoutLink", ""),
            "status": MeetingStatus.SCHEDULED,
            "platform": "google_calendar",
            "external_id": created_event.get("id"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await self.meetings_collection.insert_one(meeting_doc)
        return meeting_doc

    async def schedule_meeting_from_email(self, user_id: str, email_id: str, details: str, target_user_email: str) -> str:
        meeting_details = await self._extract_meeting_details(details)

        meeting_data = MeetingCreate(
            title=meeting_details.get("title", "Meeting"),
            description=meeting_details.get("description", ""),
            start_time=datetime.fromisoformat(meeting_details["start_time"]),
            end_time=datetime.fromisoformat(meeting_details["end_time"]),
            attendees=meeting_details.get("attendees", []),
            email_id=email_id
        )

        try:
            meeting = await self.create_google_calendar_event(meeting_data, user_id, target_user_email)
            return f"Meeting scheduled in Google Calendar: {meeting['meeting_link']}"
        except Exception as e:
            print(f"Google Calendar scheduling failed: {e}")
            return f"Failed to schedule meeting: {str(e)}"

sched_service = SchedulingService(db=db)
