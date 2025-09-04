from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
# from app.api.endpoints import auth, emails, ai, search, teams
# from app.core.security import get_current_user
from app.api import endpoints

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(emails.router, prefix="/emails", tags=["emails"], dependencies=[Depends(get_current_user)])
# app.include_router(ai.router, prefix="/ai", tags=["ai"], dependencies=[Depends(get_current_user)])
# app.include_router(search.router, prefix="/search", tags=["search"], dependencies=[Depends(get_current_user)])
# app.include_router(teams.router, prefix="/teams", tags=["teams"], dependencies=[Depends(get_current_user)])

app.include_router(endpoints.router, prefix="/emails", tags=["emails"])

@app.get("/")
async def root():
    return {"message": "Email Workflow Assistant API", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}