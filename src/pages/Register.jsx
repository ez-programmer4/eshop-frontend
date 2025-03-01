// src/components/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  IconButton,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google"; // For Google signup
import axios from "axios";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Custom styled components
const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 400,
  width: "100%",
  margin: "auto",
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  border: "1px solid #eee",
  animation: `${slideIn} 0.5s ease-out`,
}));

const AuthButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: theme.spacing(1.5, 2),
  borderRadius: "8px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#e0b03a",
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#555",
  border: "1px solid #ccc",
  padding: theme.spacing(1.5, 2),
  borderRadius: "8px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#f5f5f5",
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#999",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1976d2",
  },
}));

function Register() {
  const { register } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setNameError("");

    if (!name.trim()) {
      setNameError(t("Name is required"));
      valid = false;
    } else if (name.length < 2) {
      setNameError(t("Name must be at least 2 characters"));
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(t("Email is required"));
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError(t("Invalid email format"));
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError(t("Password is required"));
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(t("Password must be at least 6 characters"));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data.message || t("Registration failed"));
      console.error("Registration error:", err);
    }
  };

  const handleGoogleSignup = () => {
    // Placeholder for Google OAuth - requires backend setup
    window.location.href = "http://localhost:5000/api/auth/google"; // Redirect to backend Google OAuth route
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "#f7f7f7",
        p: { xs: 2, sm: 4 },
      }}
    >
      <AuthCard>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ color: "#111", fontWeight: 700, mb: 3, textAlign: "center" }}
        >
          {t("Sign Up")}
        </Typography>
        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              textAlign: "center",
              fontSize: { xs: 12, sm: 14 },
              bgcolor: "#ffebee",
              p: 1,
              borderRadius: 2,
            }}
          >
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label={t("Name")}
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
          />
          <StyledTextField
            label={t("Email")}
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
          />
          <StyledTextField
            label={t("Password")}
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />
          <AuthButton type="submit" fullWidth sx={{ mt: 2 }}>
            {t("Register")}
          </AuthButton>
        </form>
        <Divider sx={{ my: 2, color: "#555" }}>{t("or")}</Divider>
        <GoogleButton
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignup}
        >
          {t("Sign up with Google")}
        </GoogleButton>
        <Typography
          sx={{
            mt: 2,
            textAlign: "center",
            fontSize: { xs: 12, sm: 14 },
            color: "#555",
          }}
        >
          {t("Already have an account?")}{" "}
          <Button color="primary" onClick={() => navigate("/login")}>
            {t("Log in")}
          </Button>
        </Typography>
      </AuthCard>
    </Box>
  );
}

export default Register;
