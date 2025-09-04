from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Email Assistant"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Clerk Authentication
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")
    CLERK_PUBLISHABLE_KEY: str = os.getenv("CLERK_PUBLISHABLE_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["CORS_ORIGIN",  "http://localhost:3000", "http://127.0.0.1:3000"]
    
    # AI Providers
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    NEBIUS_API_KEY: str = os.getenv("NEBIUS_API_KEY", "")
    
    # Vector Database
    WEAVIATE_URL: str = os.getenv("WEAVIATE_URL", "http://localhost:8080")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    
    # Email Providers
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    CLIENT_SECRETS_FILE: str = os.getenv("CLIENT_FILE", "client_secret.json")
    GMAILSCOPES: List[str] = ["https://www.googleapis.com/auth/gmail.readonly"]
    REDIRECT_URL: str = os.getenv("REDIRECT_URL", "http://localhost:8000/emails/auth/callback")
    
    class Config:
        env_file = ".env"

settings = Settings()