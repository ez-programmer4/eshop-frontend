import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  IconButton,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import CloseIcon from "@mui/icons-material/Close";

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Custom styled components
const ConfirmationCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  animation: `${slideIn} 0.5s ease-out`,
  position: "relative",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.breakpoints.down("md") ? "8px" : "10px 20px",
  fontWeight: 600,
  minWidth: theme.breakpoints.down("md") ? "auto" : "120px",
  transition: "transform 0.2s, background-color 0.2s",
  "&:hover": { transform: "scale(1.05)" },
}));

const ContinueShoppingButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  "&:hover": { backgroundColor: "#e0b03a" },
}));

const ViewOrdersButton = styled(ActionButton)(({ theme }) => ({
  borderColor: "#1976d2",
  color: "#1976d2",
  "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
}));

const DownloadButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: "#1976d2",
  color: "#fff",
  "&:hover": { backgroundColor: "#1565c0" },
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  margin: "20px auto",
  maxWidth: theme.breakpoints.down("sm") ? "150px" : "200px",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  color: "#555",
  "&:hover": { color: "#d32f2f" },
}));

function OrderConfirmation() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const orderData = location.state?.order;
    if (!orderData) {
      setError(t("No order data found"));
      navigate("/orders", { replace: true });
    } else {
      setOrder(orderData);
      setLoading(false);
    }
  }, [location.state, navigate, t]);

  const handleContinueShopping = () => navigate("/");
  const handleViewOrders = () => navigate("/my-orders");
  const handleClose = () => navigate("/");

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add logo to PDF
    const logoUrl = "/logo.png";
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, "PNG", 20, 10, 30, 30);
      addPDFContent(doc);
      doc.save(`Order_Confirmation_${order._id}.pdf`);
    };
    img.onerror = () => {
      console.error("Failed to load logo for PDF");
      addPDFContent(doc);
      doc.save(`Order_Confirmation_${order._id}.pdf`);
    };
  };

  const addPDFContent = (doc) => {
    doc.setFontSize(20);
    doc.setTextColor(240, 193, 75);
    doc.text(t("Order Confirmation"), 60, 25);

    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    doc.text(`${t("Order #")}${order._id}`, 20, 50);
    doc.text(`${t("PNR Code")}: ${order.pnr || "N/A"}`, 20, 60);
    doc.text(`${t("Total")}: $${order.total.toFixed(2)}`, 20, 70);
    doc.text(`${t("Payment Method")}: ${order.paymentMethod.type}`, 20, 80);
    let yOffset = 80;
    if (order.paymentMethod.phone) {
      yOffset += 10;
      doc.text(`${t("Phone")}: ${order.paymentMethod.phone}`, 20, yOffset);
    }
    if (order.paymentMethod.last4) {
      yOffset += 10;
      doc.text(
        `${t("Card Ending")}: ${order.paymentMethod.last4}`,
        20,
        yOffset
      );
    }

    doc.setFontSize(14);
    yOffset += 20;
    doc.text(t("Items"), 20, yOffset);
    doc.setFontSize(10);
    let yPos = yOffset + 10;
    order.items.forEach((item) => {
      doc.text(
        `${item.productId.name} x ${item.quantity} - $${(
          item.quantity * item.productId.price
        ).toFixed(2)}`,
        20,
        yPos
      );
      yPos += 10;
    });

    doc.setFontSize(14);
    yPos += 10;
    doc.text(t("Shipping Address"), 20, yPos);
    doc.setFontSize(10);
    yPos += 10;
    doc.text(
      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
      20,
      yPos
    );

    doc.setFontSize(14);
    yPos += 20;
    doc.text(t("Billing Address"), 20, yPos);
    doc.setFontSize(10);
    yPos += 10;
    doc.text(
      `${order.billingAddress.street}, ${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.postalCode}, ${order.billingAddress.country}`,
      20,
      yPos
    );

    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text(`© ${new Date().getFullYear()} EthioShop`, 20, yPos + 20);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: "#f7f7f7",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#f0c14b" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mt: 4,
          p: { xs: 2, sm: 4 },
          bgcolor: "#f7f7f7",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ color: "#d32f2f", mb: 2 }}>
          {error || t("Order not found")}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/my-orders")}
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}
        >
          {t("View Your Orders")}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 4,
        p: { xs: 1, sm: 2, md: 4 },
        bgcolor: "#f7f7f7",
        borderRadius: 3,
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <img
          src="/logo.png"
          alt="EthioShop Logo"
          style={{ height: isMobile ? "40px" : "60px" }}
        />
      </Box>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ color: "#111", fontWeight: 700, mb: 4, textAlign: "center" }}
      >
        {t("Order Confirmed!")}
      </Typography>

      <ConfirmationCard sx={{ width: { xs: "100%", sm: "90%", md: "80%" } }}>
        <CardContent>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              color: "#f0c14b",
              fontWeight: 600,
              mb: 2,
              textAlign: "center",
            }}
          >
            {t("Thank you for your purchase!")}
          </Typography>
          <Typography
            sx={{
              color: "#555",
              mb: 3,
              textAlign: "center",
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            {t("Your order #")}
            {order._id} {t("has been successfully placed.")}
          </Typography>

          <Divider sx={{ my: 3, bgcolor: "#eee" }} />

          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Order Summary")}
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555", mb: 1 }}
                >
                  <strong>{t("PNR Code")}:</strong> {order.pnr || "N/A"}
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555", mb: 1 }}
                >
                  <strong>{t("Total")}:</strong> ${order.total.toFixed(2)}
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555", mb: 1 }}
                >
                  <strong>{t("Payment Method")}:</strong>{" "}
                  {order.paymentMethod.type}
                </Typography>
                {order.paymentMethod.phone && (
                  <Typography
                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555", mb: 1 }}
                  >
                    <strong>{t("Phone")}:</strong> {order.paymentMethod.phone}
                  </Typography>
                )}
                {order.paymentMethod.last4 && (
                  <Typography
                    sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555", mb: 1 }}
                  >
                    <strong>{t("Card Ending")}:</strong>{" "}
                    {order.paymentMethod.last4}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Items Purchased")}
              </Typography>
              <List
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 2,
                  borderRadius: 2,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {order.items.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 1,
                      borderBottom:
                        index < order.items.length - 1
                          ? "1px solid #eee"
                          : "none",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: "#111",
                            fontSize: { xs: 12, sm: 14 },
                          }}
                        >
                          {item.productId.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{ color: "#555", fontSize: { xs: 12, sm: 14 } }}
                        >
                          {t("Qty:")} {item.quantity} - $
                          {(item.quantity * item.productId.price).toFixed(2)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, bgcolor: "#eee" }} />

          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Shipping Address")}
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555" }}
                >
                  {order.shippingAddress.street}, {order.shippingAddress.city},
                  {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode},
                  {order.shippingAddress.country}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Billing Address")}
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
                <Typography
                  sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555" }}
                >
                  {order.billingAddress.street}, {order.billingAddress.city},
                  {order.billingAddress.state} {order.billingAddress.postalCode}
                  , {order.billingAddress.country}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <QRCodeContainer>
            <QRCodeCanvas
              value={order.pnr || order._id}
              size={isMobile ? 120 : 150}
            />
          </QRCodeContainer>
          <Typography
            sx={{
              textAlign: "center",
              color: "#555",
              fontSize: { xs: 10, sm: 12 },
              mb: 3,
            }}
          >
            {t("Scan this QR code with your PNR:")} {order.pnr || order._id}
          </Typography>

          <Divider sx={{ my: 3, bgcolor: "#eee" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? 1 : 2,
              flexWrap: "wrap",
            }}
          >
            <ContinueShoppingButton onClick={handleContinueShopping}>
              {isMobile ? <HomeIcon /> : t("Continue Shopping")}
            </ContinueShoppingButton>
            <ViewOrdersButton variant="outlined" onClick={handleViewOrders}>
              {isMobile ? <ListIcon /> : t("View Orders")}
            </ViewOrdersButton>
            <DownloadButton
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
            >
              {isMobile ? null : t("Download PDF")}
            </DownloadButton>
          </Box>
        </CardContent>
      </ConfirmationCard>
    </Box>
  );
}

export default OrderConfirmation;
