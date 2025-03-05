// src/components/GoogleAuthCallback.jsx
import React, { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

function GoogleAuthCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      login(null, null, token); // Pass Google token to AuthContext
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true }); // Fallback if no token
    }
  }, [location, login, navigate]);

  return null; // No UI needed, just redirect
}

export default GoogleAuthCallback;
