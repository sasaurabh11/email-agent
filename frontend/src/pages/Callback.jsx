import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback = () => {
  const [params] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get("code");
    console.log("code", code)
    if (code) {
      handleCallback(code).then(() => {
        navigate("/");
      });
    }
  }, [params, handleCallback, navigate]);

  return <div>Completing authentication...</div>;
};

export default Callback;
