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

// Custom styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f7f7f7",
  borderRadius: "12px",
  minHeight: "80vh",
  animation: `${slideIn} 0.5s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  flexWrap: "wrap",
  justifyContent: "center",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(0.5) },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  color: "#555",
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: { xs: theme.spacing(0.5), sm: theme.spacing(1) },
  "&:hover": {
    backgroundColor: "#e0e0e0",
    transform: "scale(1.1)",
    transition: "background-color 0.2s, transform 0.2s",
  },
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: { marginBottom: theme.spacing(1) },
}));

const SlideTrack = styled(Box)(({ theme, offset }) => ({
  display: "flex",
  transition: "transform 0.5s ease",
  transform: `translateX(-${offset * 100}%)`,
}));

const SlideCard = styled(Box)(({ theme }) => ({
  flex: "0 0 33.33%",
  padding: theme.spacing(1),
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    flex: "0 0 100%",
    padding: theme.spacing(0.5),
  },
}));

const BrowseButton = styled(Button)(({ theme }) => ({
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
    padding: theme.spacing(0.75, 1.5),
    fontSize: "0.75rem",
  },
}));

const AboutSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  animation: `${fadeIn} 1s ease-out`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#232f3e",
  color: "#fff",
  padding: theme.spacing(4, 2),
  marginTop: theme.spacing(2),
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 1),
    marginTop: theme.spacing(1),
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: "#ddd",
  textDecoration: "none",
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  margin: theme.spacing(0, 1),
  "&:hover": { color: "#f0c14b", transition: "color 0.2s" },
}));

const FooterIconButton = styled(IconButton)(({ theme }) => ({
  color: "#ddd",
  "&:hover": {
    color: "#f0c14b",
    transform: "scale(1.1)",
    transition: "color 0.2s, transform 0.2s",
  },
}));

const FooterTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#ccc" },
    "&:hover fieldset": { borderColor: "#999" },
    "&.Mui-focused fieldset": { borderColor: "#f0c14b" },
  },
  "& .MuiInputLabel-root": { color: "#555" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f0c14b" },
  "& input": { padding: "8px 12px" },
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
          variant={isMobile ? "h6" : "h4"}
          sx={{ color: "#111", fontWeight: 700, mb: isMobile ? 1 : 2 }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#555",
            fontSize: { xs: 12, sm: 16 },
            mb: isMobile ? 1 : 2,
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
        variant={isMobile ? "subtitle1" : "h6"}
        sx={{ color: "#111", fontWeight: 600, mb: 1 }}
      >
        {t("Featured Products")}
      </Typography>
      <SliderContainer>
        <IconButton
          onClick={handleSlidePrev}
          disabled={slideIndex === 0}
          sx={{
            position: "absolute",
            left: isMobile ? -5 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#f5f5f5" },
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
                  height: isMobile ? "120px" : "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  mb: 1,
                }}
              />
              <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#111" }}>
                {product.name || t("Unnamed Product")}
              </Typography>
              <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "#555" }}>
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
            right: isMobile ? -5 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <ArrowForwardIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </SliderContainer>

      {/* Updated Browse Products Section */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        sx={{
          color: "#111",
          fontWeight: 600,
          mb: 1,
          textAlign: isMobile ? "center" : "left",
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
            gap: isMobile ? 0.5 : 1,
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
                bgcolor: category === cat ? "#f0c14b" : "#fff",
                color: category === cat ? "#111" : "#555",
                borderColor: "#ccc",
                borderRadius: "8px",
                padding: isMobile ? "4px 8px" : "6px 12px",
                fontSize: isMobile ? "0.7rem" : "0.875rem",
                minWidth: isMobile ? "60px" : "80px",
                textTransform: "capitalize",
                "&:hover": {
                  bgcolor: category === cat ? "#e0b03a" : "#f5f5f5",
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
            bgcolor: "#eee",
            mx: isMobile ? 0 : 1,
            my: isMobile ? 1 : 0,
            width: isMobile ? "80%" : "auto",
          }}
        />

        {/* Sort Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.5 : 1,
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
                bgcolor: sort === option.value ? "#f0c14b" : "#fff",
                color: sort === option.value ? "#111" : "#555",
                borderColor: "#ccc",
                borderRadius: "8px",
                padding: isMobile ? "4px 8px" : "6px 12px",
                fontSize: isMobile ? "0.7rem" : "0.875rem",
                minWidth: isMobile ? "70px" : "100px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: sort === option.value ? "#e0b03a" : "#f5f5f5",
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
            py: isMobile ? 2 : 4,
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
            fontSize: { xs: 12, sm: 16 },
            bgcolor: "#ffebee",
            p: 1,
            borderRadius: 2,
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
              mt: isMobile ? 2 : 4,
            }}
            size={isMobile ? "small" : "medium"}
            color="primary"
          />
        </>
      )}

      {/* About the System */}
      <AboutSection>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          sx={{ color: "#111", fontWeight: 600, mb: 1, textAlign: "center" }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#555",
            fontSize: { xs: 12, sm: 16 },
            textAlign: "center",
          }}
        >
          {t(
            "EthioShop is your one-stop destination for quality clothing and accessories. Browse our curated collections, enjoy seamless shopping, and experience fast delivery across Ethiopia. Sign up today to unlock exclusive offers!"
          )}
        </Typography>
      </AboutSection>

      {/* Footer */}
      <FooterSection>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {t("EthioShop")}
        </Typography>
        <Grid container spacing={isMobile ? 1 : 2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
            >
              {t("Explore")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: isMobile ? "center" : "flex-start",
              }}
            >
              <FooterLink to="/">{t("Home")}</FooterLink>
              <FooterLink to="/categories">{t("Categories")}</FooterLink>
              <FooterLink to="/my-orders">{t("Orders")}</FooterLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
            >
              {t("Contact Us")}
            </Typography>
            <Typography
              sx={{ color: "#ddd", fontSize: { xs: 12, sm: 14 }, mb: 1 }}
            >
              {t("Email")}:{" "}
              <FooterLink to="mailto:ezedinebrahim131@gmail.com">
                ezedinebrahim131@gmail.com
              </FooterLink>
            </Typography>
            <Typography
              sx={{ color: "#ddd", fontSize: { xs: 12, sm: 14 }, mb: 1 }}
            >
              {t("Phone")}: +251 991792427
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <FooterIconButton href="https://facebook.com" target="_blank">
                <FacebookIcon fontSize={isMobile ? "small" : "medium"} />
              </FooterIconButton>
              <FooterIconButton href="https://twitter.com" target="_blank">
                <TwitterIcon fontSize={isMobile ? "small" : "medium"} />
              </FooterIconButton>
              <FooterIconButton href="https://instagram.com" target="_blank">
                <InstagramIcon fontSize={isMobile ? "small" : "medium"} />
              </FooterIconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
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
                sx={{ mb: 1 }}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#f0c14b",
                  color: "#111",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#e0b03a" },
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                {t("Subscribe")}
              </Button>
            </form>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: "#ddd", my: isMobile ? 1 : 2 }} />
        <Typography sx={{ color: "#ddd", fontSize: { xs: 10, sm: 12 } }}>
          © {new Date().getFullYear()} EthioShop. {t("All rights reserved.")}
        </Typography>
      </FooterSection>
    </HomeContainer>
  );
}

export default Home;
