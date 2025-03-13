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
  Fab,
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
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

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

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 111, 97, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 111, 97, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 111, 97, 0); }
`;

// Custom styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1600,
  margin: "0 auto",
  padding: theme.spacing(4),
  background: "linear-gradient(180deg, #f9f9f9 0%, #dfe4ea 100%)",
  minHeight: "100vh",
  animation: `${fadeIn} 1s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const StickyHeader = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  background: "rgba(255, 255, 255, 0.97)",
  backdropFilter: "blur(12px)",
  padding: theme.spacing(2),
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  borderRadius: "0 0 20px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const PromoBanner = styled(Box)(({ theme }) => ({
  background: "linear-gradient(90deg, #ff6f61 0%, #ffab40 100%)",
  color: "#fff",
  padding: theme.spacing(2),
  textAlign: "center",
  borderRadius: "12px",
  marginBottom: theme.spacing(4),
  animation: `${pulse} 2s infinite`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    fontSize: "0.9rem",
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff6f61 0%, #ffab40 100%)",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  padding: theme.spacing(8),
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
      "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
    animation: `${fadeIn} 3s infinite`,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  flexWrap: "wrap",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    padding: theme.spacing(2),
  },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#ffab40",
  color: "#fff",
  borderRadius: "14px",
  padding: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: "#ff6f61",
    transform: "rotate(15deg)",
    transition: "all 0.3s ease",
  },
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const SlideTrack = styled(Box)(({ offset }) => ({
  display: "flex",
  transition: "transform 0.7s ease-in-out",
  transform: `translateX(-${offset * 100}%)`,
}));

const SlideCard = styled(Box)(({ theme }) => ({
  flex: "0 0 33.33%",
  padding: theme.spacing(2.5),
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
  transition: "all 0.4s ease",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
  [theme.breakpoints.down("sm")]: { flex: "0 0 100%" },
}));

const CategoryHighlight = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "20px",
  padding: theme.spacing(3),
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffab40 0%, #ff6f61 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 4),
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "1.1rem",
  textTransform: "uppercase",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6f61 0%, #ffab40 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 3),
    fontSize: "0.95rem",
  },
}));

const TestimonialSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "20px",
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
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
  },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #1e272e 0%, #2f3640 100%)",
  color: "#fff",
  padding: theme.spacing(6),
  marginTop: theme.spacing(4),
  textAlign: "center",
  borderRadius: "24px 24px 0 0",
  boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.2)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: "#dfe6e9",
  textDecoration: "none",
  fontSize: "1rem",
  margin: theme.spacing(0, 2),
  "&:hover": {
    color: "#ffab40",
    textDecoration: "underline",
    transition: "all 0.3s ease",
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.2)",
  padding: theme.spacing(1.5),
  "&:hover": {
    background: "#ffab40",
    transform: "scale(1.2)",
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

  const categoryHighlights = [
    { name: "T-Shirts", img: "https://via.placeholder.com/200?text=T-Shirts" },
    { name: "Jackets", img: "https://via.placeholder.com/200?text=Jackets" },
    { name: "Pants", img: "https://via.placeholder.com/200?text=Pants" },
  ];

  const testimonials = [
    { name: "Abebe K.", text: t("Amazing quality and fast delivery!") },
    { name: "Selam T.", text: t("Best shopping experience ever.") },
    { name: "Yonas M.", text: t("Love the variety of styles.") },
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
        <Box sx={{ display: "flex", gap: 2 }}>
          <ActionButton component={Link} to="/categories">
            {t("Categories")}
          </ActionButton>
          <ActionButton component={Link} to="/my-orders">
            {t("Orders")}
          </ActionButton>
        </Box>
      </StickyHeader>

      {/* Promotional Banner */}
      <PromoBanner>
        <Typography variant="h6">
          {t("Get 20% OFF your first order! Use code: ETHIO20")}
        </Typography>
      </PromoBanner>

      {/* Hero Section */}
      <HeroSection>
        <Typography
          variant={isMobile ? "h4" : "h2"}
          sx={{
            fontWeight: 900,
            color: "#fff",
            mb: 2,
            textShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            fontSize: { xs: "1rem", sm: "1.3rem" },
            mb: 4,
            maxWidth: 700,
            mx: "auto",
          }}
        >
          {t("Discover premium fashion with unbeatable style and quality.")}
        </Typography>
        <ActionButton
          component={Link}
          to="/categories"
          sx={{ animation: `${bounce} 2s infinite` }}
        >
          {t("Shop Now")}
        </ActionButton>
      </HeroSection>

      {/* Category Highlights */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2f3640" }}
      >
        {t("Top Categories")}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categoryHighlights.map((cat) => (
          <Grid item xs={12} sm={4} key={cat.name}>
            <CategoryHighlight>
              <Box
                component="img"
                src={cat.img}
                alt={cat.name}
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "12px",
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#2f3640" }}
              >
                {t(cat.name)}
              </Typography>
              <ActionButton
                component={Link}
                to={`/categories/${cat.name.toLowerCase()}`}
                sx={{ mt: 2 }}
              >
                {t("Shop Now")}
              </ActionButton>
            </CategoryHighlight>
          </Grid>
        ))}
      </Grid>

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
            left: 15,
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
                src={product.image || "https://via.placeholder.com/250"}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: { xs: 180, sm: 250 },
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
            right: 15,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                borderRadius: "12px",
                px: 3,
                "&:hover": {
                  bgcolor: category === cat ? "#ff8a65" : "#ffebee",
                },
              }}
            >
              {t(cat)}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                borderRadius: "12px",
                px: 3,
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
          <CircularProgress sx={{ color: "#ff6f61" }} size={50} />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          sx={{ textAlign: "center", py: 2, fontSize: "1.2rem" }}
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
              mt: 4,
              "& .MuiPaginationItem-root": {
                color: "#ff6f61",
                "&.Mui-selected": { bgcolor: "#ff6f61", color: "#fff" },
              },
            }}
          />
        </>
      )}

      {/* Testimonials Section */}
      <TestimonialSection>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2f3640" }}
        >
          {t("What Our Customers Say")}
        </Typography>
        <Grid container spacing={3}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-5px)" },
                }}
              >
                <Typography sx={{ color: "#2f3640", mb: 1 }}>
                  "{testimonial.text}"
                </Typography>
                <Typography sx={{ color: "#ff6f61", fontWeight: 600 }}>
                  - {testimonial.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </TestimonialSection>

      {/* About Section */}
      <AboutSection>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 2, textAlign: "center", color: "#2f3640" }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography
          sx={{ color: "#636e72", lineHeight: 1.8, textAlign: "center" }}
        >
          {t(
            "EthioShop is your ultimate destination for premium fashion in Ethiopia. We offer a curated selection of clothing and accessories, ensuring quality, style, and fast delivery."
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            <Typography sx={{ color: "#dfe6e9", mb: 2 }}>
              Phone: +251 991 792 427
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
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
                    borderRadius: "14px",
                    bgcolor: "#fff",
                  },
                }}
              />
              <ActionButton type="submit">{t("Subscribe")}</ActionButton>
            </form>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: "#dfe6e9", my: 4 }} />
        <Typography sx={{ color: "#b2bec3", fontSize: "0.9rem" }}>
          © {new Date().getFullYear()} EthioShop. {t("All rights reserved.")}
        </Typography>
      </FooterSection>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          bgcolor: "#ff6f61",
          "&:hover": { bgcolor: "#ff8a65" },
          animation: `${pulse} 2s infinite`,
        }}
        onClick={() => alert(t("Contact support at +251 991 792 427"))}
      >
        <SupportAgentIcon />
      </Fab>
    </HomeContainer>
  );
}

export default Home;
