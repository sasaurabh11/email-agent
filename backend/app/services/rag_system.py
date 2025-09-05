import os
from datetime import datetime
from typing import List, Dict, Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from app.core.config import settings

CHROMA_DB_PATH = "data/chroma_db"
GEMINI_API_KEY = settings.GEMINI_API_KEY

class RAGSystem:
    def __init__(self):
        print("Initializing RAG system with Chroma + Gemini embeddings...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=GEMINI_API_KEY,
        )

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )

        try:
            self.vectorstore = Chroma(
                persist_directory=CHROMA_DB_PATH,
                embedding_function=self.embeddings
            )
            if not hasattr(self.vectorstore, "_collection"):
                raise Exception("Chroma collection not initialized properly")
        except Exception as e:
            print(f"Failed to initialize Chroma: {str(e)}")
            raise

    def add_document(self, doc_id: str, text: str, metadata: dict = None) -> int:
        """Split, embed and add one document (email)."""
        self.delete_document(doc_id, silent=True)
        chunks = self.text_splitter.split_text(text)
        documents = [
            Document(
                page_content=chunk,
                metadata={
                    "doc_id": doc_id,
                    "chunk_index": i,
                    "created_at": datetime.utcnow().isoformat(),
                    **(metadata or {})
                }
            ) for i, chunk in enumerate(chunks)
        ]
        if documents:
            self.vectorstore.add_documents(documents)
            return len(documents)
        return 0

    def delete_document(self, doc_id: str, silent: bool = False) -> int:
        """Delete all chunks for a given doc_id (email)."""
        collection = self.vectorstore._collection
        existing = collection.get(where={"doc_id": doc_id})
        if existing and existing.get("ids"):
            collection.delete(where={"doc_id": doc_id})
            return len(existing["ids"])
        elif not silent:
            print(f"No chunks found for document {doc_id}")
        return 0

    def search(self, query: str, n_results: int = 5, doc_id: str = None) -> List[Dict]:
        """Vector similarity search with optional filtering by doc_id."""
        try:
            filters = {"doc_id": doc_id} if doc_id else None
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=n_results,
                filter=filters
            )
            return [
                {
                    "content": doc.page_content,
                    "score": float(score),
                    "metadata": doc.metadata
                }
                for doc, score in results
            ]
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []

    def get_relevant_content(
        self, query: str, max_tokens: int = 120000, doc_id: Optional[str] = None
    ) -> List[Dict]:
        """Get chunks relevant to a query without exceeding token budget."""
        try:
            all_results = []
            token_count = 0
            n_results = 20

            if doc_id:
                results = self.search(query, n_results=n_results, doc_id=doc_id)
                for result in results:
                    content = result["content"]
                    estimated_tokens = len(content.split()) * 1.33
                    if token_count + estimated_tokens <= max_tokens:
                        all_results.append(result)
                        token_count += estimated_tokens
                if token_count >= max_tokens * 0.8:
                    return all_results

            remaining_tokens = max_tokens - token_count
            if remaining_tokens > 10000:
                results = self.search(query, n_results=n_results)
                for result in results:
                    if doc_id and result["metadata"].get("doc_id") == doc_id:
                        continue
                    content = result["content"]
                    estimated_tokens = len(content.split()) * 1.33
                    if token_count + estimated_tokens <= max_tokens:
                        all_results.append(result)
                        token_count += estimated_tokens
                    else:
                        break

            all_results.sort(key=lambda x: x["score"], reverse=True)
            return all_results

        except Exception as e:
            print(f"Error in get_relevant_content: {str(e)}")
            return []
