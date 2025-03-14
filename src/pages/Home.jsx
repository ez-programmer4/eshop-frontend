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
  Card,
  CardMedia,
  CardContent,
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

// Animation keyframes (unchanged)
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 129, 0.7); }
  70% { box-shadow: 0 0 0 12px rgba(255, 107, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 129, 0); }
`;

const shine = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled Components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  margin: "0 auto",
  padding: theme.spacing(4),
  background: "linear-gradient(180deg, #fef8f5 0%, #ebedf0 100%)",
  minHeight: "100vh",
  animation: `${fadeIn} 0.8s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff6b81 0%, #ffcc70 100%)",
  borderRadius: "28px",
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "300%",
    height: "100%",
    background:
      "linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    animation: `${shine} 3s infinite`,
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(4) },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
  flexWrap: "wrap",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#ffcc70",
  color: "#fff",
  borderRadius: "12px",
  padding: theme.spacing(1),
  "&:hover": { backgroundColor: "#ff6b81", transform: "scale(1.1)" },
  transition: "all 0.3s ease",
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(2.5),
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
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: { flex: "0 0 100%" },
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

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffcc70 0%, #ff6b81 100%)",
  color: "#fff",
  padding: theme.spacing(1.2, 3),
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "uppercase",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff6b81 0%, #ffcc70 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.9rem",
  },
}));

const Section = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "20px",
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2.5) },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #2d3436 0%, #636e72 100%)",
  color: "#fff",
  padding: theme.spacing(5),
  marginTop: theme.spacing(4),
  borderRadius: "20px 20px 0 0",
  boxShadow: "0 -6px 20px rgba(0, 0, 0, 0.15)",
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.15)",
  padding: theme.spacing(1.2),
  "&:hover": { background: "#ffcc70", transform: "scale(1.15)" },
  transition: "all 0.3s ease",
}));

