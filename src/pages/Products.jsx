// src/components/Products.jsx
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

  useEffect(() => {
    fetchProducts();
    fetchBundles();
  }, []);

  // Log cart state whenever it changes
  useEffect(() => {}, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products",
        {
          params,
        }
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
      .map((product) => {
        const id = product._id || product.productId;
        if (!id) {
          console.warn("Invalid product in bundle:", product);
        }
        return id;
      })
      .filter(Boolean);

    if (productIds.length === 0) {
      console.error("No valid product IDs found in bundle:", bundle);
      return;
    }

    try {
      for (const productId of productIds) {
        await addToCart(productId);
      }
      // Note: Cart logging moved to useEffect to reflect actual state updates
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
              <ProductCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: "#111", mb: 1 }}
                  >
                    {bundle.name || t("Unnamed Bundle")}
                  </Typography>
                  <Typography
                    sx={{ color: "#555", fontSize: { xs: 12, sm: 14 }, mb: 1 }}
                  >
                    {bundle.description || t("No description")}
                  </Typography>
                  <Typography
                    sx={{ color: "#555", fontSize: { xs: 12, sm: 14 }, mb: 1 }}
                  >
                    {t("Products")}:{" "}
                    {(bundle.products || [])
                      .map((p) => p.name || "Unnamed Product")
                      .join(", ") || t("No products")}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#e74c3c",
                      fontSize: { xs: 12, sm: 14 },
                      mb: 1,
                    }}
                  >
                    {t("Discount")}: {bundle.discount || 0}%
                  </Typography>
                  <Typography
                    sx={{
                      color: "#111",
                      fontWeight: 600,
                      fontSize: { xs: 14, sm: 16 },
                    }}
                  >
                    ${bundle.price || "N/A"}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", pb: 2 }}>
                  <ActionButton onClick={() => handleAddBundleToCart(bundle)}>
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
