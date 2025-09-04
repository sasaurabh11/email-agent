import os
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

gemini_model = genai.GenerativeModel("gemini-1.5-flash")

async def summarize_text(text: str, mode: str = "short") -> str:
    prompt = f"""
    You are an email assistant. Summarize the following email in {mode} form:
    Email:
    {text}
    """
    response = gemini_model.generate_content(prompt)
    return response.text.strip()
