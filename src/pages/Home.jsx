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

// Styled Components (Figma-inspired)
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  margin: "0 auto",
  padding: theme.spacing(4),
  backgroundColor: "#f8fafc", // Softer, neutral background
  minHeight: "100vh",
  animation: `${fadeIn} 0.8s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)", // Softer gradient
  borderRadius: "24px",
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  textAlign: "center",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(4) },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
  },
  cursor: "pointer",
  overflow: "hidden",
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: "#1a202c", // Darker, neutral text
  fontWeight: 600,
  fontSize: { xs: "0.9rem", sm: "1rem" },
  textAlign: "center",
  padding: theme.spacing(1),
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  flexWrap: "wrap",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

const FilterButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#feb47b",
  color: "#fff",
  borderRadius: "10px",
  padding: theme.spacing(1),
  "&:hover": { backgroundColor: "#ff7e5f" },
  transition: "all 0.3s ease",
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  padding: theme.spacing(2),
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
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: { flex: "0 0 100%" },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #feb47b 0%, #ff7e5f 100%)",
  color: "#fff",
  padding: theme.spacing(1.5, 3),
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    fontSize: "0.9rem",
  },
}));

const Section = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2.5) },
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)", // Darker, modern footer
  color: "#fff",
  padding: theme.spacing(5),
  marginTop: theme.spacing(4),
  borderRadius: "16px 16px 0 0",
  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  background: "rgba(255, 255, 255, 0.1)",
  padding: theme.spacing(1),
  "&:hover": { background: "#feb47b" },
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
    e.target.src = "https://via.placeholder.com/150";
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
            mb: 2,
            letterSpacing: "-0.5px",
          }}
        >
          {t("Welcome to EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: { xs: "1rem", sm: "1.25rem" },
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
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          color: "#1a202c",
          letterSpacing: "-0.2px",
        }}
      >
        {t("Top Categories")}
      </Typography>
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 5 }}>
        {categoriesWithImages.map((cat) => (
          <Grid item xs={6} sm={4} md={2} key={cat.name}>
            <CategoryCard
              onClick={() => handleCategoryClick(cat.name)}
              sx={{ animation: `${slideUp} 0.5s ease-out` }}
            >
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
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: "center",
          color: "#1a202c",
          letterSpacing: "-0.2px",
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
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "#feb47b",
            color: "#fff",
            "&:hover": { bgcolor: "#ff7e5f" },
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
              <Typography sx={{ fontWeight: 600, color: "#1a202c" }}>
                {product.name}
              </Typography>
              <Typography sx={{ color: "#ff7e5f", fontWeight: 500 }}>
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
            bgcolor: "#feb47b",
            color: "#fff",
            "&:hover": { bgcolor: "#ff7e5f" },
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
          letterSpacing: "-0.2px",
        }}
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
                bgcolor: category === cat ? "#ff7e5f" : "#fff",
                color: category === cat ? "#fff" : "#1a202c",
                borderColor: "#e2e8f0",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: category === cat ? "#feb47b" : "#f7fafc",
                  borderColor: "#e2e8f0",
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
                bgcolor: sort === option.value ? "#ff7e5f" : "#fff",
                color: sort === option.value ? "#fff" : "#1a202c",
                borderColor: "#e2e8f0",
                borderRadius: "10px",
                px: 2,
                "&:hover": {
                  bgcolor: sort === option.value ? "#feb47b" : "#f7fafc",
                  borderColor: "#e2e8f0",
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
          <CircularProgress sx={{ color: "#ff7e5f" }} size={48} />
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
                color: "#ff7e5f",
                "&.Mui-selected": { bgcolor: "#ff7e5f", color: "#fff" },
              },
            }}
          />
        </>
      )}

      {/* Testimonials Section */}
      <Section>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: "#1a202c",
            letterSpacing: "-0.2px",
          }}
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
                  backgroundColor: "#f7fafc",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  "&:hover": { transform: "translateY(-4px)" },
                  transition: "all 0.3s ease",
                }}
              >
                <Typography sx={{ color: "#4a5568", mb: 1 }}>
                  "{testimonial.text}"
                </Typography>
                <Typography sx={{ color: "#ff7e5f", fontWeight: 600 }}>
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
          sx={{
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            color: "#1a202c",
            letterSpacing: "-0.2px",
          }}
        >
          {t("About EthioShop")}
        </Typography>
        <Typography
          sx={{
            color: "#4a5568",
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
            fontWeight: 700,
            color: "#fff",
            mb: 3,
            letterSpacing: "-0.5px",
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
                style={{ color: "#e2e8f0", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Home")}
              </Link>
              <Link
                to="/categories"
                style={{ color: "#e2e8f0", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Categories")}
              </Link>
              <Link
                to="/my-orders"
                style={{ color: "#e2e8f0", textDecoration: "none" }}
                onMouseOver={(e) => (e.target.style.color = "#feb47b")}
                onMouseOut={(e) => (e.target.style.color = "#e2e8f0")}
              >
                {t("Orders")}
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              {t("Contact Us")}
            </Typography>
            <Typography sx={{ color: "#e2e8f0", mb: 1 }}>
              Email:{" "}
              <Link
                to="mailto:support@ethioshop.com"
                style={{ color: "#feb47b", textDecoration: "none" }}
              >
                support@ethioshop.com
              </Link>
            </Typography>
            <Typography sx={{ color: "#e2e8f0" }}>
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
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#feb47b" },
                  },
                }}
              />
              <ActionButton type="submit">{t("Subscribe")}</ActionButton>
            </form>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: "#4a5568", my: 3 }} />
        <Typography sx={{ color: "#a0aec0", fontSize: "0.85rem" }}>
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
          bgcolor: "#ff7e5f",
          "&:hover": { bgcolor: "#feb47b" },
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
