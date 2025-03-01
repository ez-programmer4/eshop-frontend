// src/components/OrderDetail.jsx
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
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const OrderContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1000,
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

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
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
        `http://localhost:5000/api/orders/detail/${id}`,
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
        `http://localhost:5000/api/feedback/order/${id}`,
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
        "http://localhost:5000/api/return-requests/my-requests",
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
        "http://localhost:5000/api/feedback",
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
        "http://localhost:5000/api/return-requests",
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      </OrderContainer>
    );
  }

  if (!order) {
    return (
      <OrderContainer>
        <Typography sx={{ textAlign: "center", color: "#555" }}>
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
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Order")} #{order._id}
      </Typography>

      {error && !feedbackSuccess && !returnSuccess && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#ffebee" }}
        >
          {error}
        </Alert>
      )}
      {feedbackSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#e0f7fa" }}
        >
          {feedbackSuccess}
        </Alert>
      )}
      {returnSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#e0f7fa" }}
        >
          {returnSuccess}
        </Alert>
      )}

      <DetailCard elevation={3}>
        <Grid container spacing={isMobile ? 2 : 4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Overview")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography sx={{ color: "#555", mb: 1 }}>
                <strong>{t("User")}:</strong>{" "}
                {order.userId?.name || t("Unknown")} (
                {order.userId?.email || "N/A"})
              </Typography>
              <Typography sx={{ color: "#555", mb: 1 }}>
                <strong>{t("Status")}:</strong> {t(order.status || "N/A")}
              </Typography>
              <Typography sx={{ color: "#555" }}>
                <strong>{t("Total")}:</strong> $
                {order.total?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Items")}
            </Typography>
            <List dense>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{ py: 1, borderBottom: "1px solid #eee" }}
                  >
                    <ListItemText
                      primary={item.productId?.name || t("Unknown Product")}
                      secondary={`x${item.quantity || 0} - $${
                        item.productId?.price || 0
                      } ${t("each")}`}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: "#111",
                      }}
                      secondaryTypographyProps={{ color: "#555" }}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: "#555" }}>
                  {t("No items in this order.")}
                </Typography>
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Shipping Address")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              {order.shippingAddress ? (
                <>
                  <Typography sx={{ color: "#555", mb: 1 }}>
                    {order.shippingAddress.street || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#555", mb: 1 }}>
                    {order.shippingAddress.city || ""},{" "}
                    {order.shippingAddress.state || ""}{" "}
                    {order.shippingAddress.postalCode || ""}
                  </Typography>
                  <Typography sx={{ color: "#555" }}>
                    {order.shippingAddress.country || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "#555" }}>
                  {t("No shipping address available.")}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Billing Address")}
            </Typography>
            <Box sx={{ pl: 2 }}>
              {order.billingAddress ? (
                <>
                  <Typography sx={{ color: "#555", mb: 1 }}>
                    {order.billingAddress.street || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#555", mb: 1 }}>
                    {order.billingAddress.city || ""},{" "}
                    {order.billingAddress.state || ""}{" "}
                    {order.billingAddress.postalCode || ""}
                  </Typography>
                  <Typography sx={{ color: "#555" }}>
                    {order.billingAddress.country || "N/A"}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "#555" }}>
                  {t("No billing address available.")}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Status History")}
            </Typography>
            <List dense>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((entry, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "#f9fafb",
                      "&:hover": { bgcolor: "#f0f4f8" },
                    }}
                  >
                    <ListItemText
                      primary={t(entry.status || "N/A")}
                      secondary={
                        entry.updatedAt
                          ? new Date(entry.updatedAt).toLocaleString()
                          : "N/A"
                      }
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: "#111",
                      }}
                      secondaryTypographyProps={{ color: "#555" }}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: "#555" }}>
                  {t("No status history available.")}
                </Typography>
              )}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Tracking Events")}
            </Typography>
            {order.trackingEvents && order.trackingEvents.length > 0 ? (
              <List dense>
                {order.trackingEvents.map((event, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "#f9fafb",
                      "&:hover": { bgcolor: "#f0f4f8" },
                    }}
                  >
                    <ListItemText
                      primary={t(event.status || "N/A")}
                      secondary={`${event.location || "N/A"} - ${
                        event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : "N/A"
                      }`}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: "#111",
                      }}
                      secondaryTypographyProps={{ color: "#555" }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: "#555" }}>
                {t("No tracking updates yet.")}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Your Feedback")}
            </Typography>
            {feedback && feedback.rating ? (
              <Box>
                <Typography sx={{ color: "#555", mb: 1 }}>
                  {t("Your Rating")}:{" "}
                  <Rating value={feedback.rating} readOnly size="small" />
                </Typography>
                <Typography sx={{ color: "#555" }}>
                  {t("Comment")}: {feedback.comment || t("No comment provided")}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography sx={{ color: "#111", mb: 1 }}>
                  {t("Rate your experience")}:
                </Typography>
                <Rating
                  value={rating}
                  onChange={(e, value) => setRating(value)}
                  sx={{ mb: 2 }}
                />
                <StyledTextField
                  label={t("Your Feedback (optional)")}
                  multiline
                  rows={isMobile ? 2 : 3}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <ActionButton onClick={handleFeedbackSubmit}>
                  {t("Submit Feedback")}
                </ActionButton>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: isMobile ? 2 : 3, bgcolor: "#e0e0e0" }} />
            <Typography
              variant="h6"
              sx={{ color: "#111", fontWeight: 600, mb: 2 }}
            >
              {t("Return Request")}
            </Typography>
            {returnRequest ? (
              <Box>
                <Typography sx={{ color: "#555", mb: 1 }}>
                  {t("Status")}: {t(returnRequest.status)}
                </Typography>
                <Typography sx={{ color: "#555" }}>
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
                  sx={{ mb: 2 }}
                />
                <ActionButton
                  onClick={handleReturnSubmit}
                  sx={{ bgcolor: "#e74c3c", "&:hover": { bgcolor: "#c0392b" } }}
                >
                  {t("Submit Return Request")}
                </ActionButton>
              </Box>
            ) : (
              <Typography sx={{ color: "#555" }}>
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
