import os
import base64
from datetime import datetime
from email import message_from_bytes

from fastapi import APIRouter
from fastapi.responses import JSONResponse, RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings
from app.core.mongo import emails_collection
from typing import Dict, List, Optional

CLIENT_SECRETS_FILE = settings.CLIENT_SECRETS_FILE
SCOPES = settings.GMAILSCOPES
REDIRECT_URI = settings.REDIRECT_URL

router = APIRouter()

# ---------------------- Helpers ---------------------- #

def decode_base64_data(data: str) -> str:
    try:
        decoded_bytes = base64.urlsafe_b64decode(data + '=' * (4 - len(data) % 4))
        return decoded_bytes.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error decoding base64 data: {e}")
        return ""

def extract_body_from_parts(parts: List[Dict]) -> Dict[str, str]:
    plain_text = ""
    html_content = ""
    
    for part in parts:
        mime_type = part.get('mimeType', '')
        
        if 'parts' in part:
            nested_result = extract_body_from_parts(part['parts'])
            if not plain_text and nested_result['plain']:
                plain_text = nested_result['plain']
            if not html_content and nested_result['html']:
                html_content = nested_result['html']
        
        elif 'body' in part and 'data' in part['body']:
            content = decode_base64_data(part['body']['data'])
            
            if mime_type == 'text/plain' and not plain_text:
                plain_text = content
            elif mime_type == 'text/html' and not html_content:
                html_content = content
    
    return {'plain': plain_text, 'html': html_content}

def extract_body_from_payload(payload: Dict) -> Dict[str, str]:
    mime_type = payload.get('mimeType', '')
    
    if 'body' in payload and 'data' in payload['body']:
        content = decode_base64_data(payload['body']['data'])
        if mime_type == 'text/plain':
            return {'plain': content, 'html': ''}
        elif mime_type == 'text/html':
            return {'plain': '', 'html': content}
    
    if 'parts' in payload:
        return extract_body_from_parts(payload['parts'])
    
    return {'plain': '', 'html': ''}

def parse_email(msg_data: Dict) -> Dict:
    payload = msg_data.get("payload", {})
    headers = payload.get("headers", [])

    subject = next((h["value"] for h in headers if h["name"] == "Subject"), "")
    sender = next((h["value"] for h in headers if h["name"] == "From"), "")
    to = [h["value"] for h in headers if h["name"] == "To"]
    
    date_str = next((h["value"] for h in headers if h["name"] == "Date"), "")
    try:
        date = datetime.strptime(date_str.split(' (')[0], "%a, %d %b %Y %H:%M:%S %z")
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        date = datetime.utcnow()

    body_data = extract_body_from_payload(payload)
    
    body = body_data['plain'] or body_data['html'] or msg_data.get("snippet", "")
    
    return {
        "id": msg_data["id"],
        "thread_id": msg_data["threadId"],
        "subject": subject,
        "sender": sender,
        "recipients": to,
        "snippet": msg_data.get("snippet", ""),
        "body": body,
        "plain_body": body_data['plain'],
        "html_body": body_data['html'],
        "date": date,
        "labels": msg_data.get("labelIds", []),
        "size_estimate": msg_data.get("sizeEstimate", 0)
    }

# ---------------------- Routes ---------------------- #

@router.get("/auth/google")
def google_auth():
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
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials

    with open("token.json", "w") as f:
        f.write(credentials.to_json())

    frontend_url = f"{settings.FRONTEND_URL}/auth/callback?code={code}"
    return RedirectResponse(url=frontend_url)


@router.get("/mails/fetch")
async def fetch_emails(user_id: str):
    if not os.path.exists("token.json"):
        return JSONResponse(content={"error": "No token found. Please authenticate first."}, status_code=401)

    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    service = build("gmail", "v1", credentials=creds)

    results = service.users().messages().list(userId="me", maxResults=20).execute()
    messages = results.get("messages", [])

    stored_emails = []
    for msg in messages:
        try:
            msg_data = service.users().messages().get(userId="me", id=msg["id"], format='full').execute()
            
            email_doc = parse_email(msg_data)
            email_doc["user_id"] = user_id

            await emails_collection.update_one(
                {"id": email_doc["id"], "user_id": user_id},
                {"$set": email_doc},
                upsert=True,
            )
            stored_emails.append(email_doc)
            
        except Exception as e:
            print(f"Error processing message {msg['id']}: {e}")
            continue

    return {"status": "success", "emails": stored_emails, "count": len(stored_emails)}


@router.get("/mails")
async def get_emails(user_id: str):
    emails_cursor = emails_collection.find({"user_id": user_id}).sort("date", -1)
    emails = await emails_cursor.to_list(length=50)

    for email in emails:
        email["_id"] = str(email["_id"])

    return {"emails": emails}
