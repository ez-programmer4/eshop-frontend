import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  keyframes,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "0 auto",
  padding: theme.spacing(3),
  backgroundColor: "#f5f6fa",
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  backgroundColor: "#fff",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
  },
  cursor: "pointer",
  overflow: "hidden",
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: "#333",
  fontWeight: 500,
  textAlign: "center",
  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
  padding: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: "#222",
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  animation: `${fadeIn} 0.8s ease-in`,
}));

function Home() {
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
      const categoryMap = response.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] =
            product.image || "https://picsum.photos/150?blur=2";
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
    e.target.src = "https://picsum.photos/150?blur=2"; // Fallback image
  };

  return (
    <HomeContainer>
      {/* Categories Section */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle variant={isMobile ? "h5" : "h4"}>
          {t("Explore Categories")}
        </SectionTitle>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 2,
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
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              bgcolor: "#ffebee",
              p: 1.5,
              borderRadius: "8px",
            }}
          >
            {error}
          </Typography>
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {categoriesWithImages.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.name}>
                <CategoryCard
                  onClick={() => handleCategoryClick(category.name)}
                  sx={{ animation: `${slideUp} 0.5s ease-out` }}
                >
                  <CardMedia
                    component="img"
                    height={isMobile ? "80" : "100"}
                    image={category.image}
                    alt={category.name}
                    onError={handleImageError}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ py: 0.5 }}>
                    <CategoryTitle>{t(category.name)}</CategoryTitle>
                  </CardContent>
                </CategoryCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Placeholder for additional sections (e.g., featured products) */}
      <Box>
        <SectionTitle variant={isMobile ? "h5" : "h4"}>
          {t("Featured Products")}
        </SectionTitle>
        <Typography variant="body1" sx={{ color: "#555", textAlign: "center" }}>
          {t("Coming soon...")}
        </Typography>
      </Box>
    </HomeContainer>
  );
}

export default Home;
