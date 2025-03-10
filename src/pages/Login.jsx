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
  CircularProgress,
  Fade,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Custom styled components
const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  width: "100%",
  margin: "auto",
  padding: theme.spacing(4),
  background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(240, 193, 75, 0.2)",
  animation: `${slideIn} 0.6s ease-out`,
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(240, 193, 75, 0.2), transparent 70%)",
    transform: "rotate(30deg)",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    borderRadius: "16px",
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(to right, #f0c14b, #e0b03a)",
  color: "#111",
  padding: theme.spacing(1.5, 4),
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  textTransform: "uppercase",
  boxShadow: "0 4px 12px rgba(240, 193, 75, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(to right, #e0b03a, #d0a029)",
    boxShadow: "0 6px 18px rgba(240, 193, 75, 0.6)",
    animation: `${pulse} 0.5s infinite`,
  },
  "&:disabled": {
    background: "#ccc",
    boxShadow: "none",
  },
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1, 3) },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#444",
  border: "1px solid #e0e0e0",
  padding: theme.spacing(1.5, 4),
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f9f9f9",
    transform: "scale(1.03)",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  },
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1, 3) },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#f0c14b" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },
  "& .MuiInputLabel-root": {
    color: "#777",
    fontSize: { xs: "0.9rem", sm: "1rem" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
  "& input": { padding: { xs: "14px", sm: "16px" } },
  position: "relative",
  zIndex: 1,
}));

const SuccessMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#e6ffe6",
  color: "#2e7d32",
  padding: theme.spacing(1.5),
  borderRadius: "10px",
  marginBottom: theme.spacing(2),
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  animation: `${fadeIn} 0.5s ease-in`,
  position: "relative",
  zIndex: 1,
}));

function Login() {
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      login(null, null, token);
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 1500);
    }
  }, [location, login, navigate]);

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

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

    setLoading(true);
    setError("");
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500); // Delay for success animation
    } catch (err) {
      setError(err.response?.data.message || t("Login failed"));
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
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
        background: "linear-gradient(to bottom, #f7fafc, #e2e8f0)",
        p: { xs: 2, sm: 4 },
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "url('https://www.transparenttextures.com/patterns/subtle-stripes.png')",
          opacity: 0.05,
          zIndex: 0,
        },
      }}
    >
      <AuthCard>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            color: "#1a202c",
            fontWeight: 800,
            mb: success ? 2 : 3,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(to right, #1976d2, #f0c14b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("Log In")}
        </Typography>

        {success && (
          <Fade in={success}>
            <SuccessMessage>
              <CheckCircleIcon sx={{ mr: 1, color: "#2e7d32" }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {t("Login successful! Redirecting...")}
              </Typography>
            </SuccessMessage>
          </Fade>
        )}

        {error && !success && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              textAlign: "center",
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
              bgcolor: "#ffebee",
              p: 1.5,
              borderRadius: "10px",
              fontWeight: 500,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <StyledTextField
            label={t("Email")}
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            disabled={loading}
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
            disabled={loading}
          />
          <AuthButton
            type="submit"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading ? t("Logging in...") : t("Login")}
          </AuthButton>
        </form>

        <Divider
          sx={{
            my: 3,
            color: "#777",
            "&::before, &::after": { borderColor: "#e0e0e0" },
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
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {t("Log in with Google")}
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
          {t("Don't have an account?")}{" "}
          <Button
            color="primary"
            onClick={() => navigate("/register")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: "#f0c14b", transform: "scale(1.05)" },
              transition: "all 0.3s ease",
            }}
          >
            {t("Sign up")}
          </Button>
        </Typography>
      </AuthCard>
    </Box>
  );
}

export default Login;
