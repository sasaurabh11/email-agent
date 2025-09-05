import React, { createContext, useContext, useState, useCallback } from "react";
import { emailAPI } from "../services/api";

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmails = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      await emailAPI.fetchEmails(userId);
      const res = await emailAPI.getEmails(userId);
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
        await emailAPI.filterAllEmails(userId);
        await fetchEmails(userId);
      } catch (err) {
        console.error("Failed to filter all emails:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchEmails]
  );

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
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);
