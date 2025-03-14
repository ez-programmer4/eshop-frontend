import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Custom styled components
const CategoriesContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "0 auto",
  padding: theme.spacing(3),
  background: "linear-gradient(135deg, #f7f7f7 0%, #e8ecef 100%)",
  borderRadius: "16px",
  minHeight: "80vh",
  animation: `${slideIn} 0.5s ease-out`,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: "12px",
  },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
  },
  cursor: "pointer",
  overflow: "hidden",
  position: "relative",
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  color: "#111",
  fontWeight: 600,
  textAlign: "center",
  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#f0c14b", // Accent color on hover
  },
}));

const ImageOverlay = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))",
  zIndex: 1,
});

function Categories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [categoriesWithImages, setCategoriesWithImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products"
      );
      // Group products by category and pick the first image for each
      const categoryMap = response.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] =
            product.image || "https://picsum.photos/200?blur=2";
        }
        return acc;
      }, {});

      const uniqueCategories = Object.keys(categoryMap).map((category) => ({
        name: category,
        image: categoryMap[category],
      }));

      setCategoriesWithImages(uniqueCategories);
      setError("");
    } catch (error) {
      setError(t("Failed to load categories"));
      console.error(
        "Fetch categories error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleImageError = (e) => {
    e.target.src = "https://picsum.photos/200?blur=2"; // Fallback image
  };

  return (
    <CategoriesContainer>
      <Typography
        variant={isMobile ? "h5" : "h3"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
          animation: `${fadeIn} 0.8s ease-in`,
        }}
      >
        {t("Shop by Category")}
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: isMobile ? 2 : 4,
            animation: `${fadeIn} 0.5s ease-in`,
          }}
        >
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          sx={{
            mb: 2,
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            bgcolor: "#ffebee",
            p: 2,
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            animation: `${fadeIn} 0.5s ease-in`,
          }}
        >
          {error}
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 1 : 3}>
          {categoriesWithImages.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.name}>
              <CategoryCard onClick={() => handleCategoryClick(category.name)}>
                <CardMedia
                  component="img"
                  height={isMobile ? "150" : "200"}
                  image={category.image}
                  alt={category.name}
                  onError={handleImageError}
                  sx={{ borderRadius: "16px 16px 0 0", objectFit: "cover" }}
                />
                <ImageOverlay />
                <CardContent sx={{ py: isMobile ? 1 : 2 }}>
                  <CardTitle>{t(category.name)}</CardTitle>
                </CardContent>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>
      )}
    </CategoriesContainer>
  );
}

export default Categories;
