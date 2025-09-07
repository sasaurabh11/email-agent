from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Email Assistant"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = Field(..., alias="DATABASE_URL")
    
    # Clerk Authentication
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="CORS_ORIGIN"
    )
    
    # AI Providers
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEY_2: str = ""
    NEBIUS_API_KEY: str = ""
    
    # Email Providers
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    CLIENT_SECRETS_FILE: str = Field(default="client_secret.json", alias="CLIENT_FILE")
    GMAILSCOPES: List[str] = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ]
    FRONTEND_URL: str = "http://localhost:5173"
    REDIRECT_URL: str = "http://localhost:8000/emails/auth/callback"
    

    CAL_COM_API_KEY: str = ""
    class Config:
        env_file = ".env"
        populate_by_name = True
        extra = "allow"


settings = Settings()
