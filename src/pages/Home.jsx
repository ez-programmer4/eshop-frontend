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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Custom styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "auto",
  padding: theme.spacing(3),
  background: "linear-gradient(180deg, #f7f7f7 0%, #e8ecef 100%)",
  borderRadius: "16px",
  minHeight: "80vh",
  animation: `${slideIn} 0.8s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #f0c14b 0%, #ff5722 100%)",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    zIndex: 0,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  flexWrap: "wrap",
  justifyContent: "center",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#ff5722",
  border: "2px solid #ff5722",
  borderRadius: "10px",
  padding: { xs: theme.spacing(0.75), sm: theme.spacing(1) },
  "&:hover": {
    backgroundColor: "#ff5722",
    color: "#fff",
    transform: "scale(1.1)",
    transition: "all 0.3s ease",
  },
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(3),
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
  },
}));

const SlideTrack = styled(Box)(({ theme, offset }) => ({
  display: "flex",
  transition: "transform 0.5s ease",
  transform: `translateX(-${offset * 100}%)`,
}));

const SlideCard = styled(Box)(({ theme }) => ({
  flex: "0 0 33.33%",
  padding: theme.spacing(1.5),
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease",
  "&:hover": { transform: "scale(1.03)" },
  [theme.breakpoints.down("sm")]: {
    flex: "0 0 100%",
    padding: theme.spacing(1),
  },
}));

const BrowseButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #f0c14b 0%, #ff9800 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 3),
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: { xs: "0.85rem", sm: "1rem" },
  textTransform: "uppercase",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    background: "linear-gradient(135deg, #e0b03a 0%, #fb8c00 100%)",
    transform: "scale(1.05)",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
  },
}));

const AboutSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  animation: `${fadeIn} 1.2s ease-out`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #232f3e 0%, #1a252f 100%)",
  color: "#fff",
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  textAlign: "center",
  borderRadius: "16px 16px 0 0",
  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.2)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: "#e0e0e0",
  textDecoration: "none",
  fontSize: { xs: "0.8rem", sm: "0.9rem" },
  margin: theme.spacing(0, 1.5),
  "&:hover": {
    color: "#f0c14b",
    transition: "color 0.3s ease",
    textDecoration: "underline",
  },
}));

const FooterIconButton = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.1)",
  padding: theme.spacing(1),
  "&:hover": {
    color: "#f0c14b",
    transform: "scale(1.2)",
    background: "rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
  },
}));

const FooterTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#ccc" },
    "&:hover fieldset": { borderColor: "#f0c14b" },
    "&.Mui-focused fieldset": { borderColor: "#f0c14b" },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
    fontSize: { xs: "0.85rem", sm: "1rem" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f0c14b" },
  "& input": { padding: { xs: "6px 10px", sm: "8px 12px" } },
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

  const itemsPerPage = 6;
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
  }, [category, sort, page, fetchProducts]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

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
      {/* Hero Section */}
      <HeroSection>
        <Typography
          variant={isMobile ? "h5" : "h3"}
          sx={{
            background: "linear-gradient(90deg, #fff 0%, #f0c14b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            mb: isMobile ? 1 : 2,
            letterSpacing: 1,
            zIndex: 1,
            position: "relative",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            fontSize: { xs: 14, sm: 18 },
            mb: isMobile ? 2 : 3,
            fontWeight: 500,
            zIndex: 1,
            position: "relative",
          }}
        >
          {t("Discover the latest trends in clothing and accessories")}
        </Typography>
        <BrowseButton component={Link} to="/categories">
          {t("Shop Now")}
        </BrowseButton>
      </HeroSection>

      {/* Featured Products Slider */}
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          color: "#111",
          fontWeight: 700,
          mb: 2,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {t("Featured Products")}
      </Typography>
      <SliderContainer>
        <IconButton
          onClick={handleSlidePrev}
          disabled={slideIndex === 0}
          sx={{
            position: "absolute",
            left: isMobile ? 5 : 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#fff",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { bgcolor: "#f0c14b", color: "#fff" },
          }}
        >
          <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <SlideTrack offset={slideIndex}>
          {featuredProducts.map((product) => (
            <SlideCard key={product._id}>
              <Box
                component="img"
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: isMobile ? "140px" : "180px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  mb: 1.5,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                {product.name || t("Unnamed Product")}
              </Typography>
              <Typography
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#ff5722" }}
              >
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
            right: isMobile ? 5 : 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#fff",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { bgcolor: "#f0c14b", color: "#fff" },
          }}
        >
          <ArrowForwardIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </SliderContainer>

      {/* Browse Products Section */}
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          color: "#111",
          fontWeight: 700,
          mb: 2,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {t("Browse Products")}
      </Typography>
      <FilterBar>
        {/* Category Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 1 : 1.5,
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-start",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <FilterButton>
            <CategoryIcon fontSize={isMobile ? "small" : "medium"} />
          </FilterButton>
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? "contained" : "outlined"}
              sx={{
                bgcolor: category === cat ? "#ff5722" : "#fff",
                color: category === cat ? "#fff" : "#555",
                borderColor: "#ff5722",
                borderRadius: "10px",
                padding: isMobile ? "6px 10px" : "8px 16px",
                fontSize: isMobile ? "0.75rem" : "0.9rem",
                minWidth: isMobile ? "70px" : "90px",
                textTransform: "capitalize",
                "&:hover": {
                  bgcolor: category === cat ? "#e64a19" : "#fff5f0",
                  color: category === cat ? "#fff" : "#ff5722",
                },
              }}
            >
              {t(cat)}
            </Button>
          ))}
        </Box>

        {/* Divider */}
        <Divider
          orientation={isMobile ? "horizontal" : "vertical"}
          flexItem
          sx={{
            bgcolor: "linear-gradient(90deg, #f0c14b, #ff5722)",
            mx: isMobile ? 0 : 2,
            my: isMobile ? 1 : 0,
            width: isMobile ? "80%" : "auto",
            border: "none",
            height: isMobile ? "1px" : "40px",
            background: "linear-gradient(90deg, #f0c14b, #ff5722)",
          }}
        />

        {/* Sort Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 1 : 1.5,
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-start",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <FilterButton>
            <SortIcon fontSize={isMobile ? "small" : "medium"} />
          </FilterButton>
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setSort(option.value)}
              variant={sort === option.value ? "contained" : "outlined"}
              sx={{
                bgcolor: sort === option.value ? "#ff5722" : "#fff",
                color: sort === option.value ? "#fff" : "#555",
                borderColor: "#ff5722",
                borderRadius: "10px",
                padding: isMobile ? "6px 10px" : "8px 16px",
                fontSize: isMobile ? "0.75rem" : "0.9rem",
                minWidth: isMobile ? "80px" : "110px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: sort === option.value ? "#e64a19" : "#fff5f0",
                  color: sort === option.value ? "#fff" : "#ff5722",
                },
              }}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </FilterBar>

      {/* Product List with Pagination */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: isMobile ? 3 : 4,
          }}
        >
          <CircularProgress
            sx={{ color: "#ff5722" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          sx={{
            mb: 2,
            textAlign: "center",
            fontSize: { xs: 14, sm: 16 },
            bgcolor: "#ffebee",
            p: 1.5,
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
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
              mt: isMobile ? 3 : 4,
              "& .MuiPaginationItem-root": {
                color: "#ff5722",
                "&:hover": { bgcolor: "#fff5f0" },
                "&.Mui-selected": { bgcolor: "#ff5722", color: "#fff" },
              },
            }}
            size={isMobile ? "small" : "medium"}
          />
        </>
      )}

      {/* About the System */}
      <AboutSection>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            color: "#111",
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#666",
            fontSize: { xs: 14, sm: 16 },
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {t(
            "EthioShop is your one-stop destination for quality clothing and accessories. Browse our curated collections, enjoy seamless shopping, and experience fast delivery across Ethiopia. Sign up today to unlock exclusive offers!"
          )}
        </Typography>
      </AboutSection>

      {/* Footer */}
      <FooterSection>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 800,
                background: "linear-gradient(90deg, #f0c14b 0%, #ff5722 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {"EthioShop"}
            </Typography>
          </Link>
        </Box>
        <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}
            >
              {t("Explore")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                alignItems: "center",
              }}
            >
              <FooterLink to="/">{t("Home")}</FooterLink>
              <FooterLink to="/categories">{t("Categories")}</FooterLink>
              <FooterLink to="/my-orders">{t("Orders")}</FooterLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}
            >
              {t("Contact Us")}
            </Typography>
            <Typography
              sx={{ color: "#e0e0e0", fontSize: { xs: 12, sm: 14 }, mb: 1 }}
            >
              {t("Email")}:{" "}
              <FooterLink to="mailto:ezedinebrahim131@gmail.com">
                ezedinebrahim131@gmail.com
              </FooterLink>
            </Typography>
            <Typography
              sx={{ color: "#e0e0e0", fontSize: { xs: 12, sm: 14 }, mb: 2 }}
            >
              {t("Phone")}: +251 991792427
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <FooterIconButton href="https://facebook.com" target="_blank">
                <FacebookIcon fontSize={isMobile ? "medium" : "large"} />
              </FooterIconButton>
              <FooterIconButton href="https://twitter.com" target="_blank">
                <TwitterIcon fontSize={isMobile ? "medium" : "large"} />
              </FooterIconButton>
              <FooterIconButton href="https://instagram.com" target="_blank">
                <InstagramIcon fontSize={isMobile ? "medium" : "large"} />
              </FooterIconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fff", fontWeight: 700, mb: 1.5 }}
            >
              {t("Stay Updated")}
            </Typography>
            <form onSubmit={handleNewsletterSubmit}>
              <FooterTextField
                label={t("Email Address")}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#f0c14b",
                  color: "#111",
                  borderRadius: "10px",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#e0b03a", transform: "scale(1.05)" },
                }}
              >
                {t("Subscribe")}
              </Button>
            </form>
          </Grid>
        </Grid>
        <Divider
          sx={{ bgcolor: "#fff5f0", my: isMobile ? 2 : 3, height: "1px" }}
        />
        <Typography sx={{ color: "#e0e0e0", fontSize: { xs: 11, sm: 13 } }}>
          © {new Date().getFullYear()} EthioShop. {t("All rights reserved.")}
        </Typography>
      </FooterSection>
    </HomeContainer>
  );
}

export default Home;
