from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

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