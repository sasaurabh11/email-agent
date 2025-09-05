import React, { createContext, useContext, useReducer } from 'react';
import { emailAPI } from '../services/api';
import { useApp } from './AppContext';

const EmailContext = createContext();

const emailReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EMAILS':
      return { ...state, emails: action.payload };
    case 'SET_SELECTED_EMAIL':
      return { ...state, selectedEmail: action.payload };
    case 'SET_FILTERED_EMAILS':
      return { ...state, filteredEmails: action.payload };
    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map(email => 
          email.id === action.payload.id ? action.payload : email
        ),
        selectedEmail: state.selectedEmail?.id === action.payload.id 
          ? action.payload 
          : state.selectedEmail,
      };
    case 'SET_SUMMARY':
      return {
        ...state,
        summaries: {
          ...state.summaries,
          [action.payload.email_id]: {
            ...state.summaries[action.payload.email_id],
            [action.payload.mode]: action.payload.summary,
          },
        },
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    default:
      return state;
  }
};

const initialState = {
  emails: [],
  selectedEmail: null,
  filteredEmails: [],
  summaries: {},
  filters: {
    classification: 'all',
    search: '',
  },
};

export const EmailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emailReducer, initialState);
  const { setLoading, setError, setNotification } = useApp();

  const fetchEmails = async (userId) => {
    try {
      setLoading(true);
      const response = await emailAPI.getEmails(userId);
      dispatch({ type: 'SET_EMAILS', payload: response.data.emails });
      dispatch({ type: 'SET_FILTERED_EMAILS', payload: response.data.emails });
    } catch (error) {
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmail = async (emailId, userId) => {
    try {
      setLoading(true);
      const response = await emailAPI.getEmails(userId);
      const email = response.data.emails.find(e => e.id === emailId);
      if (email) {
        dispatch({ type: 'SET_SELECTED_EMAIL', payload: email });
      }
    } catch (error) {
      setError('Failed to fetch email');
    } finally {
      setLoading(false);
    }
  };

  const filterEmail = async (emailId, userId) => {
    try {
      setLoading(true);
      const response = await emailAPI.filterEmail(emailId, userId);
      dispatch({ type: 'UPDATE_EMAIL', payload: response.data });
      setNotification('Email filtered successfully');
    } catch (error) {
      setError('Failed to filter email');
    } finally {
      setLoading(false);
    }
  };

  const filterAllEmails = async (userId) => {
    try {
      setLoading(true);
      const response = await emailAPI.filterAllEmails(userId);
      setNotification('All emails filtered successfully');
      await fetchEmails(userId);
    } catch (error) {
      setError('Failed to filter all emails');
    } finally {
      setLoading(false);
    }
  };

  const summarizeEmail = async (emailId, userId, mode = 'short') => {
    try {
      setLoading(true);
      const response = await emailAPI.summarizeEmail(emailId, userId, mode);
      dispatch({ type: 'SET_SUMMARY', payload: response.data });
      setNotification('Email summarized successfully');
      return response.data.summary;
    } catch (error) {
      setError('Failed to summarize email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const summarizeThread = async (threadId, userId, mode = 'short') => {
    try {
      setLoading(true);
      const response = await emailAPI.summarizeThread(threadId, userId, mode);
      setNotification('Thread summarized successfully');
      return response.data.summary;
    } catch (error) {
      setError('Failed to summarize thread');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = async (userId, draftData) => {
    try {
      setLoading(true);
      const response = await emailAPI.generateDraft(userId, draftData);
      setNotification('Draft generated successfully');
      return response.data.draft;
    } catch (error) {
      setError('Failed to generate draft');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    
    let filtered = state.emails;
    
    if (filters.classification !== 'all') {
      filtered = filtered.filter(email => 
        email.classification === filters.classification
      );
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchTerm) ||
        email.sender.toLowerCase().includes(searchTerm) ||
        email.snippet.toLowerCase().includes(searchTerm)
      );
    }
    
    dispatch({ type: 'SET_FILTERED_EMAILS', payload: filtered });
  };

  return (
    <EmailContext.Provider value={{
      ...state,
      fetchEmails,
      fetchEmail,
      filterEmail,
      filterAllEmails,
      summarizeEmail,
      summarizeThread,
      generateDraft,
      applyFilters,
    }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};