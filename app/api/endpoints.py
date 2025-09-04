import os
import json
from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.core.config import settings

CLIENT_SECRETS_FILE = settings.CLIENT_SECRETS_FILE
SCOPES = settings.GMAILSCOPES
REDIRECT_URI = settings.REDIRECT_URL

router = APIRouter()

@router.get("/auth/google")
def google_auth():
    print("reid", REDIRECT_URI)
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    return {"auth_url": auth_url}


@router.get("/auth/callback")
def google_callback(code: str):
    """Step 2: Handle Google OAuth callback"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # Save credentials to token.json
    with open("token.json", "w") as f:
        f.write(credentials.to_json())

    return {"message": "Authentication successful. Now you can call /emails"}


@router.get("/get/gmails")
def get_emails():
    """Step 3: Fetch last 10 emails"""
    if not os.path.exists("token.json"):
        return JSONResponse(content={"error": "No token found. Please authenticate first."}, status_code=401)

    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    service = build("gmail", "v1", credentials=creds)

    results = service.users().messages().list(userId="me", maxResults=50).execute()
    messages = results.get("messages", [])

    emails = []
    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
        snippet = msg_data.get("snippet")
        emails.append(snippet)

    return {"emails": emails}
