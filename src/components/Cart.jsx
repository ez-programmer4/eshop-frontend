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
  Checkbox,
  FormControlLabel,
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

const stripePromise = loadStripe(
  "pk_test_51Qw6R4KGvURwtTvTPtLs0IgjxOM4YWvnTghKcFfbkJZdEaZbeW5oar2DaGrcr6uUZPb2YRQtuFM3Ah3Ah3dR430ok9900C8ATrI9w"
).catch((err) => {
  console.error("Failed to load Stripe.js:", err);
  return null;
});

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CartCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
  background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
  animation: `${slideIn} 0.5s ease-out`,
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
  },
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
}));

const CheckoutButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(to right, #f0c14b, #e0b03a)",
  color: "#111",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "uppercase",
  "&:hover": {
    background: "linear-gradient(to right, #e0b03a, #d0a029)",
    animation: `${bounce} 0.3s ease-out`,
  },
  width: "100%",
  marginTop: theme.spacing(2),
}));

const RemoveButton = styled(Button)(({ theme }) => ({
  color: "#d32f2f",
  borderColor: "#d32f2f",
  fontSize: "0.875rem",
  borderRadius: "8px",
  padding: theme.spacing(0.75, 1.5),
  "&:hover": {
    backgroundColor: "#ffebee",
    borderColor: "#c62828",
    transform: "scale(1.05)",
  },
  transition: "all 0.2s ease",
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: "#1976d2",
  padding: theme.spacing(1),
  "&:hover": { backgroundColor: "#e3f2fd", transform: "scale(1.1)" },
  transition: "all 0.2s ease",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
    "& fieldset": { borderColor: "#ccc" },
    "&:hover fieldset": { borderColor: "#999" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
  },
  "& .MuiInputLabel-root": { color: "#555", fontWeight: 500 },
}));

