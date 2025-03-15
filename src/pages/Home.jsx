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
  TextField,
  useMediaQuery,
  keyframes,
  Fab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SortIcon from "@mui/icons-material/Sort";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 129, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(255, 107, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 129, 0); }
`;

// Styled Components with Enhanced Styling
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  margin: "0 auto",
  padding: theme.spacing(4),
  minHeight: "100vh",
  background: `url("https://images.unsplash.com/photo-1528459801416-a263057e4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80") no-repeat center/cover, linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)`,
  animation: `${fadeIn} 1s ease-out`,
  [theme.breakpoints.down("md")]: { padding: theme.spacing(3) },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `url("https://www.transparenttextures.com/patterns/light-wool.png") repeat, linear-gradient(135deg, #ff6b81 0%, #feb47b 100%)`, // Softer gradient
  borderRadius: "28px",
  padding: theme.spacing(6),
  marginBottom: theme.spacing(5),
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.15)",
    zIndex: 1,
  },
  [theme.breakpoints.down("md")]: { padding: theme.spacing(5) },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    borderRadius: "20px",
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#ff6b81" },
    "&.Mui-focused fieldset": { borderColor: "#feb47b" },
  },
  "& .MuiInputLabel-root": { color: "#4a5568", fontWeight: 500 },
  [theme.breakpoints.down("md")]: { minWidth: "100%" },
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(5),
  backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: "16px",
  },
}));

const SlideTrack = styled(Box)(({ offset }) => ({
  display: "flex",
  transition: "transform 0.6s ease",
  transform: `translateX(-${offset * 100}%)`,
}));

