import motor.motor_asyncio
import os
from app.core.config import settings

MONGO_URL = settings.DATABASE_URL
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client["email_assistant"]
emails_collection = db["emails"]
