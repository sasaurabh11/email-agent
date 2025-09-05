import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EmailProvider } from "./context/EmailContext";
import Layout from "./components/layout/Layout";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Login from './pages/Login';
import Callback from "./pages/Callback";
import Dashboard from './pages/Dashboard';
import Emails from './pages/Emails';
import Summaries from './pages/Summaries';
import Settings from './pages/Settings';
import "./index.css";
import FilteredEmailsPage from "./pages/FilteredEmails";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  return !isAuthenticated ? children : <Navigate to="/" />;
};


function App() {
  return (
    <BrowserRouter>
        <AuthProvider>
          <EmailProvider>
            <Layout>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route path="/auth/callback" element={<Callback />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emails"
                  element={
                    <ProtectedRoute>
                      <Emails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summaries"
                  element={
                    <ProtectedRoute>
                      <Summaries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/filter"
                  element={
                    <ProtectedRoute>
                      <FilteredEmailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
            {/* <Notification /> */}
          </EmailProvider>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
