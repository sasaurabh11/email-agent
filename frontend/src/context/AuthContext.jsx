import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { authAPI, mailAPI } from "../services/api";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (token && userId) {
      dispatch({
        type: "SET_USER",
        payload: { id: userId },
      });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  };

  const login = async () => {
    try {
      const res = await authAPI.getAuthUrl();
      window.location.href = res.data.auth_url;
    } catch (error) {
      console.error("Failed to initiate login:", error);
    }
  };

  const handleCallback = async (code) => {
    try {
      await authAPI.exchangeCode(code);

      // Generate unique user id for this client
      const userId = uuidv4();
      localStorage.setItem("user_id", userId);

      dispatch({
        type: "SET_USER",
        payload: { id: userId },
      });
    } catch (error) {
      console.error("Failed to complete authentication:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
