import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  getAuthUrl: () => api.get("/emails/auth/google"),
};

export const mailAPI = {
  fetchEmails: (userId) =>
    api.get("/emails/mails/fetch", { params: { user_id: userId } }),
  getEmails: (userId) =>
    api.get("/emails/mails", { params: { user_id: userId } }),

  summarizeEmail: (emailId, userId, mode = "short") =>
    api.post(`/summarize/emails/${emailId}/summarize`, null, {
      params: { user_id: userId, mode },
    }),

  summarizeThread: (threadId, userId, mode = "short") =>
    api.post(`/summarize/threads/${threadId}/summarize`, null, {
      params: { user_id: userId, mode },
    }),

  generateDraft: (userId, draft) =>
    api.post(`/summarize/drafts/generate`, draft, {
      params: { user_id: userId },
    }),

  filterEmail: (emailId, userId) =>
    api.post(`/filtering/emails/${emailId}/filter`, null, {
      params: { user_id: userId },
    }),

  filterAllEmails: (userId) =>
    api.post(`/filtering/emails/filter-all`, null, {
      params: { user_id: userId },
    }),

  generateReplyDraft: (userId, draftReq) =>
    api.post(`/personalized/drafts/reply?user_id=${userId}`, draftReq),

  ragIndex: async (userId) => {
    try {
      await api.post(`/search/rag/index?user_id=${userId}`);
    } catch (err) {
      console.error("RAG indexing failed:", err);
    }
  },
  ragSearch: async (userId, query, k = 5) => {
    const res = await api.get(`/search/rag/search`, {
      params: { user_id: userId, q: query, k }
    });
    return res.data;
  }

};

export const  agentAPI = {
  callAgent: async (emailId, user) => {
    try {
      const res = await api.post(`/think/agent/run/${emailId}?user_id=${user.id}`)
      return res.data;
    } catch (error) {
      console.error("agent error:", err);
    }
  }
}

export default api;
