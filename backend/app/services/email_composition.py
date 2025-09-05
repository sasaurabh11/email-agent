from app.core.mongo import emails_collection
from app.services.llm_client import analyze_writing_style

async def get_user_writing_samples(user_id: str, limit: int = 20) -> list[str]:
    cursor = emails_collection.find(
        {"user_id": user_id},
        projection={"body": 1},
    ).sort("date", -1).limit(limit)
    emails = await cursor.to_list(length=limit)
    return [e["body"] for e in emails if e.get("body")]

async def build_user_profile(user_id: str) -> str:
    samples = await get_user_writing_samples(user_id)
    if not samples:
        return "Neutral, professional, concise writing style."

    combined = "\n\n".join(samples[:10]) 
    profile = await analyze_writing_style(combined)
    return profile