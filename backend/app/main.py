from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import email_endpoint, summarise_endpoint, filtering_endpoint, email_composition_endpoint, search_rag_endpoint
from app.core import mongo 

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(email_endpoint.router, prefix="/emails", tags=["emails"])
app.include_router(summarise_endpoint.router, prefix="/summarize", tags=["summaries"])
app.include_router(filtering_endpoint.router, prefix="/filtering", tags=["filtering"])
app.include_router(email_composition_endpoint.router, prefix="/personalized", tags=["personalized"])
app.include_router(search_rag_endpoint.router, prefix="/search", tags=["search"])

@app.on_event("startup")
async def startup_db_client():
    print("✅ Connecting to MongoDB...")
    try:
        # test connection
        await mongo.client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

@app.on_event("shutdown")
async def shutdown_db_client():
    mongo.client.close()
    print("🔌 MongoDB connection closed")

@app.get("/")
async def root():
    return {"message": "Email Workflow Assistant API", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}