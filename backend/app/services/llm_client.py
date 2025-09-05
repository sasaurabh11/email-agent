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
    Classify this email into exactly ONE category. Respond with ONLY the category name.

    **IMPORTANT (urgent, time-sensitive):**
    - Contains: "urgent", "deadline", "asap", "immediate action required"
    - Examples: Password reset, security alerts, urgent work requests

    **WORK (professional, business-related):**
    - From: colleagues, clients, business domains
    - Contains: meetings, projects, work tasks, professional updates
    - Examples: Meeting invites, project updates, business communications

    **PERSONAL (family, friends, private):**
    - From: personal contacts, family members
    - Contains: personal news, family updates, friend communications
    - Examples: Family photos, friend messages, personal appointments

    **SOCIAL (social platforms, events, community):**
    - From: Facebook, Twitter, LinkedIn, event platforms
    - Contains: social notifications, event invites, community updates
    - Examples: "Someone tagged you", event invitations, social media notifications

    **PROMOTIONS (sales, marketing, advertisements):**
    - Contains: "sale", "discount", "offer", "deal", "% off", "buy now"
    - From: retailers, commercial senders
    - Examples: Shopping deals, product advertisements, sales notifications

    **NEWSLETTER (subscriptions, regular content):**
    - From: news sites, blogs, subscription services
    - Contains: regular updates, news digests, educational content
    - Examples: Daily news, blog updates, industry newsletters

    **SPAM (suspicious, unwanted, phishing):**
    - Suspicious sender, poor grammar, too-good-to-be-true offers
    - Contains: "claim your prize", suspicious links, phishing attempts
    - Examples: Fake lottery wins, phishing emails, obvious scams

    Email to classify:
    {text}

    Category:
    """
    response = await gemini_model.generate_content_async(prompt)
    
    classification = response.text.strip()
    
    valid_categories = ["IMPORTANT", "WORK", "PERSONAL", "SOCIAL", "PROMOTIONS", "NEWSLETTER", "SPAM"]
    
    classification_upper = classification.upper()
    for category in valid_categories:
        if category in classification_upper:
            return category
    
    return "PERSONAL"