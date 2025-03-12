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
  Tooltip,
  CircularProgress,
  Divider,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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

const ribbonPulse = keyframes`
  0% { transform: scale(1) rotate(-45deg) translateZ(0); }
  50% { transform: scale(1.03) rotate(-45deg) translateZ(5px); }
  100% { transform: scale(1) rotate(-45deg) translateZ(0); }
`;

const shine = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotate3D = keyframes`
  0% { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }
  50% { transform: perspective(1000px) rotateY(5deg) rotateX(5deg); }
  100% { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }
`;

// Custom styled components
const ProductsContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "auto",
  padding: theme.spacing(3),
  background: "linear-gradient(135deg, #f9e8d9 0%, #f2d7b8 100%)", // Warm, festive gradient
  borderRadius: "20px",
  minHeight: "80vh",
  animation: `${slideIn} 0.7s ease-out`,
  boxShadow: "0 6px 25px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(255, 215, 0, 0.2)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: "14px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  },
  cursor: "pointer",
  overflow: "hidden",
}));

const GiftBoxCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: "24px",
  boxShadow:
    "0 10px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 105, 135, 0.3)", // 3D shadow with glow
  background: "linear-gradient(145deg, #ff6b81 0%, #ff8e53 50%, #ffcc70 100%)", // Vibrant 3D gradient
  overflow: "hidden",
  transform: "perspective(1000px) rotateY(0deg) rotateX(0deg)",
  transition: "transform 0.5s ease, box-shadow 0.5s ease",
  "&:hover": {
    transform: "perspective(1000px) rotateY(5deg) rotateX(5deg) scale(1.03)",
    boxShadow:
      "0 15px 50px rgba(0, 0, 0, 0.25), 0 0 30px rgba(255, 105, 135, 0.5)",
    animation: `${rotate3D} 4s infinite ease-in-out`,
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
    animation: `${shine} 2.5s infinite`,
    zIndex: 1,
  },
  "&:after": {
    content: '""',
    position: "absolute",
    inset: "4px",
    background: "rgba(255, 255, 255, 0.1)", // Inner 3D depth layer
    borderRadius: "20px",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "18px",
  },
}));

const Ribbon = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "20px",
  left: "-60px",
  width: "200px",
  height: "50px",
  background: "linear-gradient(90deg, #ffd700 0%, #ffec80 100%)", // Luxurious gold ribbon
  transform: "rotate(-45deg) translateZ(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#4a2c00",
  fontWeight: 800,
  fontSize: "1.1rem",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.25)",
  animation: `${ribbonPulse} 2s infinite`,
  zIndex: 3,
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  border: "2px solid #ffcc00",
  [theme.breakpoints.down("sm")]: {
    width: "160px",
    height: "40px",
    fontSize: "0.9rem",
    left: "-50px",
  },
}));

const Bow = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "15px",
  right: "15px",
  width: "60px",
  height: "60px",
  background: "radial-gradient(circle, #ff4040 20%, #ff8080 70%, #ffcccc 100%)", // 3D bow effect
  borderRadius: "50%",
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 0 10px rgba(255, 255, 255, 0.3)",
  zIndex: 2,
  transform: "translateZ(5px)",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "30px",
    height: "30px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.2)",
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: "70px",
    height: "10px",
    background: "#ff4040",
    top: "50%",
    left: "-5px",
    transform: "translateY(-50%) rotate(20deg)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    zIndex: -1,
  },
  [theme.breakpoints.down("sm")]: {
    width: "45px",
    height: "45px",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: theme.spacing(1, 2.5),
  borderRadius: "10px",
  fontWeight: 700,
  "&:hover": {
    backgroundColor: "#d9a32a",
    transform: "scale(1.06)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  transition: "background-color 0.3s, transform 0.3s",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.75, 1.5),
    fontSize: "0.8rem",
  },
}));

const BundleButton = styled(Button)(({ theme, added }) => ({
  backgroundColor: added ? "#4caf50" : "#ffffff",
  color: added ? "#fff" : "#ff6b81",
  padding: theme.spacing(1.5, 3.5),
  borderRadius: "14px",
  fontWeight: 800,
  fontSize: { xs: "0.9rem", sm: "1.1rem" },
  textTransform: "uppercase",
  boxShadow: added
    ? "0 4px 15px rgba(76, 175, 80, 0.4)"
    : "0 4px 15px rgba(255, 107, 129, 0.3)",
  border: `3px solid ${added ? "#4caf50" : "#ff6b81"}`,
  "&:hover": {
    backgroundColor: added ? "#388e3c" : "#ffebee",
    animation: `${pulse} 0.6s infinite`,
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.85rem",
  },
}));

const FavoriteButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? "#e91e63" : "#777",
  "&:hover": {
    transform: "scale(1.15)",
    transition: "transform 0.2s",
  },
  boxShadow: active ? "0 2px 8px rgba(233, 30, 99, 0.3)" : "none",
}));

