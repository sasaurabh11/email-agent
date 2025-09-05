import React from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated, user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!isAuthenticated ? (
        <button
          onClick={login}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <p>Welcome! User ID: {user?.id}</p>
          <button
            onClick={logout}
            className="px-4 py-2 mt-4 bg-red-600 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
