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
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Custom styled components
const ProductsContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
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
  backgroundColor: "#fff",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  cursor: "pointer",
}));

const GiftBoxCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
  background: "linear-gradient(135deg, #ff6f61 0%, #ffccbc 100%)", // Gift box gradient
  overflow: "hidden",
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.03)",
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-10%",
    left: "50%",
    width: "120%",
    height: "120%",
    background: "rgba(255, 255, 255, 0.1)",
    transform: "translateX(-50%) rotate(45deg)",
    animation: `${ribbonPulse} 2s infinite`,
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "12px",
  },
}));

const Ribbon = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  left: "-40px",
  width: "150px",
  height: "30px",
  backgroundColor: "#ffd700", // Gold ribbon
  transform: "rotate(-45deg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#111",
  fontWeight: 600,
  fontSize: "0.9rem",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: {
    width: "120px",
    height: "25px",
    fontSize: "0.75rem",
    left: "-30px",
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

const BundleButton = styled(Button)(({ theme, added }) => ({
  backgroundColor: added ? "#4caf50" : "#ffffff",
  color: added ? "#fff" : "#ff6f61",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: { xs: "0.85rem", sm: "1rem" },
  textTransform: "uppercase",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  border: `2px solid ${added ? "#4caf50" : "#ff6f61"}`,
  "&:hover": {
    backgroundColor: added ? "#388e3c" : "#ffebee",
    animation: `${pulse} 0.5s infinite`,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.8rem",
  },
  transition: "background-color 0.3s",
}));

const FavoriteButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? "#e74c3c" : "#555",
  "&:hover": {
    transform: "scale(1.1)",
    transition: "transform 0.2s",
  },
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
      for (const productId of productIds) {
        await addToCart(productId, {
          bundleId: bundle._id,
          name: bundle.name,
          discount: bundle.discount || 0,
          bundlePrice: bundle.price,
        });
      }
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
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Bundles")}
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
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : bundles.length === 0 ? (
        <Typography
          sx={{
            color: "#555",
            textAlign: "center",
            py: isMobile ? 2 : 4,
            fontSize: { xs: 12, sm: 16 },
          }}
        >
          {t("No bundles available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 1 : 3}>
          {bundles.map((bundle) => (
            <Grid item xs={12} sm={6} md={4} key={bundle._id}>
              <GiftBoxCard>
                <Ribbon>{t("Gift Bundle")}</Ribbon>
                <CardContent
                  sx={{ position: "relative", zIndex: 2, color: "#fff" }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {bundle.name || t("Unnamed Bundle")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: 12, sm: 14 }, mb: 1, opacity: 0.9 }}
                  >
                    {bundle.description || t("No description")}
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: 12, sm: 14 }, mb: 1, opacity: 0.9 }}
                  >
                    {t("Products")}:{" "}
                    {(bundle.products || [])
                      .map((p) => p.name || "Unnamed Product")
                      .join(", ") || t("No products")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, sm: 14 },
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    {t("Save")}: {bundle.discount || 0}%
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}
                  >
                    ${bundle.price || "N/A"}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
                  <BundleButton
                    added={addedBundles[bundle._id]}
                    onClick={() => handleAddBundleToCart(bundle)}
                  >
                    <ShoppingCartIcon
                      sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }}
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
      <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#eee" }} />
      <Typography
        variant={isMobile ? "h6" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
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
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : products.length === 0 ? (
        <Typography
          sx={{
            color: "#555",
            textAlign: "center",
            py: isMobile ? 2 : 4,
            fontSize: { xs: 12, sm: 16 },
          }}
        >
          {t("No products available")}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 1 : 3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard onClick={() => navigate(`/product/${product._id}`)}>
                <CardMedia
                  component="img"
                  height={isMobile ? "150" : "200"}
                  image={product.image || "https://via.placeholder.com/150"}
                  alt={product.name || "Product"}
                  sx={{ borderRadius: "12px 12px 0 0", objectFit: "cover" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: "#111",
                      fontSize: { xs: 14, sm: 16 },
                      mb: 1,
                    }}
                  >
                    {product.name || t("Unnamed Product")}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#111",
                      fontWeight: 600,
                      fontSize: { xs: 14, sm: 16 },
                      mb: 1,
                    }}
                  >
                    ${product.price || "N/A"}
                  </Typography>
                  <Typography
                    sx={{ color: "#555", fontSize: { xs: 12, sm: 14 } }}
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
                      sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }}
                    />{" "}
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
