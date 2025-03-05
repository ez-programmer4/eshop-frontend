import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Custom styled components
const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 450,
  width: "100%",
  margin: "auto",
  padding: theme.spacing(4),
  background: "linear-gradient(to bottom right, #ffffff, #f9fafb)",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  border: "1px solid #eee",
  animation: `${slideIn} 0.6s ease-out`,
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at bottom left, rgba(240, 193, 75, 0.15), transparent 70%)",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: "12px",
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  textTransform: "uppercase",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    backgroundColor: "#e0b03a",
    animation: `${pulse} 0.5s infinite`,
  },
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1, 2) },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#555",
  border: "1px solid #ddd",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 600,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  "&:hover": { backgroundColor: "#f5f5f5", transform: "scale(1.05)" },
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1, 2) },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#ddd" },
    "&:hover fieldset": { borderColor: "#f0c14b" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  "& .MuiInputLabel-root": {
    color: "#666",
    fontSize: { xs: "0.9rem", sm: "1rem" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
  "& input": { padding: { xs: "12px", sm: "14px" } },
  position: "relative",
  zIndex: 1,
}));

function Register() {
  const { register } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      register(null, null, null, token); // Pass Google token to AuthContext
      navigate("/", { replace: true }); // Replace history to avoid back navigation
    }
  }, [location, register, navigate]);

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
    window.location.href =
      "https://eshop-backend-e11f.onrender.com/api/auth/google";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle, #f7f7f7 0%, #e8ecef 100%)",
        p: { xs: 2, sm: 4 },
      }}
    >
      <AuthCard>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: "#111",
            fontWeight: 800,
            mb: 3,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {t("Sign Up")}
        </Typography>
        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              textAlign: "center",
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
              bgcolor: "#ffebee",
              p: 1,
              borderRadius: "8px",
              fontWeight: 500,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              position: "relative",
              zIndex: 1,
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
          <AuthButton type="submit" fullWidth sx={{ mt: 3 }}>
            {t("Register")}
          </AuthButton>
        </form>
        <Divider
          sx={{
            my: 3,
            color: "#666",
            "&::before, &::after": { borderColor: "#ddd" },
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            position: "relative",
            zIndex: 1,
          }}
        >
          {t("or")}
        </Divider>
        <GoogleButton
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignup}
        >
          {t("Sign up with Google")}
        </GoogleButton>
        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            color: "#666",
            position: "relative",
            zIndex: 1,
          }}
        >
          {t("Already have an account?")}{" "}
          <Button
            color="primary"
            onClick={() => navigate("/login")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: "#f0c14b" },
            }}
          >
            {t("Log in")}
          </Button>
        </Typography>
      </AuthCard>
    </Box>
  );
}

export default Register;
