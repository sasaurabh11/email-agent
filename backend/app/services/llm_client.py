import os
import json
import google.generativeai as genai
from app.core.config import settings
from app.services.rag_system import RAGSystem
from app.core.mongo import emails_collection
from typing import Dict, Any
from datetime import datetime, timedelta

genai.configure(api_key=settings.GEMINI_API_KEY)
rag = RAGSystem()

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


async def analyze_writing_style(text: str) -> str:
    prompt = f"""
    Analyze the following emails and describe the user's writing style
    (tone, formality, vocabulary, sentence structure, politeness, etc).
    Provide a short profile of their style:

    {text}
    """
    response = await gemini_model.generate_content_async(prompt)
    return response.text.strip()

async def generate_personalized_email(
    profile: str,
    recipient: str,
    subject: str,
    context: str,
    reply_to: str = ""
) -> str:
    if reply_to:
        prompt = f"""
        You are replying to the following email:
        ---
        {reply_to}
        ---

        Write a reply email to {recipient}.
        Subject: {subject}
        Context (instructions from user): {context}

        Write in the following style profile:
        {profile}
        """
    else:
        prompt = f"""
        Write an email to {recipient}.
        Subject: {subject}
        Context: {context}

        Write in the following style profile:
        {profile}
        """

    response = await gemini_model.generate_content_async(prompt)
    return response.text.strip()


async def index_user_emails(user_id: str):
    cursor = emails_collection.find({"user_id": user_id})
    count = 0
    async for e in cursor:
        body = e.get("body") or e.get("snippet") or ""
        if not body:
            continue
        meta = {
            "email_id": e["id"],
            "thread_id": e.get("thread_id"),
            "user_id": user_id,
            "subject": e.get("subject", ""),
            "sender": e.get("sender", ""),
            "date": str(e.get("date"))
        }
        count += rag.add_document(doc_id=e["id"], text=body, metadata=meta)
    return {"status": "indexed", "chunks": count}

async def semantic_search(user_id: str, query: str, top_k: int = 5) -> Dict[str, Any]:
    results = rag.search(query, n_results=top_k)
    if not results:
        return {
            "answer": "No relevant results found.",
            "sources": [],
            "raw_matches": []
        }

    context_text = "\n\n".join(
        [f"From: {r['metadata'].get('sender')}\nSubject: {r['metadata'].get('subject')}\n{r['content']}"
         for r in results]
    )
    prompt = f"""
You are an assistant helping the user search their emails.

User query: {query}

Relevant email excerpts:
{context_text}

Task:
- Provide a clear, concise answer (3-5 sentences).
- Then list the most relevant sources with subject, sender, and a one-line excerpt.
Return JSON with keys: answer, sources.
"""
    resp = gemini_model.generate_content(prompt)

    import json
    try:
        parsed = json.loads(resp.text)
        answer = parsed.get("answer", resp.text)
        sources = parsed.get("sources", [])
    except Exception:
        answer = resp.text
        sources = [
            {
                "email_id": r["metadata"].get("email_id"),
                "subject": r["metadata"].get("subject"),
                "sender": r["metadata"].get("sender"),
                "excerpt": r["content"][:120],
                "score": r["score"]
            } for r in results
        ]

    raw_matches = [
        {
            "email_id": r["metadata"].get("email_id"),
            "thread_id": r["metadata"].get("thread_id"),
            "subject": r["metadata"].get("subject"),
            "sender": r["metadata"].get("sender"),
            "date": r["metadata"].get("date"),
            "excerpt": r["content"][:200], 
            "score": r["score"]
        } for r in results
    ]

    return {
        "answer": answer,
        "sources": sources,
        "raw_matches": raw_matches
    }

async def extract_meeting_details(details: str) -> Dict[str, Any]:
        now = datetime.utcnow()
        now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
        prompt = f"""
        You are an assistant that extracts meeting scheduling details from email text.

        Current date and time: {now_str}

        Email content:
        {details}

        Instructions:
        - Always interpret relative dates like "today", "tomorrow", "next Monday"
        based on the current date and time provided above.
        - Use ISO 8601 format for times (YYYY-MM-DDTHH:MM:SS).
        - The year must always be {now.year} or later (never in the past).

        Please return ONLY a valid JSON object with these fields:
        - title: short meeting title (string)
        - description: brief description (string)
        - start_time: start time in ISO 8601 format
        - end_time: end time in ISO 8601 format
        - attendees: list of email addresses
        """

        try:
            response = await gemini_model.generate_content_async(prompt)

            cleaned = response.text.strip().strip("```json").strip("```")

            data = json.loads(cleaned)

            start = datetime.fromisoformat(data.get("start_time", now.isoformat()))
            end = datetime.fromisoformat(data.get("end_time", (now + timedelta(hours=1)).isoformat()))

            if start < now:
                start = now + timedelta(hours=1)
            if end <= start:
                end = start + timedelta(hours=1)

            return {
                "title": data.get("title", "Meeting"),
                "description": data.get("description", details[:200]),
                "start_time": data.get("start_time", datetime.utcnow().isoformat()),
                "end_time": data.get("end_time", (datetime.utcnow() + timedelta(hours=1)).isoformat()),
                "attendees": data.get("attendees", []),
            }

        except Exception as e:
            print(f"Gemini extraction failed: {e}")
            return {
                "title": "Meeting",
                "description": details[:200],
                "start_time": datetime.utcnow().isoformat(),
                "end_time": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                "attendees": [],
            }

