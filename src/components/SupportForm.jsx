// src/components/SupportForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

// Styled components
const SupportContainer = styled(Box)(({ theme }) => ({
  maxWidth: 800,
  margin: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f7f7f7",
  borderRadius: "12px",
  minHeight: "80vh",
  animation: `${slideIn} 0.5s ease-out`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const SupportItem = styled(ListItem)(({ theme }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#e0b03a",
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
    width: "100%",
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
      borderColor: "#f0c14b",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#f0c14b",
  },
}));

function SupportForm() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchSupportRequests();
  }, [user, navigate]);

  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/support/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setRequests(response.data);
      setError("");
    } catch (error) {
      setError(
        t("Failed to fetch support requests") +
          ": " +
          (error.response?.data.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      setError(t("Subject and message are required"));
      return;
    }
    try {
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/support",
        { userId: user.userId, subject, message },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess(t("Support request submitted successfully!"));
      setSubject("");
      setMessage("");
      setError("");
      setRequests([...requests, response.data]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to submit request") +
          ": " +
          (error.response?.data.message || error.message)
      );
      setSuccess("");
    }
  };

  if (loading) {
    return (
      <SupportContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      </SupportContainer>
    );
  }

  return (
    <SupportContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Customer Support")}
      </Typography>

      {user ? (
        <>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, bgcolor: "#ffebee" }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2, borderRadius: 2, bgcolor: "#e0f7fa" }}
            >
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mb: isMobile ? 3 : 4 }}
          >
            <StyledTextField
              label={t("Subject")}
              fullWidth
              margin="normal"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <StyledTextField
              label={t("Message")}
              multiline
              rows={isMobile ? 3 : 4}
              fullWidth
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <ActionButton type="submit" variant="contained" sx={{ mt: 2 }}>
              {t("Submit Request")}
            </ActionButton>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Your Support Requests")}
            </Typography>
            {requests.length === 0 ? (
              <Typography sx={{ color: "#555", textAlign: "center" }}>
                {t("No support requests yet")}
              </Typography>
            ) : (
              <List>
                {requests.map((request) => (
                  <SupportItem key={request._id}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: "#111" }}>
                          {request.subject}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: "#555" }}>
                          {t("Status")}: {t(request.status)}
                        </Typography>
                      }
                    />
                    <Typography variant="body2" sx={{ color: "#555", mt: 1 }}>
                      {request.message}
                    </Typography>
                    {request.response && (
                      <Typography
                        variant="body2"
                        sx={{ color: "#2ecc71", mt: 1 }}
                      >
                        {t("Response")}: {request.response}
                      </Typography>
                    )}
                  </SupportItem>
                ))}
              </List>
            )}
          </Box>
        </>
      ) : (
        <Typography sx={{ textAlign: "center", color: "#555" }}>
          {t("Please log in to submit a support request")}
        </Typography>
      )}
    </SupportContainer>
  );
}

export default SupportForm;
