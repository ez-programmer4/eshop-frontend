import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

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
const WishlistContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1000,
  margin: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f7f7f7",
  borderRadius: "12px",
  minHeight: "80vh",
  animation: `${slideIn} 0.5s ease-out`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const WishlistItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  flexDirection: theme.breakpoints.down("sm") ? "column" : "row",
  alignItems: theme.breakpoints.down("sm") ? "flex-start" : "center",
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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: "transform 0.2s, color 0.2s",
  "&:hover": {
    transform: "scale(1.2) rotate(5deg)",
    color: "#e74c3c",
    animation: `${pulse} 0.5s infinite`,
  },
}));

function Wishlist() {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <WishlistContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Wishlist")}
      </Typography>
      {wishlist.length === 0 ? (
        <Typography sx={{ textAlign: "center", color: "#555" }}>
          {t("Your wishlist is empty")}
        </Typography>
      ) : (
        <List>
          {wishlist.map((item) => (
            <WishlistItem
              key={
                item._id || `temp-${Math.random().toString(36).substr(2, 9)}`
              }
            >
              <ListItemText
                primary={item.name || t("Unnamed Product")}
                secondary={
                  item.price !== undefined ? `$${item.price}` : t("Price N/A")
                }
                onClick={() => item._id && navigate(`/product/${item._id}`)}
                sx={{
                  cursor: item._id ? "pointer" : "default",
                  color: "#111",
                  "& .MuiListItemText-secondary": { color: "#555" },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: isMobile ? 2 : 0,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                {item._id ? (
                  <>
                    <ActionButton
                      variant="contained"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      {t("View")}
                    </ActionButton>
                    <StyledIconButton
                      onClick={() => removeFromWishlist(item._id)}
                    >
                      <DeleteIcon />
                    </StyledIconButton>
                  </>
                ) : (
                  <Typography sx={{ color: "#e74c3c" }}>
                    {t("Invalid item")}
                  </Typography>
                )}
              </Box>
            </WishlistItem>
          ))}
        </List>
      )}
    </WishlistContainer>
  );
}

export default Wishlist;
