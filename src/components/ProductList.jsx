// src/components/ProductList.jsx
import React from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../App.css";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  transition: "transform 0.3s, box-shadow 0.3s",
  animation: `${slideIn} 0.5s ease-out`,
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
    width: "100%",
  },
}));

function ProductList({ products }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid container spacing={isMobile ? 2 : 3}>
      {products.length === 0 ? (
        <Grid item xs={12}>
          <Typography sx={{ textAlign: "center", color: "#555" }}>
            {t("No products available")}
          </Typography>
        </Grid>
      ) : (
        products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <ProductCard
              component={Link}
              to={`/product/${product._id}`}
              sx={{ textDecoration: "none" }}
            >
              <CardMedia
                component="img"
                height={isMobile ? "200" : "250"}
                image={product.image || "https://picsum.photos/200?blur=2"}
                alt={product.name}
                sx={{
                  objectFit: "cover",
                  borderRadius: "12px 12px 0 0",
                  transition: "opacity 0.3s",
                  "&:hover": { opacity: 0.9 },
                }}
              />
              <CardContent>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 500, color: "#111", mb: 1 }}
                >
                  {product.name || t("Unnamed Product")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#555",
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.description || t("No description available")}
                </Typography>
                <Typography variant="h6" sx={{ color: "#f0c14b", mt: 1 }}>
                  ${product.price || "N/A"}
                </Typography>
                <ActionButton variant="contained" sx={{ mt: 2 }}>
                  {t("View Details")}
                </ActionButton>
              </CardContent>
            </ProductCard>
          </Grid>
        ))
      )}
    </Grid>
  );
}

export default ProductList;
