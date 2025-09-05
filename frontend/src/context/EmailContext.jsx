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

  const fetchEmails = useCallback(
    async (userId, force = false) => {
      if (!userId) return;

      if (emails.length > 0 && !force) {
        return;
      }

      setLoading(true);
      try {
        const alreadyFetched = sessionStorage.getItem("emails_synced");

        if (!alreadyFetched || force) {
          await mailAPI.fetchEmails(userId);
          sessionStorage.setItem("emails_synced", "true");
        }

        if (emails.length === 0 || force) {
          const res = await mailAPI.getEmails(userId);
          const response = res.data;

          if (response.emails && Array.isArray(response.emails)) {
            const sortedEmails = response.emails.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            setEmails(sortedEmails);
            setFilteredEmails(sortedEmails);
          } else {
            console.warn("Invalid email response format:", response);
            setEmails([]);
            setFilteredEmails([]);
          }

          mailAPI.ragIndex(userId);
        }
      } catch (err) {
        console.error("Failed to fetch emails:", err);
      } finally {
        setLoading(false);
      }
    },
    [emails]
  );

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

  const generateReplyDraft = useCallback(async (userId, draftReq) => {
    setLoading(true);
    try {
      const res = await mailAPI.generateReplyDraft(userId, draftReq);
      return res.data.draft;
    } catch (err) {
      console.error("Failed to generate reply draft:", err);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

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
        filterCompleteEmails,
        generateReplyDraft
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);
