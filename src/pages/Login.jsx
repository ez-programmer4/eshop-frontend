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

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const iconPop = keyframes`
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// Styled Components
const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `url("https://images.unsplash.com/photo-1528459801416-a263057e4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80") no-repeat center/cover, linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)`,
  padding: theme.spacing(4),
  position: "relative",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 500,
  width: "100%",
  margin: "auto",
  padding: theme.spacing(5),
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  animation: `${slideIn} 0.6s ease-out`,
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("md")]: { padding: theme.spacing(4) },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    borderRadius: "20px",
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #feb47b 0%, #ff6b81 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 4),
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "1.1rem",
  textTransform: "none",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6b81 0%, #feb47b 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
  },
  "&:disabled": {
    background: "#ccc",
    boxShadow: "none",
    color: "#999",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 3),
    fontSize: "0.95rem",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#1a202c",
  border: "1px solid #e2e8f0",
  padding: theme.spacing(1.5, 4),
  borderRadius: "14px",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    backgroundColor: "#f7fafc",
    transform: "scale(1.03)",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  },
  "&:disabled": {
    background: "#eee",
    color: "#999",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 3),
    fontSize: "0.9rem",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#feb47b" },
    "&.Mui-focused fieldset": { borderColor: "#ff6b81" },
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },
  "& .MuiInputLabel-root": {
    color: "#4a5568",
    fontSize: "1rem",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff6b81" },
  "& input": { padding: theme.spacing(2), fontSize: "1rem" },
  [theme.breakpoints.down("sm")]: {
    "& input": { padding: theme.spacing(1.5) },
  },
}));

const SuccessMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #e6ffe6 0%, #ccffcc 100%)",
  color: "#2e7d32",
  padding: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(46, 125, 50, 0.3)",
  animation: `${slideUp} 0.5s ease-out`,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  zIndex: 2,
  "&:hover": { boxShadow: "0 10px 30px rgba(46, 125, 50, 0.4)" },
  transition: "all 0.3s ease",
}));

const AnimatedIcon = styled(CheckCircleIcon)({
  animation: `${iconPop} 0.6s ease-out`,
});

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
      setTimeout(() => navigate("/"), 1500);
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
    <AuthContainer>
      <AuthCard>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 700,
            color: "#1a202c",
            mb: success ? 0 : 4,
            textAlign: "center",
            letterSpacing: "-0.5px",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "opacity 0.3s ease",
            opacity: success ? 0 : 1,
          }}
        >
          {t("Log In")}
        </Typography>

        {success && (
          <Fade in={success}>
            <SuccessMessage>
              <AnimatedIcon sx={{ fontSize: "2.5rem", color: "#2e7d32" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#2e7d32" }}
              >
                {t("Login successful! Redirecting...")}
              </Typography>
            </SuccessMessage>
          </Fade>
        )}

        {!success && error && (
          <Typography
            color="error"
            sx={{
              mb: 3,
              textAlign: "center",
              fontSize: "1rem",
              bgcolor: "#fff0f0",
              p: 2,
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(255, 0, 0, 0.1)",
            }}
          >
            {error}
          </Typography>
        )}

        {!success && (
          <Fade in={!success}>
            <Box>
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
                  color: "#4a5568",
                  "&::before, &::after": { borderColor: "#e2e8f0" },
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
                  fontSize: "0.95rem",
                  color: "#4a5568",
                }}
              >
                {t("Don't have an account?")}{" "}
                <Button
                  color="primary"
                  onClick={() => navigate("/register")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#ff6b81",
                    "&:hover": { color: "#feb47b" },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("Sign up")}
                </Button>
              </Typography>
            </Box>
          </Fade>
        )}
      </AuthCard>
    </AuthContainer>
  );
}

export default Login;
