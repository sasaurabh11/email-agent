import os
import base64
from datetime import datetime
from email import message_from_bytes

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings
from app.core.mongo import emails_collection

CLIENT_SECRETS_FILE = settings.CLIENT_SECRETS_FILE
SCOPES = settings.GMAILSCOPES
REDIRECT_URI = settings.REDIRECT_URL

router = APIRouter()

# ---------------------- Helpers ---------------------- #

def parse_email(msg_data: dict) -> dict:
    """Parse Gmail API message into structured format"""
    payload = msg_data.get("payload", {})
    headers = payload.get("headers", [])

    subject = next((h["value"] for h in headers if h["name"] == "Subject"), "")
    sender = next((h["value"] for h in headers if h["name"] == "From"), "")
    to = [h["value"] for h in headers if h["name"] == "To"]

    date_str = next((h["value"] for h in headers if h["name"] == "Date"), "")
    try:
        date = datetime.strptime(date_str[:31], "%a, %d %b %Y %H:%M:%S %z")
    except Exception:
        date = datetime.utcnow()

    # Decode plain text body
    body = ""
    if "parts" in payload:
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain" and "data" in part["body"]:
                try:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                except Exception:
                    body = ""

    return {
        "id": msg_data["id"],
        "thread_id": msg_data["threadId"],
        "subject": subject,
        "sender": sender,
        "recipients": to,
        "snippet": msg_data.get("snippet", ""),
        "body": body,
        "date": date,
        "labels": msg_data.get("labelIds", []),
    }

# ---------------------- Routes ---------------------- #

@router.get("/auth/google")
def google_auth():
    """Step 1: Redirect user to Google OAuth"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return {"auth_url": auth_url}


@router.get("/auth/callback")
def google_callback(code: str):
    """Step 2: Handle Google OAuth callback"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # Save credentials to file
    with open("token.json", "w") as f:
        f.write(credentials.to_json())

    return {"message": "Authentication successful. Now you can call /emails/fetch"}


@router.get("/mails/fetch")
async def fetch_emails(user_id: str):
    """Step 3: Fetch emails from Gmail API and store in MongoDB"""
    if not os.path.exists("token.json"):
        return JSONResponse(content={"error": "No token found. Please authenticate first."}, status_code=401)

    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    service = build("gmail", "v1", credentials=creds)

    results = service.users().messages().list(userId="me", maxResults=20).execute()
    messages = results.get("messages", [])

    stored_emails = []
    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
        email_doc = parse_email(msg_data)
        email_doc["user_id"] = user_id

        # Upsert into MongoDB
        await emails_collection.update_one(
            {"id": email_doc["id"], "user_id": user_id},
            {"$set": email_doc},
            upsert=True,
        )
        stored_emails.append(email_doc)

    return {"status": "success", "emails": stored_emails}


@router.get("/emails")
async def get_emails(user_id: str):
    """Step 4: Retrieve stored emails from MongoDB"""
    emails_cursor = emails_collection.find({"user_id": user_id}).sort("date", -1)
    emails = await emails_cursor.to_list(length=50)
    return {"emails": emails}
