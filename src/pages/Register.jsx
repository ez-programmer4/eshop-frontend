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
  MenuItem,
  FormControl,
  Select,
  InputLabel,
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

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const iconPop = keyframes`
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// Custom styled components
const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 450,
  width: "100%",
  margin: "auto",
  padding: theme.spacing(4),
  background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  border: "1px solid #eee",
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
      "radial-gradient(circle, rgba(240, 193, 75, 0.15), transparent 70%)",
    transform: "rotate(30deg)",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: "12px",
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(to right, #f0c14b, #e0b03a)",
  color: "#111",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
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
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  "&:disabled": {
    background: "#eee",
    color: "#999",
  },
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
    transition: "all 0.3s ease",
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

const SuccessMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(to right, #e6ffe6, #ccffcc)",
  color: "#2e7d32",
  padding: theme.spacing(2.5),
  borderRadius: "14px",
  boxShadow:
    "0 6px 18px rgba(46, 125, 50, 0.25), 0 0 10px rgba(46, 125, 50, 0.15)",
  border: "1px solid rgba(46, 125, 50, 0.3)",
  animation: `${slideUp} 0.4s ease-out`,
  transition: "all 0.3s ease",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 420,
  zIndex: 2,
  "&:hover": {
    boxShadow:
      "0 8px 24px rgba(46, 125, 50, 0.35), 0 0 15px rgba(46, 125, 50, 0.2)",
  },
}));

const AnimatedIcon = styled(CheckCircleIcon)(({ theme }) => ({
  animation: `${iconPop} 0.5s ease-out`,
  marginRight: theme.spacing(1.5),
}));

function Register() {
  const { register } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      register(null, null, null, token);
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 1000);
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

    setLoading(true);
    setError("");
    try {
      await register(email, password, name);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.response?.data.message || t("Registration failed"));
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    window.location.href =
      "https://eshop-backend-e11f.onrender.com/api/auth/google";
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  // Simplified language list (expand as needed)
  const languages = [
    { code: "en", name: "English" },
    { code: "am", name: "አማርኛ (Amharic)" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    // Add more from Google's list as needed
  ];

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
      <AuthCard sx={{ position: "relative" }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            color: "#111",
            fontWeight: 700,
            mb: success ? 0 : 2,
            textAlign: "center",
            letterSpacing: "0.5px",
            position: "relative",
            zIndex: 1,
            transition: "opacity 0.3s ease",
            opacity: success ? 0 : 1,
          }}
        >
          {t("Sign Up")}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#666",
            textAlign: "center",
            mb: success ? 0 : 3,
            position: "relative",
            zIndex: 1,
            transition: "opacity 0.3s ease",
            opacity: success ? 0 : 1,
          }}
        >
          {t("to continue to EthioShop")}
        </Typography>

        {success && (
          <Fade in={success}>
            <SuccessMessage>
              <AnimatedIcon sx={{ fontSize: "2rem", color: "#2e7d32" }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.1rem" } }}
              >
                {t("Registration successful! Redirecting...")}
              </Typography>
            </SuccessMessage>
          </Fade>
        )}

        {!success && error && (
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

        {!success && (
          <Fade in={!success}>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <GoogleButton
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignup}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {t("Sign up with Google")}
              </GoogleButton>

              <Divider
                sx={{
                  my: 2,
                  color: "#666",
                  "&::before, &::after": { borderColor: "#ddd" },
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {t("or")}
              </Divider>

              <form onSubmit={handleSubmit}>
                <StyledTextField
                  label={t("Name")}
                  fullWidth
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!nameError}
                  helperText={nameError}
                  disabled={loading}
                />
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
                  sx={{ mt: 2 }}
                  disabled={loading}
                  startIcon={
                    loading && <CircularProgress size={20} color="inherit" />
                  }
                >
                  {loading ? t("Signing up...") : t("Sign Up")}
                </AuthButton>
              </form>

              <Typography
                sx={{
                  mt: 2,
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
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("Sign in")}
                </Button>
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Language Selector */}
        <FormControl
          fullWidth
          sx={{ mt: 3, position: "relative", zIndex: 1 }}
          size="small"
        >
          <InputLabel>{t("Language")}</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            label={t("Language")}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </AuthCard>
    </Box>
  );
}

export default Register;
