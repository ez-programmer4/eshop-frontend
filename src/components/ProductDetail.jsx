// src/components/ProductDetail.jsx
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
const ProductContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
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

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  cursor: "pointer",
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
  "&:disabled": {
    backgroundColor: "#ccc",
    color: "#888",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: "transform 0.2s, color 0.2s",
  "&:hover": {
    transform: "scale(1.2) rotate(5deg)",
    color: "#f0c14b",
    animation: `${pulse} 0.5s infinite`,
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
        await Promise.all([
          fetchProduct(),
          fetchRelatedProducts(),
          fetchRecommendations(),
        ]);
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

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${id}`
      );
      setProduct(response.data);
    } catch (error) {
      throw new Error(t("Failed to load product details"));
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/related/${id}`
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
        "http://localhost:5000/api/products/recommendations",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
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
    addToCart(product._id);
    setSuccess(t("Added to cart!"));
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id); // Pass string ID
      setSuccess(t("Removed from wishlist"));
    } else {
      addToWishlist(product._id); // Pass string ID
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
        `http://localhost:5000/api/products/${id}/reviews`,
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
    const text = `${t("Check out this")} ${product?.name || t("product")} ${t(
      "on Clothing Store! Only"
    )} $${product?.price || "N/A"}. ${url}`;
    let shareUrl;

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          text
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      </ProductContainer>
    );
  }

  if (!product) {
    return (
      <ProductContainer>
        <Typography sx={{ textAlign: "center", color: "#555" }}>
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
        backgroundColor: "#f0c14b",
        borderColor: "#e0b03a",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: t("Rating Distribution"), color: "#111" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: t("Number of Reviews"), color: "#555" },
        ticks: { color: "#555" },
      },
      x: { ticks: { color: "#555" } },
    },
  };

  return (
    <ProductContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {product.name}
      </Typography>

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

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={product.image || "https://picsum.photos/400?blur=2"}
            alt={product.name}
            sx={{
              borderRadius: "12px",
              width: "100%",
              height: "auto",
              maxHeight: isMobile ? 300 : 400,
              objectFit: "cover",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ color: "#f0c14b", mb: 2 }}>
            ${product.price}
          </Typography>
          <Typography sx={{ mb: 3, color: "#555" }}>
            {product.description}
          </Typography>
          <Typography sx={{ mb: 2, color: "#555" }}>
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
                  : "#555",
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
          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111", fontWeight: 600, mb: 2 }}
          >
            {t("Rating Summary")}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ mb: 1, color: "#555" }}>
              {ratingStats.averageRating} / 5 ({ratingStats.totalReviews}{" "}
              {t("reviews")})
            </Typography>
            <Rating
              value={parseFloat(ratingStats.averageRating)}
              readOnly
              precision={0.1}
            />
            <Box
              sx={{
                maxWidth: isMobile ? 300 : 400,
                mt: 2,
                height: isMobile ? 150 : 200,
              }}
            >
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Box>

          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#111", fontWeight: 600 }}>
              {t("Reviews")}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showAllReviews}
                  onChange={(e) => setShowAllReviews(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#f0c14b" },
                  }}
                />
              }
              label={t("Show All Reviews")}
              sx={{ color: "#555" }}
            />
          </Box>

          {user && (
            <Card
              sx={{
                p: isMobile ? 2 : 3,
                mb: 4,
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "#111" }}>
                  {t("Leave a Review")}
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  sx={{ mb: 2 }}
                />
                <StyledTextField
                  label={t("Your Review")}
                  multiline
                  rows={isMobile ? 3 : 4}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <ActionButton onClick={handleReviewSubmit}>
                  {t("Submit Review")}
                </ActionButton>
              </CardContent>
            </Card>
          )}

          {product.reviews.filter((review) => showAllReviews || !review.pending)
            .length === 0 ? (
            <Typography sx={{ color: "#555" }}>
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
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: isMobile ? 1 : 0,
                          }}
                        >
                          <Typography sx={{ fontWeight: 500, color: "#111" }}>
                            {review.userId.name}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                          {review.pending && (
                            <Typography
                              sx={{ color: "#e74c3c", fontSize: "0.9rem" }}
                            >
                              ({t("Pending")})
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ color: "#555" }}>
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
          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111", fontWeight: 600, mb: 3 }}
          >
            {t("Recommended For You")}
          </Typography>
          {user && recommendations.length === 0 ? (
            <Typography sx={{ color: "#555" }}>
              {t("No recommendations available yet.")}
            </Typography>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {recommendations.map((rec) => (
                <Grid item xs={12} sm={6} md={4} key={rec._id}>
                  <ProductCard onClick={() => navigate(`/product/${rec._id}`)}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "150" : "200"}
                      image={rec.image || "https://picsum.photos/200?blur=2"}
                      alt={rec.name || t("Product")}
                      sx={{ borderRadius: "12px 12px 0 0" }}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "#111" }}>
                        {rec.name || t("Unnamed Product")}
                      </Typography>
                      <Typography sx={{ color: "#f0c14b" }}>
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
          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111", fontWeight: 600, mb: 3 }}
          >
            {t("Related Products")}
          </Typography>
          {relatedProducts.length === 0 ? (
            <Typography sx={{ color: "#555" }}>
              {t("No related products available.")}
            </Typography>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {relatedProducts.map((related) => (
                <Grid item xs={12} sm={6} md={4} key={related._id}>
                  <ProductCard
                    onClick={() => navigate(`/product/${related._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height={isMobile ? "150" : "200"}
                      image={
                        related.image || "https://picsum.photos/200?blur=2"
                      }
                      alt={related.name || t("Product")}
                      sx={{ borderRadius: "12px 12px 0 0" }}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "#111" }}>
                        {related.name || t("Unnamed Product")}
                      </Typography>
                      <Typography sx={{ color: "#f0c14b" }}>
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

      <Dialog open={openShare} onClose={() => setOpenShare(false)}>
        <DialogTitle sx={{ bgcolor: "#f7f7f7", color: "#111" }}>
          {t("Share This Product")}
        </DialogTitle>
        <DialogContent>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("twitter")}
            sx={{
              mb: 1,
              color: "#1DA1F2",
              borderColor: "#1DA1F2",
              "&:hover": { bgcolor: "#e6f3fa" },
            }}
          >
            {t("Share on Twitter")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("whatsapp")}
            sx={{
              mb: 1,
              color: "#25D366",
              borderColor: "#25D366",
              "&:hover": { bgcolor: "#e9f7ef" },
            }}
          >
            {t("Share on WhatsApp")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("facebook")}
            sx={{
              mb: 1,
              color: "#4267B2",
              borderColor: "#4267B2",
              "&:hover": { bgcolor: "#e8eef6" },
            }}
          >
            {t("Share on Facebook")}
          </ActionButton>
          <ActionButton
            fullWidth
            variant="outlined"
            onClick={() => shareViaPlatform("telegram")}
            sx={{
              mb: 1,
              color: "#0088cc",
              borderColor: "#0088cc",
              "&:hover": { bgcolor: "#e6f0fa" },
            }}
          >
            {t("Share on Telegram")}
          </ActionButton>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShare(false)} sx={{ color: "#555" }}>
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </ProductContainer>
  );
}

export default ProductDetail;
