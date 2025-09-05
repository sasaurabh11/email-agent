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
  exchangeCode: (code) => api.get("/emails/auth/callback", { params: { code } }),
};

export const mailAPI = {
  fetchEmails: (userId) => api.get("/mails/fetch", { params: { user_id: userId } }),
  getEmails: (userId) => api.get("/mails", { params: { user_id: userId } }),
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const emailAPI = {
  getEmails: (userId) => api.get(`/emails/mails?user_id=${userId}`),
  fetchEmails: (userId) => api.get(`/emails/mails/fetch?user_id=${userId}`),
  filterEmail: (emailId, userId) =>
    api.post(`/filtering/emails/${emailId}/filter?user_id=${userId}`),
  filterAllEmails: (userId) =>
    api.post(`/filtering/emails/filter-all?user_id=${userId}`),
  summarizeEmail: (emailId, userId, mode) =>
    api.post(
      `/summarize/emails/${emailId}/summarize?user_id=${userId}&mode=${mode}`
    ),
  summarizeThread: (threadId, userId, mode) =>
    api.post(
      `/summarize/threads/${threadId}/summarize?user_id=${userId}&mode=${mode}`
    ),
  generateDraft: (userId, draftData) =>
    api.post(`/summarize/drafts/generate?user_id=${userId}`, draftData),
};

export default api;
