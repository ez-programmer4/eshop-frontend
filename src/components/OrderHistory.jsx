import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
const HistoryContainer = styled(Box)(({ theme }) => ({
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

const OrderItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
    animation: `${glow} 1.5s infinite`,
  },
  flexDirection: theme.breakpoints.down("sm") ? "column" : "row",
  alignItems: theme.breakpoints.down("sm") ? "flex-start" : "center",
  padding: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "10px",
  fontWeight: 700,
  padding: theme.spacing(1.5, 3),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(240, 193, 75, 0.5)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.85rem",
    width: "100%",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
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
  [theme.breakpoints.down("sm")]: { minWidth: 140 },
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

function OrderHistory() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async (retries = 2) => {
    if (!user.userId) {
      setError(t("User ID not found. Please log in again."));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/orders/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 10000,
        }
      );
      setOrders(response.data);
      setFilteredOrders(response.data);
      setError("");
    } catch (error) {
      if (error.code === "ERR_NETWORK" && retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
        return fetchOrders(retries - 1);
      }
      setError(
        error.code === "ERR_NETWORK"
          ? t("Network error. Please check your connection or try again later.")
          : t("Failed to fetch orders") +
              ": " +
              (error.response?.data.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    let filtered = [...orders];
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(
        (order) =>
          new Date(order.createdAt).toDateString() === filterDate.toDateString()
      );
    }
    setFilteredOrders(filtered);
  };

  const handleCancelOrder = async () => {
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/orders/${cancelOrderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders(
        orders.map((o) => (o._id === cancelOrderId ? response.data : o))
      );
      setFilteredOrders(
        filteredOrders.map((o) => (o._id === cancelOrderId ? response.data : o))
      );
      setCancelOrderId(null);
      setError("");
    } catch (error) {
      setError(
        t("Failed to cancel order") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  if (loading) {
    return (
      <HistoryContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 40 : 60}
          />
        </Box>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
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
        {t("Order History")}
      </Typography>

      {error && (
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

      <Box
        sx={{
          mb: 4,
          display: "flex",
          gap: isMobile ? 2 : 3,
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
        }}
      >
        <StyledFormControl>
          <InputLabel>{t("Status")}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
            label={t("Status")}
          >
            <MenuItem value="">{t("All")}</MenuItem>
            <MenuItem value="Pending">{t("Pending")}</MenuItem>
            <MenuItem value="Shipped">{t("Shipped")}</MenuItem>
            <MenuItem value="Delivered">{t("Delivered")}</MenuItem>
            <MenuItem value="Canceled">{t("Canceled")}</MenuItem>
          </Select>
        </StyledFormControl>
        <StyledTextField
          label={t("Filter by Date")}
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            handleFilterChange();
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />
      </Box>

      <List>
        {filteredOrders.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              color: "#666",
              fontSize: "1.2rem",
              fontStyle: "italic",
              py: 4,
            }}
          >
            {t("No orders found.")}
          </Typography>
        ) : (
          filteredOrders.map((order) => (
            <OrderItem key={order._id}>
              <ListItemText
                primary={`${t("Order")} #${order._id}`}
                secondary={`${t("Total")}: $${order.total.toFixed(2)} - ${t(
                  "Status"
                )}: ${t(order.status)} - ${t("Date")}: ${new Date(
                  order.createdAt
                ).toLocaleDateString()}`}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "#111",
                  fontSize: "1.1rem",
                }}
                secondaryTypographyProps={{
                  color: "#666",
                  mt: isMobile ? 1 : 0,
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: isMobile ? 2 : 0,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <ActionButton
                  variant="contained"
                  component={Link}
                  to={`/order/${order._id}`}
                  sx={{
                    background: "linear-gradient(45deg, #f0c14b, #ffca28)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #e0b03a, #ffb300)",
                    },
                  }}
                >
                  {t("View Details")}
                </ActionButton>
                {order.status === "Pending" && (
                  <ActionButton
                    variant="outlined"
                    onClick={() => setCancelOrderId(order._id)}
                    sx={{
                      color: "#e74c3c",
                      borderColor: "#e74c3c",
                      "&:hover": {
                        color: "#c0392b",
                        borderColor: "#c0392b",
                        boxShadow: "0 4px 12px rgba(231, 76, 60, 0.5)",
                      },
                    }}
                  >
                    {t("Cancel")}
                  </ActionButton>
                )}
              </Box>
            </OrderItem>
          ))
        )}
      </List>

      <Dialog
        open={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#f7f7f7",
            color: "#111",
            fontWeight: 700,
            borderBottom: "1px solid #eee",
          }}
        >
          {t("Confirm Cancellation")}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ color: "#666", fontSize: "1.1rem" }}>
            {t("Are you sure you want to cancel order")} #{cancelOrderId}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCancelOrderId(null)}
            sx={{ color: "#555", "&:hover": { color: "#f0c14b" } }}
          >
            {t("No")}
          </Button>
          <ActionButton
            variant="contained"
            onClick={handleCancelOrder}
            sx={{
              bgcolor: "#e74c3c",
              "&:hover": { bgcolor: "#c0392b" },
            }}
          >
            {t("Yes")}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </HistoryContainer>
  );
}

export default OrderHistory;
