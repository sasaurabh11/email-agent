from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class Email(BaseModel):
    id: str
    thread_id: str
    subject: str
    sender: str
    recipients: List[str]
    snippet: Optional[str]
    body: Optional[str]
    date: datetime
    labels: List[str] = []

class DraftRequest(BaseModel):
    recipient: str
    subject: str
    context: str = ""
    reply_to: str = ""

class MeetingStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ReminderType(str, Enum):
    FOLLOW_UP = "follow_up"
    MEETING_REMINDER = "meeting_reminder"
    DEADLINE = "deadline"

class NotificationMethod(str, Enum):
    EMAIL = "email"
    SMS = "sms"

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start_time: datetime
    end_time: datetime
    attendees: List[str]
    email_id: Optional[str] = None