function Cart() {
  const { cart, removeFromCart, updateQuantity, setCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupedItems, setGroupedItems] = useState({
    bundles: {},
    singles: [],
  });
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
  const [billingAddressOpen, setBillingAddressOpen] = useState(false);
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
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const bundles = {};
    const singles = [];
    const processedBundleIds = new Set();

    cart.forEach((item) => {
      if (
        item.bundle &&
        item.bundle.bundleId &&
        !processedBundleIds.has(item.bundle.bundleId)
      ) {
        const bundleId = item.bundle.bundleId;
        const bundleItems = cart.filter((i) => i.bundle?.bundleId === bundleId);
        bundles[bundleId] = {
          bundleId,
          name: item.bundle.name,
          discount: item.bundle.discount || 0,
          price: item.bundle.bundlePrice || 0,
          quantity: 1,
          items: bundleItems.map((bi) => ({
            ...bi.product,
            cartItemId: bi._id || bi.productId,
          })),
        };
        processedBundleIds.add(bundleId);
      } else if (!item.bundle) {
        singles.push({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item._id || item.productId,
        });
      }
    });

    setGroupedItems({ bundles, singles });
  }, [cart]);

  const handleRemoveBundle = async (bundleId) => {
    const bundleItems = groupedItems.bundles[bundleId].items;
    try {
      await Promise.all(
        bundleItems.map((item) => removeFromCart(item.cartItemId))
      );
      // Ensure state reflects removal
      setGroupedItems((prev) => {
        const newBundles = { ...prev.bundles };
        delete newBundles[bundleId];
        return { ...prev, bundles: newBundles };
      });
    } catch (error) {
      console.error("Failed to remove bundle:", error);
    }
  };

  const handleRemoveSingle = (cartItemId) => {
    removeFromCart(cartItemId);
  };

  const handleIncreaseQuantity = (id) => {
    const item = cart.find((i) => i._id === id || i.productId === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const handleDecreaseQuantity = (id) => {
    const item = cart.find((i) => i._id === id || i.productId === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else if (item) {
      removeFromCart(id);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError(t("Please enter a discount code"));
      return;
    }
    try {
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/discounts/validate",
        { code: discountCode },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setDiscount(response.data.percentage);
      setError("");
    } catch (err) {
      setDiscount(0);
      setError(err.response?.data.message || t("Discount validation failed"));
    }
  };

  const calculateBundlePrice = (bundle) => (bundle.price || 0).toFixed(2);

  const calculateTotal = () => {
    const bundleTotal = Object.values(groupedItems.bundles).reduce(
      (sum, bundle) => sum + (bundle.price || 0),
      0
    );
    const singleTotal = groupedItems.singles.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const subtotal = bundleTotal + singleTotal;
    const discountAmount = subtotal * (discount / 100);
    return (subtotal - discountAmount).toFixed(2);
  };

  const generatePNR = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(6)
      .fill()
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  };

  const validatePhoneNumber = (value) => {
    if (paymentMethod === "telebirr") return /^09\d{8}$/.test(value);
    if (paymentMethod === "mpesa") return /^07\d{8}$/.test(value);
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(value);
    if (value && !validatePhoneNumber(value)) {
      setPhoneError(
        paymentMethod === "telebirr"
          ? t("Phone must start with '09' and be 10 digits")
          : t("Phone must start with '07' and be 10 digits")
      );
    } else {
      setPhoneError("");
    }
  };

  const validateAddress = (address, type) => {
    const errors = {};
    if (!address.street.trim()) errors.street = t(`${type} street is required`);
    if (!address.city.trim()) errors.city = t(`${type} city is required`);
    if (!address.state.trim())
      errors.state = t(`${type} state/region is required`);
    if (!address.postalCode.trim())
      errors.postalCode = t(`${type} postal code is required`);
    if (!address.country.trim())
      errors.country = t(`${type} country is required`);
    return errors;
  };

  const handleCheckout = () => {
    if (!user || !user.email) {
      navigate("/login");
      return;
    }
    const shippingErrors = validateAddress(shippingAddress, "Shipping");
    const billingErrors = billingSameAsShipping
      ? {}
      : validateAddress(billingAddress, "Billing");
    const allErrors = { ...shippingErrors, ...billingErrors };
    setValidationErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setError(t("Please fill in: ") + Object.values(allErrors).join(", "));
      return;
    }

    if (billingSameAsShipping) setBillingAddress({ ...shippingAddress });
    setPnrCode(generatePNR());
    setIsPaymentStep(true);
    setError("");
  };

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(pnrCode);
    alert(t("PNR copied: ") + pnrCode);
  };

  const createOrder = async (paymentDetails) => {
    try {
      const orderData = {
        pnr: pnrCode,
        userId: user._id,
        items: [
          ...Object.values(groupedItems.bundles).map((bundle) => ({
            bundleId: bundle.bundleId,
            quantity: 1, // Fixed at 1 for bundles
            price: bundle.price,
          })),
          ...groupedItems.singles.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.price,
          })),
        ],
        total: calculateTotal(),
        status: "Pending",
        shippingAddress,
        billingAddress,
        paymentMethod: {
          type:
            paymentDetails.method === "stripe" ? "card" : paymentDetails.method,
          phone: ["telebirr", "mpesa"].includes(paymentDetails.method)
            ? phoneNumber
            : undefined,
          last4:
            paymentDetails.method === "stripe"
              ? paymentDetails.last4
              : undefined,
        },
        logoUrl: "https://ethioshop-820b.onrender.com/logo.png",
      };

      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/orders",
        orderData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart([]);
      setIsPaymentStep(false);
      navigate("/order-confirmation", { state: { order: response.data } });
    } catch (err) {
      setError(
        t("Order creation failed: ") +
          (err.response?.data.message || "Server error")
      );
    }
  };

  const handlePayment = async () => {
    console.log("User object:", user);
    console.log("Token:", user?.token);
    const headers = { Authorization: `Bearer ${user?.token}` };
    console.log("Headers being sent:", headers);
    if (!user?.token) {
      navigate("/login");
      setError(t("Please log in to proceed with payment"));
      return;
    }
    if (
      ["telebirr", "mpesa"].includes(paymentMethod) &&
      !validatePhoneNumber(phoneNumber)
    ) {
      setError(t("Invalid phone number"));
      return;
    }
    try {
      const total = calculateTotal();
      switch (paymentMethod) {
        case "telebirr":
          const telebirrRes = await axios.post(
            "https://eshop-backend-e11f.onrender.com/api/telebirr/pay",
            { amount: total, phone: phoneNumber, pnr: pnrCode },
            { headers }
          );
          if (telebirrRes.data.message) setError(telebirrRes.data.message);
          await createOrder({ method: "telebirr" });
          break;
        case "mpesa":
          const mpesaRes = await axios.post(
            "https://eshop-backend-e11f.onrender.com/api/mpesa/pay",
            { amount: total, phone: phoneNumber, pnr: pnrCode },
            { headers }
          );
          if (mpesaRes.data.message) setError(mpesaRes.data.message);
          await createOrder({ method: "mpesa" });
          break;
        case "stripe":
          break;
        default:
          setError(t("Select a payment method"));
      }
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      setError(err.response?.data.message || t("Payment failed"));
    }
  };
  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!paymentMethod) {
        setError(t("Select a payment method"));
        return;
      }
      if (
        paymentMethod === "stripe" &&
        (!stripe || !elements || !clientSecret)
      ) {
        setError(t("Stripe unavailable"));
        return;
      }

      try {
        if (paymentMethod === "stripe") {
          const { paymentIntent, error: stripeError } =
            await stripe.confirmCardPayment(clientSecret, {
              payment_method: { card: elements.getElement(CardElement) },
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
          t("Payment failed: ") +
            (err.response?.data.message || "API unavailable")
        );
      }
    };

    return (
      <Card
        sx={{
          maxWidth: { xs: "100%", sm: 600 },
          mx: "auto",
          p: 3,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "#111", fontWeight: 600, mb: 2, textAlign: "center" }}
        >
          {t("Complete Payment")}
        </Typography>
        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              textAlign: "center",
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
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f0f0f0",
            p: 1,
            borderRadius: 2,
          }}
        >
          <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
            {t("PNR Code")}: <strong>{pnrCode}</strong>
          </Typography>
          <ActionButton onClick={handleCopyPNR}>
            <ContentCopyIcon />
          </ActionButton>
        </Box>
        <Typography sx={{ mb: 2, textAlign: "center", fontWeight: 500 }}>
          {t("Total")}: <strong>${calculateTotal()}</strong>
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t("Payment Method")}</InputLabel>
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
                    "https://eshop-backend-e11f.onrender.com/api/create-payment-intent",
                    { amount: totalInCents },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                  )
                  .then((res) => setClientSecret(res.data.clientSecret))
                  .catch(() => setError(t("Stripe unavailable")));
              }
            }}
            label={t("Payment Method")}
          >
            <MenuItem value="telebirr">{t("Telebirr")}</MenuItem>
            <MenuItem value="mpesa">{t("M-Pesa")}</MenuItem>
            <MenuItem value="stripe">{t("Stripe (Card)")}</MenuItem>
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
            inputProps={{ maxLength: 10, inputMode: "numeric" }}
            placeholder={
              paymentMethod === "telebirr" ? "09XXXXXXXX" : "07XXXXXXXX"
            }
            error={!!phoneError}
            helperText={phoneError}
            sx={{ mb: 2 }}
          />
        )}
        {paymentMethod === "stripe" && clientSecret && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardElement
              options={{ style: { base: { fontSize: "16px", color: "#111" } } }}
            />
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !paymentMethod ||
              (paymentMethod === "stripe" && (!stripe || !clientSecret)) ||
              phoneError
            }
            sx={{
              flex: 1,
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            {t("Pay Now")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsPaymentStep(false)}
            sx={{
              flex: 1,
              borderColor: "#ccc",
              "&:hover": { borderColor: "#999" },
            }}
          >
            {t("Cancel")}
          </Button>
        </Box>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "#f5f5f5",
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "#111", fontWeight: 700, mb: 4, textAlign: "center" }}
      >
        {t("Your Cart")}
      </Typography>
      {cart.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 4, color: "#555" }}>
          {t("Cart is empty")}
        </Typography>
      ) : !isPaymentStep ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <CartCard>
              <CardContent sx={{ p: 2 }}>
                <List>
                  {Object.values(groupedItems.bundles).map((bundle) => (
                    <ListItem
                      key={bundle.bundleId}
                      sx={{ py: 2, borderBottom: "1px solid #eee" }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                          >
                            {bundle.name} ({t("Bundle")})
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography sx={{ color: "#666" }}>
                              {bundle.items.map((item) => item.name).join(", ")}
                            </Typography>
                            <Typography sx={{ color: "#666" }}>
                              ${calculateBundlePrice(bundle)} ({t("Save")}:{" "}
                              {bundle.discount}%)
                            </Typography>
                          </Box>
                        }
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <RemoveButton
                          variant="outlined"
                          onClick={() => handleRemoveBundle(bundle.bundleId)}
                        >
                          {t("Remove Bundle")}
                        </RemoveButton>
                      </Box>
                    </ListItem>
                  ))}
                  {groupedItems.singles.map((item) => (
                    <ListItem
                      key={item.cartItemId}
                      sx={{ py: 2, borderBottom: "1px solid #eee" }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: "#666" }}>
                            ${item.price || "N/A"} x {item.quantity}
                          </Typography>
                        }
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ActionButton
                          onClick={() =>
                            handleDecreaseQuantity(item.cartItemId)
                          }
                        >
                          <RemoveIcon />
                        </ActionButton>
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.quantity}
                        </Typography>
                        <ActionButton
                          onClick={() =>
                            handleIncreaseQuantity(item.cartItemId)
                          }
                        >
                          <AddIcon />
                        </ActionButton>
                        <RemoveButton
                          variant="outlined"
                          onClick={() => handleRemoveSingle(item.cartItemId)}
                        >
                          {t("Remove")}
                        </RemoveButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </CartCard>
            <CartCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setShippingAddressOpen(!shippingAddressOpen)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {["street", "city", "state", "postalCode", "country"].map(
                      (field) => (
                        <Grid
                          item
                          xs={12}
                          sm={field === "country" ? 12 : 6}
                          key={field}
                        >
                          <StyledTextField
                            label={t(
                              field.charAt(0).toUpperCase() + field.slice(1)
                            )}
                            value={shippingAddress[field]}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                [field]: e.target.value,
                              })
                            }
                            fullWidth
                            required
                            error={!!validationErrors[field]}
                            helperText={validationErrors[field]}
                          />
                        </Grid>
                      )
                    )}
                  </Grid>
                </Collapse>
              </CardContent>
            </CartCard>
            <CartCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setBillingAddressOpen(!billingAddressOpen)}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={billingSameAsShipping}
                          onChange={(e) =>
                            setBillingSameAsShipping(e.target.checked)
                          }
                        />
                      }
                      label={t("Same as shipping")}
                    />
                    {!billingSameAsShipping && (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {[
                          "street",
                          "city",
                          "state",
                          "postalCode",
                          "country",
                        ].map((field) => (
                          <Grid
                            item
                            xs={12}
                            sm={field === "country" ? 12 : 6}
                            key={field}
                          >
                            <StyledTextField
                              label={t(
                                field.charAt(0).toUpperCase() + field.slice(1)
                              )}
                              value={billingAddress[field]}
                              onChange={(e) =>
                                setBillingAddress({
                                  ...billingAddress,
                                  [field]: e.target.value,
                                })
                              }
                              fullWidth
                              required
                              error={!!validationErrors[field]}
                              helperText={validationErrors[field]}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </CartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <CartCard sx={{ position: "sticky", top: 20 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}
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
                  <Typography>{t("Subtotal")}:</Typography>
                  <Typography>
                    $
                    {(
                      Object.values(groupedItems.bundles).reduce(
                        (sum, b) => sum + b.price,
                        0
                      ) +
                      groupedItems.singles.reduce(
                        (sum, i) => sum + (i.price || 0) * i.quantity,
                        0
                      )
                    ).toFixed(2)}
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
                    <Typography>
                      {t("Discount")} ({discount}%):
                    </Typography>
                    <Typography sx={{ color: "#d32f2f" }}>
                      -$
                      {(
                        (Object.values(groupedItems.bundles).reduce(
                          (sum, b) => sum + b.price,
                          0
                        ) +
                          groupedItems.singles.reduce(
                            (sum, i) => sum + (i.price || 0) * i.quantity,
                            0
                          )) *
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
                  <Typography sx={{ fontWeight: 600 }}>
                    {t("Total")}:
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    ${calculateTotal()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <StyledTextField
                    label={t("Discount Code")}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleApplyDiscount}
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    {t("Apply")}
                  </Button>
                </Box>
                {error && (
                  <Typography
                    color="error"
                    sx={{
                      mb: 2,
                      textAlign: "center",
                      bgcolor: "#ffebee",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Typography>
                )}
                <CheckoutButton onClick={handleCheckout}>
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
