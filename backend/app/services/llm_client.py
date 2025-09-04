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

async def generate_draft(recipient: str, subject: str, context: str = "") -> str:
    prompt = f"""
    Write a professional email draft to {recipient}.
    Subject: {subject}
    Context: {context}
    Tone: polite, clear, concise, Proffesional.
    """
    response = await gemini_model.generate_content_async(prompt)
    return response.text.strip()

async def classify_email(text: str) -> str:
    prompt = f"""
    Classify this email into one of these categories: Important, Work, Personal, Social, Promotions, Newsletter, Spam.
    Email content:
    {text}
    """
    response = await gemini_model.generate_content_async(prompt)
    return response.text.strip()