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
  0% { transform: scale(1) rotate(-45deg); }
  50% { transform: scale(1.03) rotate(-45deg); }
  100% { transform: scale(1) rotate(-45deg); }
`;

const shine = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled Components
const ProductsContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  margin: "0 auto",
  padding: theme.spacing(4),
  minHeight: "100vh",
  background: `url("https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWluaW1hbGlzdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D") no-repeat center/cover, linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)`,
  animation: `${slideIn} 0.8s ease-out`,
  [theme.breakpoints.down("md")]: { padding: theme.spacing(3) },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  backgroundColor: "#fff",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
  },
  cursor: "pointer",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: { borderRadius: "12px" },
}));

const GiftBoxCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: "20px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
  background: "linear-gradient(145deg, #ff6b81 0%, #feb47b 100%)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    animation: `${shine} 3s infinite`,
    zIndex: 1,
  },
  [theme.breakpoints.down("sm")]: { borderRadius: "16px" },
}));

const Ribbon = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "15px",
  left: "-50px",
  width: "180px",
  height: "40px",
  background: "linear-gradient(90deg, #ffd700 0%, #ffec80 100%)",
  transform: "rotate(-45deg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1a202c",
  fontWeight: 700,
  fontSize: "1rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  animation: `${ribbonPulse} 2s infinite`,
  zIndex: 2,
  textTransform: "uppercase",
  letterSpacing: "1px",
  [theme.breakpoints.down("sm")]: {
    width: "140px",
    height: "35px",
    fontSize: "0.85rem",
    left: "-40px",
  },
}));

const Bow = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "10px",
  right: "10px",
  width: "50px",
  height: "50px",
  background: "radial-gradient(circle, #ff4040 20%, #ff8080 70%)",
  borderRadius: "50%",
  boxShadow:
    "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 0 8px rgba(255, 255, 255, 0.2)",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "25px",
    height: "25px",
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  },
  [theme.breakpoints.down("sm")]: { width: "40px", height: "40px" },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #feb47b 0%, #ff6b81 100%)",
  color: "#fff",
  padding: theme.spacing(1, 2.5),
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "0.95rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6b81 0%, #feb47b 100%)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.75, 2),
    fontSize: "0.85rem",
  },
}));

const BundleButton = styled(Button)(({ theme, added }) => ({
  backgroundColor: added ? "#4caf50" : "#fff",
  color: added ? "#fff" : "#ff6b81",
  padding: theme.spacing(1.5, 3),
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  boxShadow: added
    ? "0 4px 12px rgba(76, 175, 80, 0.3)"
    : "0 4px 12px rgba(0, 0, 0, 0.05)",
  border: `2px solid ${added ? "#4caf50" : "#ff6b81"}`,
  "&:hover": {
    backgroundColor: added ? "#388e3c" : "#fff0f0",
    boxShadow: added
      ? "0 6px 16px rgba(76, 175, 80, 0.4)"
      : "0 6px 16px rgba(255, 107, 129, 0.2)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.9rem",
  },
}));

const FavoriteButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? "#ff6b81" : "#4a5568",
  "&:hover": { transform: "scale(1.2)", color: "#feb47b" },
  transition: "all 0.3s ease",
  boxShadow: active ? "0 2px 8px rgba(255, 107, 129, 0.3)" : "none",
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
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedBundles, setAddedBundles] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchBundles();
  }, []);

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
        variant={isMobile ? "h5" : "h4"}
        sx={{
          fontWeight: 700,
          color: "#1a202c",
          textAlign: "center",
          mb: isMobile ? 3 : 5,
          letterSpacing: "-0.3px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        {t("Gift Bundles")}
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress
            sx={{ color: "#ff6b81" }}
            size={isMobile ? 40 : 50}
          />
        </Box>
      ) : bundles.length === 0 ? (
        <Typography
          sx={{
            color: "#4a5568",
            textAlign: "center",
            py: 4,
            fontSize: "1.1rem",
          }}
        >
          {t("No bundles available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 2 : isTablet ? 3 : 4}>
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
                      fontWeight: 700,
                      mb: 2,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {bundle.name || t("Unnamed Bundle")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.95rem", mb: 1.5, opacity: 0.9 }}
                  >
                    {bundle.description || t("No description")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.95rem", mb: 1.5, opacity: 0.9 }}
                  >
                    {t("Includes")}:{" "}
                    {(bundle.products || [])
                      .map((p) => p.name || "Unnamed Product")
                      .join(", ") || t("No products")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      mb: 1,
                      fontWeight: 600,
                      color: "#ffd700",
                    }}
                  >
                    {t("Save")}: {bundle.discount || 0}%
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
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
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    {addedBundles[bundle._id] ? t("Added!") : t("Add Bundle")}
                  </BundleButton>
                </Box>
              </GiftBoxCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Products Section */}
      <Divider sx={{ my: isMobile ? 4 : 6, bgcolor: "rgba(0, 0, 0, 0.05)" }} />
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          fontWeight: 700,
          color: "#1a202c",
          textAlign: "center",
          mb: isMobile ? 3 : 5,
          letterSpacing: "-0.3px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        {t("Products")}
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress
            sx={{ color: "#ff6b81" }}
            size={isMobile ? 40 : 50}
          />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          sx={{
            textAlign: "center",
            py: 3,
            fontSize: "1.2rem",
            fontWeight: 500,
          }}
        >
          {error}
        </Typography>
      ) : products.length === 0 ? (
        <Typography
          sx={{
            color: "#4a5568",
            textAlign: "center",
            py: 4,
            fontSize: "1.1rem",
          }}
        >
          {t("No products available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 2 : isTablet ? 3 : 4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard onClick={() => navigate(`/product/${product._id}`)}>
                <CardMedia
                  component="img"
                  height={isMobile ? "160" : isTablet ? "200" : "240"}
                  image={product.image || "https://via.placeholder.com/150"}
                  alt={product.name || "Product"}
                  sx={{ borderRadius: "16px 16px 0 0", objectFit: "cover" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1a202c",
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      mb: 1,
                    }}
                  >
                    {product.name || t("Unnamed Product")}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#ff6b81",
                      fontWeight: 700,
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      mb: 1,
                    }}
                  >
                    ${product.price || "N/A"}
                  </Typography>
                  <Typography sx={{ color: "#4a5568", fontSize: "0.95rem" }}>
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
                    <ShoppingCartIcon sx={{ mr: 1 }} />
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