function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [categoriesWithImages, setCategoriesWithImages] = useState([]);
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/categories"
      );
      setCategories(["All", ...response.data.map((cat) => cat.name)]);
      setCategoriesWithImages(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Fallback: Extract from products if /api/categories isn't available
      const productResponse = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products"
      );
      const categoryMap = productResponse.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] =
            product.image || "https://via.placeholder.com/150";
        }
        return acc;
      }, {});
      const uniqueCategories = Object.keys(categoryMap).map((name) => ({
        name,
        image: categoryMap[name],
      }));
      setCategories(["All", ...uniqueCategories.map((cat) => cat.name)]);
      setCategoriesWithImages(uniqueCategories);
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

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/150"; // Fallback image
  };

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <Typography
          variant={isMobile ? "h4" : "h2"}
          sx={{
            fontWeight: 900,
            color: "#fff",
            mb: 2,
            textShadow: "0 3px 10px rgba(0,0,0,0.3)",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            mb: 3,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {t("Discover premium fashion with unbeatable style and quality.")}
        </Typography>
        <ActionButton component={Link} to="/categories">
          {t("Shop Now")}
        </ActionButton>
      </HeroSection>

      {/* Compact Category Grid */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2d3436" }}
      >
        {t("Top Categories")}
      </Typography>
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
        {categoriesWithImages.map((cat) => (
          <Grid item xs={6} sm={4} md={2} key={cat.name}>
            <CategoryCard onClick={() => handleCategoryClick(cat.name)}>
              <CardMedia
                component="img"
                height={isMobile ? "80" : "100"}
                image={cat.image}
                alt={cat.name}
                onError={handleImageError}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ py: 0.5 }}>
                <CategoryTitle>{t(cat.name)}</CategoryTitle>
              </CardContent>
            </CategoryCard>
          </Grid>
        ))}
      </Grid>

      {/* Featured Products Slider */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2d3436" }}
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
            bgcolor: "#ffcc70",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6b81" },
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
                  height: { xs: 160, sm: 220 },
                  objectFit: "cover",
                  borderRadius: "10px",
                  mb: 1.5,
                }}
              />
              <Typography sx={{ fontWeight: 600, color: "#2d3436" }}>
                {product.name}
              </Typography>
              <Typography sx={{ color: "#ff6b81", fontWeight: 500 }}>
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
            bgcolor: "#ffcc70",
            color: "#fff",
            "&:hover": { bgcolor: "#ff6b81" },
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </SliderContainer>

      {/* Browse Products Section */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2d3436" }}
      >
        {t("Browse Products")}
      </Typography>
      <FilterBar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterButton>
            <CategoryIcon />
          </FilterButton>
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? "contained" : "outlined"}
              sx={{
                bgcolor: category === cat ? "#ff6b81" : "#fff",
                color: category === cat ? "#fff" : "#2d3436",
                borderColor: "#ff6b81",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: category === cat ? "#ff8e9a" : "#fff5f5",
                },
              }}
            >
              {t(cat)}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterButton>
            <SortIcon />
          </FilterButton>
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setSort(option.value)}
              variant={sort === option.value ? "contained" : "outlined"}
              sx={{
                bgcolor: sort === option.value ? "#ff6b81" : "#fff",
                color: sort === option.value ? "#fff" : "#2d3436",
                borderColor: "#ff6b81",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: sort === option.value ? "#ff8e9a" : "#fff5f5",
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
          <CircularProgress sx={{ color: "#ff6b81" }} size={48} />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          sx={{ textAlign: "center", py: 2, fontSize: "1.1rem" }}
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
                color: "#ff6b81",
                "&.Mui-selected": { bgcolor: "#ff6b81", color: "#fff" },
              },
            }}
          />
        </>
      )}

      {/* Testimonials Section */}
      <Section>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#2d3436" }}
        >
          {t("What Our Customers Say")}
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          {[
            { name: "Abebe K.", text: t("Amazing quality and fast delivery!") },
            { name: "Selam T.", text: t("Best shopping experience ever.") },
            { name: "Yonas M.", text: t("Love the variety of styles.") },
          ].map((testimonial, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  backgroundColor: "#fef8f5",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.06)",
                  "&:hover": { transform: "translateY(-4px)" },
                  transition: "all 0.3s ease",
                }}
              >
                <Typography sx={{ color: "#2d3436", mb: 1 }}>
                  "{testimonial.text}"
                </Typography>
                <Typography sx={{ color: "#ff6b81", fontWeight: 600 }}>
                  - {testimonial.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* About Section */}
      <Section>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 700, mb: 2, textAlign: "center", color: "#2d3436" }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#636e72",
            lineHeight: 1.7,
            textAlign: "center",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          {t(
            "EthioShop is your ultimate destination for premium fashion in Ethiopia. We offer a curated selection of clothing and accessories, ensuring quality, style, and fast delivery."
          )}
        </Typography>
      </Section>

      {/* Footer */}
      <FooterSection>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(90deg, #ffcc70 0%, #ff6b81 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
          }}
        >
          EthioShop
        </Typography>
        <Grid container spacing={isMobile ? 3 : 4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Explore")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                to="/"
                style={{ color: "#dfe6e9", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#ffcc70")}
                onMouseOut={(e) => (e.target.style.color = "#dfe6e9")}
              >
                {t("Home")}
              </Link>
              <Link
                to="/categories"
                style={{ color: "#dfe6e9", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#ffcc70")}
                onMouseOut={(e) => (e.target.style.color = "#dfe6e9")}
              >
                {t("Categories")}
              </Link>
              <Link
                to="/my-orders"
                style={{ color: "#dfe6e9", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#ffcc70")}
                onMouseOut={(e) => (e.target.style.color = "#dfe6e9")}
              >
                {t("Orders")}
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Contact Us")}
            </Typography>
            <Typography sx={{ color: "#dfe6e9", mb: 1 }}>
              Email:{" "}
              <Link
                to="mailto:support@ethioshop.com"
                style={{ color: "#ffcc70", textDecoration: "none" }}
              >
                support@ethioshop.com
              </Link>
            </Typography>
            <Typography sx={{ color: "#dfe6e9" }}>
              Phone: +251 991 792 427
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1.5,
                mt: 2,
              }}
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
        <Divider sx={{ bgcolor: "#dfe6e9", my: 3 }} />
        <Typography sx={{ color: "#b2bec3", fontSize: "0.85rem" }}>
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
          bgcolor: "#ff6b81",
          "&:hover": { bgcolor: "#ff8e9a" },
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
