// src/components/Cart.jsx
import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY"); // Replace with your Stripe key

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Custom styled components
const CartCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  backgroundColor: "#fff",
  animation: `${slideIn} 0.5s ease-out`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
}));

const PaymentCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  border: "1px solid #eee",
}));

const CheckoutButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: { xs: "8px 16px", sm: "12px 24px" },
  borderRadius: "8px",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: "#e0b03a",
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
}));

const RemoveButton = styled(Button)(({ theme }) => ({
  color: "#d32f2f",
  borderColor: "#d32f2f",
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  borderRadius: "6px",
  padding: { xs: "4px 8px", sm: "6px 12px" },
  "&:hover": {
    backgroundColor: "#ffebee",
    borderColor: "#c62828",
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: "#1976d2",
  padding: { xs: 1, sm: 1.5 },
  "&:hover": {
    backgroundColor: "#e3f2fd",
    transform: "scale(1.1)",
    transition: "background-color 0.2s, transform 0.2s",
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
      borderColor: "#1976d2",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1976d2",
  },
  "& input": {
    padding: "10px 14px",
  },
}));

function Cart() {
  const { cart, removeFromCart, updateQuantity, setCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [pnrCode, setPnrCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [shippingAddressOpen, setShippingAddressOpen] = useState(true);
  const [billingAddressOpen, setBillingAddressOpen] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "ET",
  });
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "ET",
  });

  useEffect(() => {
    setProducts(
      cart.map((item) => ({ ...item.product, quantity: item.quantity }))
    );
  }, [cart]);

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleIncreaseQuantity = (productId) => {
    const product = cart.find((item) => item.productId === productId);
    if (product) updateQuantity(productId, product.quantity + 1);
  };

  const handleDecreaseQuantity = (productId) => {
    const product = cart.find((item) => item.productId === productId);
    if (product && product.quantity > 1) {
      updateQuantity(productId, product.quantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError(t("Please enter a discount code"));
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/discounts/validate",
        { code: discountCode },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setDiscount(response.data.percentage);
      setError("");
    } catch (err) {
      setDiscount(0);
      if (err.response?.status === 404) {
        setError(t("Discount validation service unavailable"));
      } else {
        setError(err.response?.data.message || t("Invalid discount code"));
      }
      console.error("Discount apply error:", err.response?.data || err.message);
    }
  };

  const calculateTotal = () => {
    const subtotal = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
      0
    );
    const discountAmount = subtotal * (discount / 100);
    return (subtotal - discountAmount).toFixed(2);
  };

  const generatePNR = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validatePhoneNumber = (value) => {
    if (paymentMethod === "telebirr") {
      const telebirrRegex = /^09\d{8}$/;
      return telebirrRegex.test(value);
    } else if (paymentMethod === "mpesa") {
      const mpesaRegex = /^07\d{8}$/;
      return mpesaRegex.test(value);
    }
    return false;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (value && !validatePhoneNumber(value)) {
        setPhoneError(
          paymentMethod === "telebirr"
            ? t("Phone number must start with '09' and be 10 digits")
            : paymentMethod === "mpesa"
            ? t("Phone number must start with '07' and be 10 digits")
            : t("Please select a payment method first")
        );
      } else {
        setPhoneError("");
      }
    }
  };

  const handleCheckout = () => {
    if (!user || !user.email) {
      navigate("/login");
      return;
    }
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country ||
      !billingAddress.street ||
      !billingAddress.city ||
      !billingAddress.state ||
      !billingAddress.postalCode ||
      !billingAddress.country
    ) {
      setError(t("Please fill in all required address fields"));
      return;
    }
    const newPnr = generatePNR();
    setPnrCode(newPnr);
    setIsPaymentStep(true);
  };

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(pnrCode);
    alert(t("PNR copied to clipboard: ") + pnrCode);
  };

  const createOrder = async (paymentDetails) => {
    try {
      const orderData = {
        pnr: pnrCode,
        userId: user._id,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        status: "Pending",
        shippingAddress,
        billingAddress,
        paymentMethod: {
          type:
            paymentDetails.method === "stripe" ? "card" : paymentDetails.method,
          phone:
            paymentDetails.method === "telebirr" ||
            paymentDetails.method === "mpesa"
              ? phoneNumber
              : undefined,
          last4:
            paymentDetails.method === "stripe" && paymentDetails.last4
              ? paymentDetails.last4
              : undefined,
        },
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart([]);
      setIsPaymentStep(false);
      navigate("/order-confirmation", { state: { order: response.data } });
    } catch (err) {
      setError(
        t("Failed to create order: ") +
          (err.response?.data.message || err.message)
      );
    }
  };

  const handlePayment = async () => {
    if (
      (paymentMethod === "telebirr" || paymentMethod === "mpesa") &&
      !validatePhoneNumber(phoneNumber)
    ) {
      setError(
        paymentMethod === "telebirr"
          ? t("Phone number must start with '09' and be 10 digits")
          : t("Phone number must start with '07' and be 10 digits")
      );
      return;
    }

    try {
      const total = calculateTotal();
      switch (paymentMethod) {
        case "telebirr":
          const telebirrResponse = await axios.post(
            "http://localhost:5000/api/telebirr/pay",
            { amount: total, phone: phoneNumber, pnr: pnrCode }
          );
          await createOrder({ method: "telebirr" });
          break;

        case "mpesa":
          const mpesaResponse = await axios.post(
            "http://localhost:5000/api/mpesa/pay",
            { amount: total, phone: phoneNumber, pnr: pnrCode }
          );
          await createOrder({ method: "mpesa" });
          break;

        case "stripe":
          // Handled in PaymentForm
          break;

        default:
          setError(t("Please select a payment method"));
      }
    } catch (err) {
      setError(
        t("Payment failed: ") + (err.response?.data.message || err.message)
      );
    }
  };

  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      event.preventDefault();

      if (!paymentMethod) {
        setError(t("Please select a payment method"));
        return;
      }

      if (
        paymentMethod === "stripe" &&
        (!stripe || !elements || !clientSecret)
      ) {
        setError(t("Stripe not loaded or payment not initiated"));
        return;
      }

      if (
        (paymentMethod === "telebirr" || paymentMethod === "mpesa") &&
        !phoneNumber
      ) {
        setError(t("Please enter your phone number for mobile payments"));
        return;
      }

      if (
        (paymentMethod === "telebirr" || paymentMethod === "mpesa") &&
        !validatePhoneNumber(phoneNumber)
      ) {
        setError(
          paymentMethod === "telebirr"
            ? t("Phone number must start with '09' and be 10 digits")
            : t("Phone number must start with '07' and be 10 digits")
        );
        return;
      }

      try {
        if (paymentMethod === "stripe") {
          const { paymentIntent, error: stripeError } =
            await stripe.confirmCardPayment(clientSecret, {
              payment_method: {
                card: elements.getElement(CardElement),
              },
            });

          if (stripeError) {
            setError(stripeError.message);
            return;
          }

          if (paymentIntent.status === "succeeded") {
            await createOrder({ method: "stripe", last4: "4242" });
          }
        } else {
          await handlePayment();
        }
      } catch (err) {
        setError(
          t("Payment failed: ") + (err.response?.data.message || err.message)
        );
      }
    };

    return (
      <PaymentCard sx={{ maxWidth: { xs: "100%", sm: 600 }, mx: "auto" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              color: "#111",
              fontWeight: 600,
              mb: 3,
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            {t("Complete Payment")}
          </Typography>
          {error && (
            <Typography
              color="error"
              sx={{
                mb: 2,
                textAlign: "center",
                fontSize: { xs: 12, sm: 14 },
                bgcolor: "#ffebee",
                p: 1,
                borderRadius: 2,
              }}
            >
              {error}
            </Typography>
          )}
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              bgcolor: "#f5f5f5",
              p: 1,
              borderRadius: 2,
              border: "1px solid #ddd",
            }}
          >
            <Typography
              sx={{
                color: "#555",
                fontSize: { xs: 12, sm: 14 },
                fontWeight: 500,
              }}
            >
              {t("Your PNR Code")}: <strong>{pnrCode}</strong>
            </Typography>
            <ActionButton
              onClick={handleCopyPNR}
              size="small"
              sx={{ bgcolor: "#e3f2fd", p: 0.5 }}
            >
              <ContentCopyIcon fontSize="small" />
            </ActionButton>
          </Box>
          <Typography
            sx={{
              mb: 2,
              color: "#555",
              textAlign: "center",
              fontSize: { xs: 14, sm: 16 },
              fontWeight: 500,
            }}
          >
            {t("Total to Pay")}:{" "}
            <strong style={{ color: "#111" }}>${calculateTotal()}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "#555", fontWeight: 500 }}>
              {t("Payment Method")}
            </InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPhoneNumber("");
                setPhoneError("");
                if (e.target.value === "stripe" && !clientSecret) {
                  const totalInCents = Math.round(calculateTotal() * 100);
                  axios
                    .post(
                      "http://localhost:5000/api/create-payment-intent",
                      { amount: totalInCents },
                      { headers: { Authorization: `Bearer ${user.token}` } }
                    )
                    .then((response) => {
                      setClientSecret(response.data.clientSecret);
                    })
                    .catch((err) => {
                      setError(t("Failed to initiate Stripe payment"));
                    });
                }
              }}
              label={t("Payment Method")}
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#999",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1976d2",
                },
              }}
            >
              <MenuItem value="telebirr">{t("Telebirr")}</MenuItem>
              <MenuItem value="mpesa">{t("M-Pesa")}</MenuItem>
              <MenuItem value="stripe">
                {t("Stripe (Credit/Debit Card)")}
              </MenuItem>
            </Select>
          </FormControl>
          {(paymentMethod === "telebirr" || paymentMethod === "mpesa") && (
            <StyledTextField
              label={t("Phone Number")}
              value={phoneNumber}
              onChange={handlePhoneChange}
              fullWidth
              required
              autoFocus
              inputProps={{
                maxLength: 10,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              placeholder={
                paymentMethod === "telebirr" ? "09XXXXXXXX" : "07XXXXXXXX"
              }
              error={!!phoneError}
              helperText={phoneError}
              sx={{ mb: 3 }}
            />
          )}
          {paymentMethod === "stripe" && clientSecret && (
            <Box
              sx={{
                mb: 3,
                bgcolor: "#fff",
                p: 2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                border: "1px solid #ddd",
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: isMobile ? "14px" : "16px",
                      color: "#111",
                      "::placeholder": { color: "#888" },
                    },
                    invalid: { color: "#d32f2f" },
                  },
                }}
              />
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <form onSubmit={handleSubmit}>
              <Button
                variant="contained"
                type="submit"
                disabled={
                  !paymentMethod ||
                  (paymentMethod === "stripe" && (!stripe || !clientSecret)) ||
                  phoneError
                }
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  bgcolor: "#1976d2",
                  borderRadius: "8px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#1565c0", transform: "scale(1.05)" },
                  "&:disabled": { bgcolor: "#b0bec5", cursor: "not-allowed" },
                }}
              >
                {t("Pay Now")}
              </Button>
            </form>
            <Button
              variant="outlined"
              onClick={() => setIsPaymentStep(false)}
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.5,
                borderColor: "#ccc",
                color: "#555",
                borderRadius: "8px",
                fontWeight: 600,
                "&:hover": { borderColor: "#999", backgroundColor: "#f5f5f5" },
              }}
            >
              {t("Cancel")}
            </Button>
          </Box>
        </CardContent>
      </PaymentCard>
    );
  };

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
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ color: "#111", fontWeight: 700, mb: 4, textAlign: "center" }}
      >
        {t("Your Cart")}
      </Typography>
      {cart.length === 0 ? (
        <Typography
          sx={{
            color: "#555",
            textAlign: "center",
            py: 4,
            fontSize: { xs: 14, sm: 16 },
          }}
        >
          {t("Your cart is empty")}
        </Typography>
      ) : !isPaymentStep ? (
        <Grid container spacing={isMobile ? 1 : 3}>
          <Grid item xs={12} md={8}>
            <CartCard>
              <CardContent>
                <List sx={{ bgcolor: "#fff" }}>
                  {products.map((product) => (
                    <ListItem
                      key={product._id}
                      sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        py: 2,
                        borderBottom: "1px solid #eee",
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontWeight: 500,
                              color: "#111",
                              fontSize: { xs: 14, sm: 16 },
                            }}
                          >
                            {product.name || t("Unnamed Product")}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{ color: "#555", fontSize: { xs: 12, sm: 14 } }}
                          >
                            {t("$")}
                            {product.price || "N/A"} x {product.quantity}
                          </Typography>
                        }
                        sx={{ mb: { xs: 1, sm: 0 } }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <ActionButton
                          onClick={() => handleDecreaseQuantity(product._id)}
                        >
                          <RemoveIcon
                            fontSize={isMobile ? "small" : "medium"}
                          />
                        </ActionButton>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: { xs: 14, sm: 16 } }}
                        >
                          {product.quantity}
                        </Typography>
                        <ActionButton
                          onClick={() => handleIncreaseQuantity(product._id)}
                        >
                          <AddIcon fontSize={isMobile ? "small" : "medium"} />
                        </ActionButton>
                        <RemoveButton
                          variant="outlined"
                          onClick={() => handleRemove(product._id)}
                        >
                          {t("Remove")}
                        </RemoveButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </CartCard>

            <CartCard sx={{ mt: isMobile ? 1 : 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setShippingAddressOpen(!shippingAddressOpen)}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#111", fontWeight: 600 }}
                  >
                    {t("Shipping Address")}
                  </Typography>
                  <ActionButton
                    sx={{
                      transform: shippingAddressOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <ExpandMoreIcon />
                  </ActionButton>
                </Box>
                <Collapse in={shippingAddressOpen}>
                  <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("Street")}
                        value={shippingAddress.street}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            street: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("City")}
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("State/Region")}
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("Postal Code")}
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        label={t("Country")}
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            country: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </CardContent>
            </CartCard>

            <CartCard sx={{ mt: isMobile ? 1 : 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setBillingAddressOpen(!billingAddressOpen)}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#111", fontWeight: 600 }}
                  >
                    {t("Billing Address")}
                  </Typography>
                  <ActionButton
                    sx={{
                      transform: billingAddressOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <ExpandMoreIcon />
                  </ActionButton>
                </Box>
                <Collapse in={billingAddressOpen}>
                  <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("Street")}
                        value={billingAddress.street}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            street: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("City")}
                        value={billingAddress.city}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            city: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("State/Region")}
                        value={billingAddress.state}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            state: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        label={t("Postal Code")}
                        value={billingAddress.postalCode}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        label={t("Country")}
                        value={billingAddress.country}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            country: e.target.value,
                          })
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </CardContent>
            </CartCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <CartCard
              sx={{ position: { xs: "static", md: "sticky" }, top: 20 }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#111",
                    fontWeight: 600,
                    mb: 2,
                    textAlign: "center",
                  }}
                >
                  {t("Order Summary")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{ color: "#555", fontSize: { xs: 14, sm: 16 } }}
                  >
                    {t("Subtotal")}:
                  </Typography>
                  <Typography
                    sx={{ color: "#111", fontSize: { xs: 14, sm: 16 } }}
                  >
                    $
                    {products
                      .reduce(
                        (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                </Box>
                {discount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{ color: "#555", fontSize: { xs: 14, sm: 16 } }}
                    >
                      {t("Discount")} ({discount}%):
                    </Typography>
                    <Typography
                      sx={{ color: "#d32f2f", fontSize: { xs: 14, sm: 16 } }}
                    >
                      -$
                      {(
                        products.reduce(
                          (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
                          0
                        ) *
                        (discount / 100)
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#111",
                      fontSize: { xs: 16, sm: 18 },
                    }}
                  >
                    {t("Total")}:
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#111",
                      fontSize: { xs: 16, sm: 18 },
                    }}
                  >
                    ${calculateTotal()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <StyledTextField
                    label={t("Discount Code")}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleApplyDiscount}
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                      px: { xs: 2, sm: 3 },
                    }}
                  >
                    {t("Apply")}
                  </Button>
                </Box>
                <CheckoutButton fullWidth onClick={handleCheckout}>
                  {t("Proceed to Checkout")}
                </CheckoutButton>
              </CardContent>
            </CartCard>
          </Grid>
        </Grid>
      ) : (
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      )}
    </Box>
  );
}

export default Cart;
