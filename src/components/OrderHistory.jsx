// src/components/OrderHistory.jsx
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
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const HistoryContainer = styled(Box)(({ theme }) => ({
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

const OrderItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  flexDirection: theme.breakpoints.down("sm") ? "column" : "row",
  alignItems: theme.breakpoints.down("sm") ? "flex-start" : "center",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  "&:hover": {
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
    width: "100%",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
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
  [theme.breakpoints.down("sm")]: {
    minWidth: 120,
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/orders/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setOrders(response.data);
      setFilteredOrders(response.data);
      setError("");
    } catch (error) {
      setError(
        t("Failed to fetch orders") +
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
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
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Order History")}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#ffebee" }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: isMobile ? 1 : 2,
          flexDirection: isMobile ? "column" : "row",
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
          <Typography sx={{ textAlign: "center", color: "#555" }}>
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
                primaryTypographyProps={{ fontWeight: 500, color: "#111" }}
                secondaryTypographyProps={{
                  color: "#555",
                  mt: isMobile ? 1 : 0,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: isMobile ? 2 : 0,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <ActionButton
                  variant="contained"
                  component={Link}
                  to={`/order/${order._id}`}
                  sx={{ bgcolor: "#f0c14b", "&:hover": { bgcolor: "#e0b03a" } }}
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
                      "&:hover": { color: "#c0392b", borderColor: "#c0392b" },
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

      <Dialog open={!!cancelOrderId} onClose={() => setCancelOrderId(null)}>
        <DialogTitle sx={{ bgcolor: "#f7f7f7", color: "#111" }}>
          {t("Confirm Cancellation")}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#555" }}>
            {t("Are you sure you want to cancel order")} #{cancelOrderId}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOrderId(null)} sx={{ color: "#555" }}>
            {t("No")}
          </Button>
          <ActionButton
            variant="contained"
            onClick={handleCancelOrder}
            sx={{ bgcolor: "#e74c3c", "&:hover": { bgcolor: "#c0392b" } }}
          >
            {t("Yes")}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </HistoryContainer>
  );
}

export default OrderHistory;
