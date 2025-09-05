import React, { createContext, useContext, useState, useCallback } from "react";
import { mailAPI } from "../services/api";

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [threadSummaries, setThreadSummaries] = useState({});
  const [draft, setDraft] = useState("");

  const fetchEmails = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      await mailAPI.fetchEmails(userId);
      const res = await mailAPI.getEmails(userId);
      const fetched = res.data?.emails || [];
      setEmails(fetched);
      setFilteredEmails(fetched);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmail = useCallback(
    async (emailId, userId) => {
      if (!emailId || !userId) return;

      const localEmail = emails.find(
        (e) => e.id === emailId || e._id === emailId || e.thread_id === emailId
      );

      if (localEmail) {
        setSelectedEmail(localEmail);
        return;
      }
    },
    [emails]
  );

  const filterAllEmails = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoading(true);
      try {
        await mailAPI.filterAllEmails(userId);
        await fetchEmails(userId);
      } catch (err) {
        console.error("Failed to filter all emails:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchEmails]
  );

  const summarizeEmail = useCallback(
    async (emailId, userId, mode = "short") => {
      setLoading(true);
      try {
        const res = await mailAPI.summarizeEmail(emailId, userId, mode);
        const data = res.data;
        setSummaries((prev) => ({
          ...prev,
          [emailId]: { ...(prev[emailId] || {}), [mode]: data.summary },
        }));
        return data.summary;
      } catch (err) {
        console.error("Failed to summarize email:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const summarizeThread = useCallback(
    async (threadId, userId, mode = "short") => {
      setLoading(true);
      try {
        const res = await mailAPI.summarizeThread(threadId, userId, mode);
        const data = res.data;
        setThreadSummaries((prev) => ({
          ...prev,
          [threadId]: { ...(prev[threadId] || {}), [mode]: data.summary },
        }));
        return data.summary;
      } catch (err) {
        console.error("Failed to summarize thread:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateDraftEmail = useCallback(async (userId, draftReq) => {
    setLoading(true);
    try {
      const res = await mailAPI.generateDraft(userId, draftReq);
      setDraft(res.data.draft);
      return res.data.draft;
    } catch (err) {
      console.error("Failed to generate draft:", err);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  const filterEmail = useCallback(async (emailId, userId) => {
    setLoading(true);
    try {
      const res = await mailAPI.filterEmail(emailId, userId);
      const { classification } = res.data;

      // update local state
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, classification } : e))
      );
      setFilteredEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, classification } : e))
      );

      return classification;
    } catch (err) {
      console.error("Failed to filter email:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const filterCompleteEmails = useCallback(async (userId) => {
    setLoading(true);
    try {
      const res = await mailAPI.filterAllEmails(userId);
      const classified = res.data?.classified_emails || [];

      setEmails((prev) =>
        prev.map((e) => {
          const found = classified.find((c) => c.id === e.id);
          return found ? { ...e, classification: found.classification } : e;
        })
      );
      setFilteredEmails((prev) =>
        prev.map((e) => {
          const found = classified.find((c) => c.id === e.id);
          return found ? { ...e, classification: found.classification } : e;
        })
      );

      return classified;
    } catch (err) {
      console.error("Failed to filter all emails:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <EmailContext.Provider
      value={{
        emails,
        filteredEmails,
        selectedEmail,
        loading,
        fetchEmails,
        fetchEmail,
        filterAllEmails,
        setFilteredEmails,
        summaries,
        threadSummaries,
        draft,
        summarizeEmail,
        summarizeThread,
        generateDraftEmail,
        filterEmail,
        filterCompleteEmails
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);
