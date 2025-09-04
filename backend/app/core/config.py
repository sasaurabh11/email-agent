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
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="CORS_ORIGIN"
    )
    
    # AI Providers
    GEMINI_API_KEY: str = ""
    NEBIUS_API_KEY: str = ""
    
    # Vector Database
    WEAVIATE_URL: str = "http://localhost:8080"
    QDRANT_URL: str = "http://localhost:6333"
    
    # Email Providers
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    CLIENT_SECRETS_FILE: str = Field(default="client_secret.json", alias="CLIENT_FILE")
    GMAILSCOPES: List[str] = ["https://www.googleapis.com/auth/gmail.readonly"]
    REDIRECT_URL: str = "http://localhost:8000/emails/auth/callback"
    
    class Config:
        env_file = ".env"
        populate_by_name = True
        extra = "allow"


settings = Settings()
