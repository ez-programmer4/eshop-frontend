import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Rating,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import { styled, useTheme } from "@mui/system";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Animations
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

// Styled Components
const ProductContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "auto",
  padding: theme.spacing(4),
  background: "linear-gradient(135deg, #f7f7f7 0%, #fff 100%)",
  borderRadius: "16px",
  minHeight: "80vh",
  animation: `${slideIn} 0.6s ease-out`,
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#fff",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
    animation: `${glow} 1.5s infinite`,
  },
  cursor: "pointer",
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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1.2),
  transition: "transform 0.3s ease, color 0.3s ease",
  "&:hover": {
    transform: "scale(1.3) rotate(10deg)",
    color: "#f0c14b",
    animation: `${pulse} 0.6s infinite`,
    backgroundColor: "rgba(240, 193, 75, 0.1)",
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

const ReviewCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  backgroundColor: "#fafafa",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.06)",
  padding: theme.spacing(2),
  transition: "background-color 0.3s",
  "&:hover": { backgroundColor: "#f5f5f5" },
}));

function ProductDetail() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openShare, setOpenShare] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productData = await fetchProduct(id);
        setProduct(productData);
        await Promise.all([fetchRelatedProducts(), fetchRecommendations()]);
      } catch (error) {
        setError(t("Failed to load product data"));
      } finally {
        setLoading(false);
      }
    };
    if (id && typeof id === "string") {
      fetchData();
    } else {
      setError(t("Invalid product ID"));
      setLoading(false);
    }
  }, [id, user, t]);

  const fetchProduct = async (id) => {
    if (!id || id === "undefined") {
      console.error("fetchProduct received invalid ID:", id);
      return null;
    }
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/products/${id}`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(`Product ${id} not found`);
        return null;
      }
      throw error;
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/products/related/${id}`
      );
      const uniqueRelated = Array.from(
        new Set(response.data.map((p) => p._id))
      ).map((id) => response.data.find((p) => p._id === id));
      setRelatedProducts(uniqueRelated || []);
    } catch (error) {
      setRelatedProducts([]);
      console.error("Failed to fetch related products:", error);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products/recommendations",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const uniqueRecs = Array.from(
        new Set(response.data.map((p) => p._id))
      ).map((id) => response.data.find((p) => p._id === id));
      setRecommendations(
        uniqueRecs.filter((rec) => rec && rec._id && rec.name) || []
      );
    } catch (error) {
      setRecommendations([]);
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(product?._id);
    setSuccess(t("Added to cart!"));
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
      setSuccess(t("Removed from wishlist"));
    } else {
      addToWishlist(product._id);
      setSuccess(t("Added to wishlist"));
    }
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!rating || !comment) {
      setError(t("Rating and comment are required"));
      return;
    }
    try {
      const response = await axios.post(
        `https://eshop-backend-e11f.onrender.com/api/products/${id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProduct((prev) => ({
        ...prev,
        reviews: [...prev.reviews, { ...response.data, pending: true }],
      }));
      setRating(0);
      setComment("");
      setError("");
      setSuccess(t("Review submitted! It will appear after admin approval."));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data.message || t("Failed to submit review"));
    }
  };

  const handleShare = () => {
    setOpenShare(true);
  };

  const shareViaPlatform = (platform) => {
    const url = `${window.location.origin}/product/${id}`;
    const styledText = `🌟 *EthioShop Exclusive!* 🌟\nCheck out *${
      product?.name || t("this amazing product")
    }* for only *$${
      product?.price || "N/A"
    }*!\n👉 ${url}\n✨ Shop now at EthioShop! ✨`;
    let shareUrl;

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          styledText
        )}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          styledText
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(styledText)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(styledText)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setOpenShare(false);
  };

  if (loading) {
    return (
      <ProductContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 40 : 60}
          />
        </Box>
      </ProductContainer>
    );
  }

  if (!product) {
    return (
      <ProductContainer>
        <Typography
          sx={{
            textAlign: "center",
            color: "#555",
            fontSize: "1.5rem",
            py: 4,
          }}
        >
          {t("Product not found")}
        </Typography>
      </ProductContainer>
    );
  }

  const { ratingStats } = product;
  const chartData = {
    labels: ["1★", "2★", "3★", "4★", "5★"],
    datasets: [
      {
        label: t("Reviews"),
        data: ratingStats.ratingDistribution,
        backgroundColor: "rgba(240, 193, 75, 0.8)",
        borderColor: "#e0b03a",
        borderWidth: 2,
        hoverBackgroundColor: "#f0c14b",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: t("Rating Distribution"),
        color: "#111",
        font: { size: 18, weight: "bold" },
      },
      tooltip: { backgroundColor: "#f0c14b", titleColor: "#111" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t("Number of Reviews"),
          color: "#555",
          font: { size: 14 },
        },
        ticks: { color: "#555", font: { size: 12 } },
      },
      x: { ticks: { color: "#555", font: { size: 12 } } },
    },
  };

  return (
    <ProductContainer>
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
        {product.name}
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
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: "#e8f5e9",
            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.1)",
          }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={isMobile ? 3 : 5}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={product.image || "https://picsum.photos/400?blur=2"}
            alt={product.name}
            sx={{
              borderRadius: "16px",
              width: "100%",
              height: "auto",
              maxHeight: isMobile ? 320 : 450,
              objectFit: "cover",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.02)" },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            sx={{
              color: "#f0c14b",
              mb: 2,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            ${product.price}
          </Typography>
          <Typography
            sx={{
              mb: 3,
              color: "#666",
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            {product.description}
          </Typography>
          <Typography
            sx={{
              mb: 3,
              color: product.stock > 0 ? "#4caf50" : "#e74c3c",
              fontWeight: 500,
            }}
          >
            {t("Stock")}:{" "}
            {product.stock > 0
              ? `${product.stock} ${t("available")}`
              : t("Out of stock")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
            }}
          >
            <ActionButton
              variant="contained"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {t("Add to Cart")}
            </ActionButton>
            <StyledIconButton
              onClick={handleWishlistToggle}
              sx={{
                color: wishlist.some((item) => item._id === product._id)
                  ? "#f0c14b"
                  : "#666",
              }}
            >
              {wishlist.some((item) => item._id === product._id) ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </StyledIconButton>
            <StyledIconButton onClick={handleShare}>
              <ShareIcon />
            </StyledIconButton>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h5"
            sx={{ color: "#111", fontWeight: 700, mb: 3 }}
          >
            {t("Rating Summary")}
          </Typography>
          <Box sx={{ mb: 4, bgcolor: "#fff", p: 3, borderRadius: "12px" }}>
            <Typography sx={{ mb: 1, color: "#555", fontSize: "1.1rem" }}>
              {ratingStats.averageRating} / 5 ({ratingStats.totalReviews}{" "}
              {t("reviews")})
            </Typography>
            <Rating
              value={parseFloat(ratingStats.averageRating)}
              readOnly
              precision={0.1}
              sx={{ color: "#f0c14b" }}
            />
            <Box
              sx={{
                maxWidth: isMobile ? 300 : 450,
                mt: 3,
                height: isMobile ? 150 : 200,
              }}
            >
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Box>

          <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ color: "#111", fontWeight: 700 }}>
              {t("Reviews")}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showAllReviews}
                  onChange={(e) => setShowAllReviews(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#f0c14b" },
                    "& .MuiSwitch-track": { backgroundColor: "#ddd" },
                  }}
                />
              }
              label={t("Show All Reviews")}
              sx={{ color: "#555", fontWeight: 500 }}
            />
          </Box>

          {user && (
            <ReviewCard sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "#111" }}>
                  {t("Leave a Review")}
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  sx={{ mb: 2, color: "#f0c14b" }}
                />
                <StyledTextField
                  label={t("Your Review")}
                  multiline
                  rows={isMobile ? 3 : 4}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <ActionButton onClick={handleReviewSubmit}>
                  {t("Submit Review")}
                </ActionButton>
              </CardContent>
            </ReviewCard>
          )}

          {product.reviews.filter((review) => showAllReviews || !review.pending)
            .length === 0 ? (
            <Typography sx={{ color: "#666", fontStyle: "italic" }}>
              {showAllReviews
                ? t("No reviews yet.")
                : t("No approved reviews yet.")}
            </Typography>
          ) : (
            <List>
              {product.reviews
                .filter((review) => showAllReviews || !review.pending)
                .map((review) => (
                  <ListItem
                    key={review._id}
                    sx={{
                      py: 2,
                      borderBottom: "1px solid #eee",
                      flexDirection: isMobile ? "column" : "row",
                      bgcolor: "#fff",
                      borderRadius: "8px",
                      mb: 2,
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: isMobile ? 1 : 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#111",
                              fontSize: "1.1rem",
                            }}
                          >
                            {review.userId.name}
                          </Typography>
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            sx={{ color: "#f0c14b" }}
                          />
                          {review.pending && (
                            <Typography
                              sx={{
                                color: "#e74c3c",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                              }}
                            >
                              ({t("Pending")})
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: "#666",
                            lineHeight: 1.5,
                            fontSize: "0.95rem",
                          }}
                        >
                          {review.comment} -{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h5"
            sx={{ color: "#111", fontWeight: 700, mb: 3 }}
          >
            {t("Recommended For You")}
          </Typography>
          {user && recommendations.length === 0 ? (
            <Typography sx={{ color: "#666", fontStyle: "italic" }}>
              {t("No recommendations available yet.")}
            </Typography>
          ) : (
            <Grid container spacing={isMobile ? 2 : 4}>
              {recommendations.map((rec) => (
                <Grid item xs={12} sm={6} md={4} key={rec._id}>
                  <ProductCard onClick={() => navigate(`/product/${rec._id}`)}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "160" : "220"}
                      image={rec.image || "https://picsum.photos/200?blur=2"}
                      alt={rec.name || t("Product")}
                      sx={{ borderRadius: "16px 16px 0 0" }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#111", fontWeight: 600 }}
                      >
                        {rec.name || t("Unnamed Product")}
                      </Typography>
                      <Typography sx={{ color: "#f0c14b", fontWeight: 500 }}>
                        ${rec.price || "N/A"}
                      </Typography>
                    </CardContent>
                  </ProductCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h5"
            sx={{ color: "#111", fontWeight: 700, mb: 3 }}
          >
            {t("Related Products")}
          </Typography>
          {relatedProducts.length === 0 ? (
            <Typography sx={{ color: "#666", fontStyle: "italic" }}>
              {t("No related products available.")}
            </Typography>
          ) : (
            <Grid container spacing={isMobile ? 2 : 4}>
              {relatedProducts.map((related) => (
                <Grid item xs={12} sm={6} md={4} key={related._id}>
                  <ProductCard
                    onClick={() => navigate(`/product/${related._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height={isMobile ? "160" : "220"}
                      image={
                        related.image || "https://picsum.photos/200?blur=2"
                      }
                      alt={related.name || t("Product")}
                      sx={{ borderRadius: "16px 16px 0 0" }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#111", fontWeight: 600 }}
                      >
                        {related.name || t("Unnamed Product")}
                      </Typography>
                      <Typography sx={{ color: "#f0c14b", fontWeight: 500 }}>
                        ${related.price || "N/A"}
                      </Typography>
                    </CardContent>
                  </ProductCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={openShare}
        onClose={() => setOpenShare(false)}
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: "#fff" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#f7f7f7",
            color: "#111",
            fontWeight: 700,
            borderBottom: "1px solid #eee",
          }}
        >
          {t("Share This Product")}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("twitter")}
            sx={{
              mb: 2,
              color: "#1DA1F2",
              borderColor: "#1DA1F2",
              "&:hover": {
                bgcolor: "#e6f3fa",
                borderColor: "#1A91DA",
                transform: "scale(1.03)",
              },
            }}
          >
            {t("Share on Twitter")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("whatsapp")}
            sx={{
              mb: 2,
              color: "#25D366",
              borderColor: "#25D366",
              "&:hover": {
                bgcolor: "#e9f7ef",
                borderColor: "#20BA56",
                transform: "scale(1.03)",
              },
            }}
          >
            {t("Share on WhatsApp")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("facebook")}
            sx={{
              mb: 2,
              color: "#4267B2",
              borderColor: "#4267B2",
              "&:hover": {
                bgcolor: "#e8eef6",
                borderColor: "#365899",
                transform: "scale(1.03)",
              },
            }}
          >
            {t("Share on Facebook")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("telegram")}
            sx={{
              mb: 2,
              color: "#0088cc",
              borderColor: "#0088cc",
              "&:hover": {
                bgcolor: "#e6f0fa",
                borderColor: "#006699",
                transform: "scale(1.03)",
              },
            }}
          >
            {t("Share on Telegram")}
          </ActionButton>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenShare(false)}
            sx={{
              color: "#555",
              "&:hover": { color: "#f0c14b" },
            }}
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </ProductContainer>
  );
}

export default ProductDetail;
