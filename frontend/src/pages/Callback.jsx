import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback = () => {
  const [params] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get("code");
    if (code) {
      handleCallback(code).then(() => {
        navigate("/");
      });
    }
  }, []);

  return <div>Completing authentication...</div>;
};

export default Callback;