function Products() {
  const { user } = useContext(AuthContext);
  const { addToCart, cart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedBundles, setAddedBundles] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchBundles();
  }, []);

  useEffect(() => {}, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products",
        { params }
      );
      const fetchedProducts = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];
      setProducts(fetchedProducts);
      setError("");
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError(t("Failed to load products. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/bundles"
      );
      const fetchedBundles = Array.isArray(response.data) ? response.data : [];
      setBundles(fetchedBundles);
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
    }
  };

  const handleAddToCart = (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(productId);
  };

  const handleWishlistToggle = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (wishlist.some((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddBundleToCart = async (bundle) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const productIds = (bundle.products || [])
      .map((product) => product._id || product.productId)
      .filter(Boolean);
    if (productIds.length === 0) {
      console.error("No valid product IDs found in bundle:", bundle);
      return;
    }
    try {
      await Promise.all(
        productIds.map((productId) =>
          addToCart(productId, {
            bundleId: bundle._id,
            name: bundle.name,
            discount: bundle.discount || 0,
            bundlePrice: bundle.price,
          })
        )
      );
      setAddedBundles((prev) => ({ ...prev, [bundle._id]: true }));
      setTimeout(
        () => setAddedBundles((prev) => ({ ...prev, [bundle._id]: false })),
        2000
      );
    } catch (error) {
      console.error("Failed to add bundle to cart:", error);
    }
  };

  return (
    <ProductsContainer>
      {/* Bundles Section */}
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          color: "#4a2c00",
          fontWeight: 800,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
          letterSpacing: "1px",
        }}
      >
        {t("Gift Bundles")}
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: isMobile ? 2 : 4,
          }}
        >
          <CircularProgress
            sx={{ color: "#ff8e53" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : bundles.length === 0 ? (
        <Typography
          sx={{
            color: "#777",
            textAlign: "center",
            py: isMobile ? 2 : 4,
            fontSize: { xs: 14, sm: 16 },
          }}
        >
          {t("No bundles available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 2 : 4}>
          {bundles.map((bundle) => (
            <Grid item xs={12} sm={6} md={4} key={bundle._id}>
              <GiftBoxCard>
                <Ribbon>{t("Special Offer")}</Ribbon>
                <Bow />
                <CardContent
                  sx={{ position: "relative", zIndex: 2, color: "#fff" }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      textShadow: "0 3px 6px rgba(0, 0, 0, 0.4)",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {bundle.name || t("Unnamed Bundle")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: 13, sm: 15 }, mb: 1.5, opacity: 0.9 }}
                  >
                    {bundle.description || t("No description")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: 13, sm: 15 }, mb: 1.5, opacity: 0.9 }}
                  >
                    {t("Includes")}:{" "}
                    {(bundle.products || [])
                      .map((p) => p.name || "Unnamed Product")
                      .join(", ") || t("No products")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 14, sm: 16 },
                      mb: 1,
                      fontWeight: 700,
                      color: "#ffd700",
                      textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {t("Save")}: {bundle.discount || 0}%
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: 20, sm: 24 },
                      textShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    ${bundle.price || "N/A"}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", pb: 3 }}>
                  <BundleButton
                    added={addedBundles[bundle._id]}
                    onClick={() => handleAddBundleToCart(bundle)}
                  >
                    <ShoppingCartIcon
                      sx={{ mr: 1, fontSize: isMobile ? 18 : 22 }}
                    />
                    {addedBundles[bundle._id]
                      ? t("Added!")
                      : `${t("Add Bundle")} - ${bundle.discount}%`}
                  </BundleButton>
                </Box>
              </GiftBoxCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Products Section */}
      <Divider sx={{ my: isMobile ? 3 : 5, bgcolor: "rgba(0, 0, 0, 0.1)" }} />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          color: "#4a2c00",
          fontWeight: 800,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
          letterSpacing: "1px",
        }}
      >
        {t("Products")}
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: isMobile ? 2 : 4,
          }}
        >
          <CircularProgress
            sx={{ color: "#ff8e53" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : products.length === 0 ? (
        <Typography
          sx={{
            color: "#777",
            textAlign: "center",
            py: isMobile ? 2 : 4,
            fontSize: { xs: 14, sm: 16 },
          }}
        >
          {t("No products available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 2 : 4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard onClick={() => navigate(`/product/${product._id}`)}>
                <CardMedia
                  component="img"
                  height={isMobile ? "160" : "220"}
                  image={product.image || "https://via.placeholder.com/150"}
                  alt={product.name || "Product"}
                  sx={{ borderRadius: "14px 14px 0 0", objectFit: "cover" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      fontSize: { xs: 15, sm: 17 },
                      mb: 1,
                    }}
                  >
                    {product.name || t("Unnamed Product")}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#333",
                      fontWeight: 700,
                      fontSize: { xs: 15, sm: 17 },
                      mb: 1,
                    }}
                  >
                    ${product.price || "N/A"}
                  </Typography>
                  <Typography
                    sx={{ color: "#666", fontSize: { xs: 13, sm: 15 } }}
                  >
                    {t(product.category || "Uncategorized")}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Tooltip
                    title={
                      wishlist.some((item) => item._id === product._id)
                        ? t("Remove from Wishlist")
                        : t("Add to Wishlist")
                    }
                  >
                    <FavoriteButton
                      active={wishlist.some((item) => item._id === product._id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(product);
                      }}
                    >
                      {wishlist.some((item) => item._id === product._id) ? (
                        <FavoriteIcon
                          fontSize={isMobile ? "small" : "medium"}
                        />
                      ) : (
                        <FavoriteBorderIcon
                          fontSize={isMobile ? "small" : "medium"}
                        />
                      )}
                    </FavoriteButton>
                  </Tooltip>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                  >
                    <ShoppingCartIcon
                      sx={{ mr: 1, fontSize: isMobile ? 18 : 22 }}
                    />
                    {t("Add to Cart")}
                  </ActionButton>
                </Box>
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      )}
    </ProductsContainer>
  );
}

export default Products;
