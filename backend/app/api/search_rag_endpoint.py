from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.llm_client import index_user_emails, semantic_search

router = APIRouter()

@router.post("/rag/index")
async def rag_index(user_id: str):
    res = await index_user_emails(user_id)
    return res

@router.get("/rag/search")
async def rag_search(user_id: str, q: str = Query(..., alias="q"), k: Optional[int] = 5):
    if not q:
        raise HTTPException(status_code=400, detail="Missing query parameter 'q'")
    res = await semantic_search(user_id, q, top_k=k)
    return res