const SlideCard = styled(Box)(({ theme }) => ({
  flex: "0 0 33.33%",
  padding: theme.spacing(2),
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("md")]: { flex: "0 0 50%" },
  [theme.breakpoints.down("sm")]: { flex: "0 0 100%" },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #feb47b 0%, #ff6b81 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 4),
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "1.1rem",
  textTransform: "none",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6b81 0%, #feb47b 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(1.2, 3),
    fontSize: "1rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2.5),
    fontSize: "0.9rem",
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: `url("https://plus.unsplash.com/premium_photo-1705346743712-ba31e9a37bc4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ5fHx8ZW58MHx8fHx8") no-repeat center/cover, linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%)`,
  color: "#fff",
  padding: theme.spacing(6),
  marginTop: theme.spacing(6),
  borderRadius: "20px 20px 0 0",
  boxShadow: "0 -6px 20px rgba(0, 0, 0, 0.2)",
  position: "relative",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.4)",
    zIndex: 1,
  },
  "& > *": { position: "relative", zIndex: 2 },
  [theme.breakpoints.down("md")]: { padding: theme.spacing(4) },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(3) },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.2)",
  padding: theme.spacing(1.2),
  "&:hover": { background: "#feb47b" },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const itemsPerPage = 8;
  const sliderVisibleItems = isMobile ? 1 : isTablet ? 2 : 3;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/categories"
      );
      setCategories(["All", ...response.data.map((cat) => cat.name)]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      const productResponse = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products"
      );
      const uniqueCategories = [
        ...new Set(productResponse.data.map((p) => p.category)),
      ];
      setCategories(["All", ...uniqueCategories]);
    }
  }, []);

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
    fetchCategories();
    fetchProducts(category, sort, page);
    fetchFeaturedProducts();
  }, [
    category,
    sort,
    page,
    fetchCategories,
    fetchProducts,
    fetchFeaturedProducts,
  ]);

  const sortOptions = [
    { value: "name-asc", label: t("Name: A-Z") },
    { value: "name-desc", label: t("Name: Z-A") },
    { value: "price-asc", label: t("Price: Low to High") },
    { value: "price-desc", label: t("Price: High to Low") },
  ];

  const handleSlideNext = () =>
    setSlideIndex((prev) =>
      Math.min(
        prev + 1,
        Math.ceil(featuredProducts.length / sliderVisibleItems) - 1
      )
    );
  const handleSlidePrev = () => setSlideIndex((prev) => Math.max(prev - 1, 0));
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
          variant={isMobile ? "h4" : "h2"}
          sx={{
            fontWeight: 700,
            color: "#fff",
            mb: 2.5,
            letterSpacing: "-0.5px",
            zIndex: 2,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.95)",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            mb: 4,
            maxWidth: 700,
            mx: "auto",
            zIndex: 2,
            lineHeight: 1.6,
          }}
        >
          {t("Discover premium fashion with unbeatable style and quality.")}
        </Typography>
        <ActionButton component={Link} to="/categories">
          {t("Shop Now")}
        </ActionButton>
      </HeroSection>

      {/* Featured Products Slider */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          color: "#1a202c",
          letterSpacing: "-0.3px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
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
            left: 15,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#feb47b",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6b81" },
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <SlideTrack offset={slideIndex}>
          {featuredProducts.map((product) => (
            <SlideCard key={product._id}>
              <Box
                component="img"
                src={product.image || "https://via.placeholder.com/250"}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: { xs: 160, sm: 200, md: 240 },
                  objectFit: "cover",
                  borderRadius: "12px",
                  mb: 2,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                }}
              />
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#1a202c",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                {product.name}
              </Typography>
              <Typography
                sx={{
                  color: "#ff6b81",
                  fontWeight: 500,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                }}
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
            right: 15,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#feb47b",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6b81" },
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </SliderContainer>

      {/* Browse Products Section */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          color: "#1a202c",
          letterSpacing: "-0.3px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        {t("Browse Products")}
      </Typography>
      <FilterBar>
        <StyledFormControl variant="outlined">
          <InputLabel>
            <CategoryIcon
              sx={{ verticalAlign: "middle", mr: 1, fontSize: "1.2rem" }}
            />
            {t("Category")}
          </InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label={t("Category")}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {t(cat)}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
        <StyledFormControl variant="outlined">
          <InputLabel>
            <SortIcon
              sx={{ verticalAlign: "middle", mr: 1, fontSize: "1.2rem" }}
            />
            {t("Sort By")}
          </InputLabel>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            label={t("Sort By")}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
      </FilterBar>

      {/* Product List */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress sx={{ color: "#ff6b81" }} size={50} />
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
              mt: 5,
              "& .MuiPaginationItem-root": {
                color: "#ff6b81",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#fff0f0" },
                "&.Mui-selected": { bgcolor: "#ff6b81", color: "#fff" },
              },
            }}
          />
        </>
      )}

      {/* Enhanced Footer */}
      <FooterSection>
        <Grid container spacing={isMobile ? 3 : 4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#fff",
                mb: 2.5,
                letterSpacing: "-0.2px",
              }}
            >
              EthioShop
            </Typography>
            <Typography
              sx={{
                color: "#e2e8f0",
                lineHeight: 1.7,
                fontSize: { xs: "0.95rem", md: "1rem" },
              }}
            >
              {t("Your one-stop shop for premium fashion in Ethiopia.")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              sx={{ color: "#fff", mb: 2, fontWeight: 600 }}
            >
              {t("Quick Links")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                to="/"
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Home")}
              </Link>
              <Link
                to="/categories"
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Categories")}
              </Link>
              <Link
                to="/my-orders"
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Orders")}
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              sx={{ color: "#fff", mb: 2, fontWeight: 600 }}
            >
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
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#feb47b" },
                    "&.Mui-focused fieldset": { borderColor: "#ff6b81" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1rem",
                    color: "#1a202c",
                  },
                }}
              />
              <ActionButton type="submit">{t("Subscribe")}</ActionButton>
            </form>
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
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
        <Typography
          sx={{
            color: "#a0aec0",
            fontSize: "0.9rem",
            mt: 4,
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          © {new Date().getFullYear()} EthioShop. {t("All rights reserved.")}
        </Typography>
      </FooterSection>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 25,
          right: 25,
          bgcolor: "#ff6b81",
          "&:hover": { bgcolor: "#feb47b" },
          animation: `${pulse} 2s infinite`,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={() => alert(t("Contact support at +251 991 792 427"))}
      >
        <SupportAgentIcon />
      </Fab>
    </HomeContainer>
  );
}

export default Home;
