import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductList from "../components/ProductList.jsx";
import {
  Typography,
  Button,
  Box,
  IconButton,
  Grid,
  CircularProgress,
  Pagination,
  Divider,
  TextField,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SortIcon from "@mui/icons-material/Sort";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Custom styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1500,
  margin: "0 auto",
  padding: theme.spacing(4),
  background: "linear-gradient(180deg, #f9f9f9 0%, #e0e4e7 100%)",
  minHeight: "100vh",
  animation: `${fadeIn} 1s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const StickyHeader = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  padding: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  borderRadius: "0 0 16px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff6f61 0%, #ffab40 100%)",
  borderRadius: "20px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
    animation: `${fadeIn} 2s infinite`,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  flexWrap: "wrap",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    padding: theme.spacing(1.5),
  },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#ffab40",
  color: "#fff",
  borderRadius: "12px",
  padding: theme.spacing(1.2),
  "&:hover": {
    backgroundColor: "#ff6f61",
    transform: "rotate(10deg)",
    transition: "all 0.3s ease",
  },
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const SlideTrack = styled(Box)(({ offset }) => ({
  display: "flex",
  transition: "transform 0.6s ease-in-out",
  transform: `translateX(-${offset * 100}%)`,
}));

const SlideCard = styled(Box)(({ theme }) => ({
  flex: "0 0 33.33%",
  padding: theme.spacing(2),
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: { flex: "0 0 100%" },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffab40 0%, #ff6f61 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 4),
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "uppercase",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6f61 0%, #ffab40 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2.5),
    fontSize: "0.9rem",
  },
}));

const AboutSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  animation: `${slideIn} 1s ease-out`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #1e272e 0%, #2f3640 100%)",
  color: "#fff",
  padding: theme.spacing(6),
  marginTop: theme.spacing(4),
  textAlign: "center",
  borderRadius: "20px 20px 0 0",
  boxShadow: "0 -6px 18px rgba(0, 0, 0, 0.2)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: "#dfe6e9",
  textDecoration: "none",
  fontSize: "0.95rem",
  margin: theme.spacing(0, 2),
  "&:hover": {
    color: "#ffab40",
    textDecoration: "underline",
    transition: "all 0.3s ease",
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.15)",
  padding: theme.spacing(1.2),
  "&:hover": {
    background: "#ffab40",
    transform: "scale(1.15)",
    transition: "all 0.3s ease",
  },
}));

function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const itemsPerPage = 8;
  const sliderVisibleItems = isMobile ? 1 : 3;

  const fetchProducts = useCallback(
    async (cat, sortBy, pageNum) => {
      setLoading(true);
      try {
        const params = { page: pageNum, limit: itemsPerPage };
        if (cat !== "All") params.category = cat;
        if (sortBy) params.sort = sortBy;

        const response = await axios.get(
          "https://eshop-backend-e11f.onrender.com/api/products",
          { params }
        );

        setProducts(response.data.products || response.data);
        setTotalPages(response.data.totalPages || 1);
        setError("");
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(t("Failed to load products. Please try again later."));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products",
        { params: { limit: 6 } }
      );
      setFeaturedProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(category, sort, page);
    fetchFeaturedProducts();
  }, [category, sort, page, fetchProducts, fetchFeaturedProducts]);

  const categories = ["All", "T-Shirts", "Jackets", "Pants", "Accessories"];
  const sortOptions = [
    { value: "name-asc", label: t("Name: A-Z") },
    { value: "name-desc", label: t("Name: Z-A") },
    { value: "price-asc", label: t("Price: Low to High") },
    { value: "price-desc", label: t("Price: High to Low") },
  ];

  const handleSlideNext = () => {
    setSlideIndex((prev) =>
      Math.min(
        prev + 1,
        Math.ceil(featuredProducts.length / sliderVisibleItems) - 1
      )
    );
  };

  const handleSlidePrev = () => {
    setSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterEmail("");
    alert(t("Thank you for subscribing!"));
  };

  return (
    <HomeContainer>
      {/* Sticky Header */}
      <StickyHeader>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(90deg, #ff6f61 0%, #ffab40 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          EthioShop
        </Typography>
        <ActionButton component={Link} to="/categories">
          {t("Browse Categories")}
        </ActionButton>
      </StickyHeader>

      {/* Hero Section */}
      <HeroSection>
        <Typography
          variant={isMobile ? "h4" : "h2"}
          sx={{
            fontWeight: 900,
            color: "#fff",
            mb: 2,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            mb: 3,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {t("Explore premium clothing and accessories with unbeatable style.")}
        </Typography>
        <ActionButton
          component={Link}
          to="/categories"
          sx={{ animation: `${bounce} 2s infinite` }}
        >
          {t("Shop Now")}
        </ActionButton>
      </HeroSection>

      {/* Featured Products Slider */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2f3640" }}
      >
        {t("Featured Products")}
      </Typography>
      <SliderContainer>
        <IconButton
          onClick={handleSlidePrev}
          disabled={slideIndex === 0}
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#ffab40",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6f61" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <SlideTrack offset={slideIndex}>
          {featuredProducts.map((product) => (
            <SlideCard key={product._id}>
              <Box
                component="img"
                src={product.image || "https://via.placeholder.com/200"}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: { xs: 160, sm: 220 },
                  objectFit: "cover",
                  borderRadius: "12px",
                  mb: 2,
                }}
              />
              <Typography sx={{ fontWeight: 600, color: "#2f3640" }}>
                {product.name}
              </Typography>
              <Typography sx={{ color: "#ff6f61", fontWeight: 500 }}>
                ${product.price || "N/A"}
              </Typography>
            </SlideCard>
          ))}
        </SlideTrack>
        <IconButton
          onClick={handleSlideNext}
          disabled={
            slideIndex >=
            Math.ceil(featuredProducts.length / sliderVisibleItems) - 1
          }
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#ffab40",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6f61" },
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </SliderContainer>

      {/* Browse Products Section */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2f3640" }}
      >
        {t("Browse Products")}
      </Typography>
      <FilterBar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FilterButton>
            <CategoryIcon />
          </FilterButton>
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? "contained" : "outlined"}
              sx={{
                bgcolor: category === cat ? "#ff6f61" : "#fff",
                color: category === cat ? "#fff" : "#2f3640",
                borderColor: "#ff6f61",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: category === cat ? "#ff8a65" : "#ffebee",
                },
              }}
            >
              {t(cat)}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FilterButton>
            <SortIcon />
          </FilterButton>
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setSort(option.value)}
              variant={sort === option.value ? "contained" : "outlined"}
              sx={{
                bgcolor: sort === option.value ? "#ff6f61" : "#fff",
                color: sort === option.value ? "#fff" : "#2f3640",
                borderColor: "#ff6f61",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: sort === option.value ? "#ff8a65" : "#ffebee",
                },
              }}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </FilterBar>

      {/* Product List */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#ff6f61" }} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center", py: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          <ProductList products={products} />
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              "& .MuiPaginationItem-root": {
                color: "#ff6f61",
                "&.Mui-selected": { bgcolor: "#ff6f61", color: "#fff" },
              },
            }}
          />
        </>
      )}

      {/* About Section */}
      <AboutSection>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 2, color: "#2f3640" }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography sx={{ color: "#636e72", lineHeight: 1.8 }}>
          {t(
            "EthioShop brings you the finest selection of clothing and accessories, blending quality and style. Shop with ease and enjoy fast delivery across Ethiopia."
          )}
        </Typography>
      </AboutSection>

      {/* Footer */}
      <FooterSection>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(90deg, #ffab40 0%, #ff6f61 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4,
          }}
        >
          EthioShop
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Explore")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FooterLink to="/">{t("Home")}</FooterLink>
              <FooterLink to="/categories">{t("Categories")}</FooterLink>
              <FooterLink to="/my-orders">{t("Orders")}</FooterLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Contact Us")}
            </Typography>
            <Typography sx={{ color: "#dfe6e9", mb: 1 }}>
              Email:{" "}
              <FooterLink to="mailto:support@ethioshop.com">
                support@ethioshop.com
              </FooterLink>
            </Typography>
            <Typography sx={{ color: "#dfe6e9" }}>
              Phone: +251 991 792 427
            </Typography>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <SocialIcon>
                <FacebookIcon />
              </SocialIcon>
              <SocialIcon>
                <TwitterIcon />
              </SocialIcon>
              <SocialIcon>
                <InstagramIcon />
              </SocialIcon>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Newsletter")}
            </Typography>
            <form onSubmit={handleNewsletterSubmit}>
              <TextField
                variant="outlined"
                placeholder={t("Enter your email")}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                fullWidth
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "#fff",
                  },
                }}
              />
              <ActionButton type="submit">{t("Subscribe")}</ActionButton>
            </form>
          </Grid>
        </Grid>
        <Typography sx={{ mt: 4, color: "#b2bec3", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} EthioShop. {t("All rights reserved.")}
        </Typography>
      </FooterSection>
    </HomeContainer>
  );
}

export default Home;
