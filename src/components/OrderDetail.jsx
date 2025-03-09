import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Paper,
  Rating,
  TextField,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(240, 193, 75, 0.3); }
  50% { box-shadow: 0 0 15px rgba(240, 193, 75, 0.7); }
  100% { box-shadow: 0 0 5px rgba(240, 193, 75, 0.3); }
`;

// Styled components
const OrderContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: "auto",
  padding: theme.spacing(4),
  background: "linear-gradient(135deg, #f7f7f7 0%, #fff 100%)",
  borderRadius: "16px",
  minHeight: "80vh",
  animation: `${slideIn} 0.6s ease-out`,
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  backgroundColor: "#fff",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
    animation: `${glow} 1.5s infinite`,
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #f0c14b 30%, #ffca28 90%)",
  color: "#111",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  "&:hover": {
    background: "linear-gradient(45deg, #e0b03a 30%, #ffb300 90%)",
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(240, 193, 75, 0.5)",
  },
  "&:disabled": { background: "#e0e0e0", color: "#888" },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.85rem",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
    "& fieldset": { borderColor: "#ddd" },
    "&:hover fieldset": { borderColor: "#f0c14b" },
    "&.Mui-focused fieldset": { borderColor: "#f0c14b", borderWidth: 2 },
  },
  "& .MuiInputLabel-root": { color: "#666", fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f0c14b" },
}));

const StatusItem = styled(ListItem)(({ theme }) => ({
  py: 1.5,
  borderRadius: "8px",
  mb: 1,
  bgcolor: "#f9fafb",
  transition: "background-color 0.3s ease",
  "&:hover": { bgcolor: "#f0f4f8" },
}));

function OrderDetail() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnRequest, setReturnRequest] = useState(null);
  const [returnSuccess, setReturnSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchOrder(),
          fetchFeedback(),
          fetchReturnRequest(),
        ]);
      } catch (error) {
        setError(t("Failed to load order data"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, id, navigate, t]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/orders/detail/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setOrder(response.data);
    } catch (error) {
      throw new Error(
        error.response?.data.message || t("Failed to load order details")
      );
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/feedback/order/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setFeedback(response.data);
      if (response.data.rating) setRating(response.data.rating);
      if (response.data.comment) setComment(response.data.comment);
    } catch (error) {
      console.error(
        "Fetch feedback error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchReturnRequest = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/return-requests/my-requests",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const request = response.data.find((req) => req.orderId._id === id);
      setReturnRequest(request || null);
    } catch (error) {
      console.error(
        "Fetch return request error:",
        error.response?.data || error.message
      );
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!rating) {
      setError(t("Please provide a rating"));
      return;
    }
    try {
      await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/feedback",
        { orderId: id, rating, comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFeedback({ rating, comment });
      setFeedbackSuccess(t("Thank you for your feedback!"));
      setError("");
      setTimeout(() => setFeedbackSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data.message || t("Failed to submit feedback"));
    }
  };

  const handleReturnSubmit = async () => {
    if (!returnReason) {
      setError(t("Please provide a reason for return"));
      return;
    }
    try {
      await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/return-requests",
        { orderId: id, reason: returnReason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReturnRequest({ status: "Pending", reason: returnReason });
      setReturnSuccess(t("Return request submitted successfully!"));
      setError("");
      setReturnReason("");
      setTimeout(() => setReturnSuccess(""), 3000);
      fetchReturnRequest();
    } catch (error) {
      setError(
        error.response?.data.message || t("Failed to submit return request")
      );
    }
  };

  if (loading) {
    return (
      <OrderContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 40 : 60}
          />
        </Box>
      </OrderContainer>
    );
  }

  if (!order) {
    return (
      <OrderContainer>
        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            fontSize: "1.2rem",
            fontStyle: "italic",
            py: 4,
          }}
        >
          {t("Order not found")}
        </Typography>
      </OrderContainer>
    );
  }

  return (
    <OrderContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 800,
          textAlign: "center",
          mb: isMobile ? 3 : 5,
          letterSpacing: "1px",
          textTransform: "uppercase",
          background: "linear-gradient(90deg, #f0c14b, #111)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {t("Order")} #{order._id}
      </Typography>

      {error && !feedbackSuccess && !returnSuccess && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: "#fff1f1",
            boxShadow: "0 2px 8px rgba(231, 76, 60, 0.1)",
          }}
        >
          {error}
        </Alert>
      )}
      {feedbackSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: "#e8f5e9",
            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.1)",
          }}
        >
          {feedbackSuccess}
        </Alert>
      )}
      {returnSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: "#e8f5e9",
            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.1)",
          }}
        >
          {returnSuccess}
        </Alert>
      )}

      <DetailCard elevation={3}>
        <Grid container spacing={isMobile ? 3 : 5}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Overview")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                <strong>{t("User")}:</strong>{" "}
                {order.userId?.name || t("Unknown")} (
                {order.userId?.email || "N/A"})
              </Typography>
              <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                <strong>{t("Status")}:</strong>{" "}
                <span
                  style={{
                    color: order.status === "Delivered" ? "#4caf50" : "#f0c14b",
                  }}
                >
                  {t(order.status || "N/A")}
                </span>
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "1rem" }}>
                <strong>{t("Total")}:</strong> $
                <span style={{ color: "#f0c14b", fontWeight: 600 }}>
                  {order.total?.toFixed(2) || "0.00"}
                </span>
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Items")}
            </Typography>
            <List dense>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <StatusItem key={index}>
                    <ListItemText
                      primary={item.productId?.name || t("Unknown Product")}
                      secondary={`x${item.quantity || 0} - $${
                        item.productId?.price || 0
                      } ${t("each")}`}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: "#111",
                        fontSize: "1.1rem",
                      }}
                      secondaryTypographyProps={{ color: "#666" }}
                    />
                  </StatusItem>
                ))
              ) : (
                <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                  {t("No items in this order.")}
                </Typography>
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Shipping Address")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              {order.shippingAddress ? (
                <>
                  <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                    {order.shippingAddress.street || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                    {order.shippingAddress.city || ""},{" "}
                    {order.shippingAddress.state || ""}{" "}
                    {order.shippingAddress.postalCode || ""}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "1rem" }}>
                    {order.shippingAddress.country || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                  {t("No shipping address available.")}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Billing Address")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              {order.billingAddress ? (
                <>
                  <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                    {order.billingAddress.street || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                    {order.billingAddress.city || ""},{" "}
                    {order.billingAddress.state || ""}{" "}
                    {order.billingAddress.postalCode || ""}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "1rem" }}>
                    {order.billingAddress.country || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                  {t("No billing address available.")}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Status History")}
            </Typography>
            <List dense>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((entry, index) => (
                  <StatusItem key={index}>
                    <ListItemText
                      primary={t(entry.status || "N/A")}
                      secondary={
                        entry.updatedAt
                          ? new Date(entry.updatedAt).toLocaleString()
                          : "N/A"
                      }
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: "#111",
                        fontSize: "1.1rem",
                      }}
                      secondaryTypographyProps={{ color: "#666" }}
                    />
                  </StatusItem>
                ))
              ) : (
                <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                  {t("No status history available.")}
                </Typography>
              )}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Tracking Events")}
            </Typography>
            {order.trackingEvents && order.trackingEvents.length > 0 ? (
              <List dense>
                {order.trackingEvents.map((event, index) => (
                  <StatusItem key={index}>
                    <ListItemText
                      primary={t(event.status || "N/A")}
                      secondary={`${event.location || "N/A"} - ${
                        event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : "N/A"
                      }`}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: "#111",
                        fontSize: "1.1rem",
                      }}
                      secondaryTypographyProps={{ color: "#666" }}
                    />
                  </StatusItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                {t("No tracking updates yet.")}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Your Feedback")}
            </Typography>
            {feedback && feedback.rating ? (
              <Box>
                <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                  {t("Your Rating")}:{" "}
                  <Rating
                    value={feedback.rating}
                    readOnly
                    size="small"
                    sx={{ color: "#f0c14b" }}
                  />
                </Typography>
                <Typography sx={{ color: "#666", fontSize: "1rem" }}>
                  {t("Comment")}: {feedback.comment || t("No comment provided")}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography sx={{ color: "#111", mb: 1.5, fontSize: "1.1rem" }}>
                  {t("Rate your experience")}:
                </Typography>
                <Rating
                  value={rating}
                  onChange={(e, value) => setRating(value)}
                  sx={{ mb: 2, color: "#f0c14b" }}
                />
                <StyledTextField
                  label={t("Your Feedback (optional)")}
                  multiline
                  rows={isMobile ? 2 : 3}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <ActionButton onClick={handleFeedbackSubmit}>
                  {t("Submit Feedback")}
                </ActionButton>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 700, mb: 2 }}
            >
              {t("Return Request")}
            </Typography>
            {returnRequest ? (
              <Box>
                <Typography sx={{ color: "#666", mb: 1.5, fontSize: "1rem" }}>
                  {t("Status")}:{" "}
                  <span
                    style={{
                      color:
                        returnRequest.status === "Approved"
                          ? "#4caf50"
                          : "#f0c14b",
                    }}
                  >
                    {t(returnRequest.status)}
                  </span>
                </Typography>
                <Typography sx={{ color: "#666", fontSize: "1rem" }}>
                  {t("Reason")}: {returnRequest.reason}
                </Typography>
              </Box>
            ) : order.status === "Delivered" ? (
              <Box>
                <StyledTextField
                  label={t("Reason for Return")}
                  multiline
                  rows={isMobile ? 2 : 3}
                  fullWidth
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <ActionButton
                  onClick={handleReturnSubmit}
                  sx={{
                    background:
                      "linear-gradient(45deg, #e74c3c 30%, #ff6655 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #c0392b 30%, #e04f4f 90%)",
                    },
                  }}
                >
                  {t("Submit Return Request")}
                </ActionButton>
              </Box>
            ) : (
              <Typography sx={{ color: "#666", fontStyle: "italic" }}>
                {t("Returns available only for delivered orders.")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DetailCard>
    </OrderContainer>
  );
}

export default OrderDetail;
