import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import StoreIcon from "@mui/icons-material/Store";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Chat from "./Chat.jsx";
import axios from "axios";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#111",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  animation: `${fadeIn} 0.5s ease-out`,
  borderRadius: "0 0 8px 8px",
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  color: "#111",
  padding: { xs: "6px", sm: "8px" },
  "&:hover": {
    color: "#f0c14b",
    transform: "scale(1.1)",
    transition: "color 0.2s, transform 0.2s",
  },
}));

const CartIconButton = styled(NavIconButton)(({ theme, animate }) => ({
  ...(animate && {
    animation: `${bounce} 0.5s ease-out`,
  }),
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "#f0c14b",
  cursor: "pointer",
  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
  flexShrink: 0,
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  borderRadius: "20px",
  "& .MuiInputBase-root": {
    padding: "2px 8px",
    fontSize: { xs: "0.8rem", sm: "0.9rem" },
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  width: { xs: "100px", sm: "150px", md: "250px" },
}));

const DrawerList = styled(List)(({ theme }) => ({
  width: 250,
  backgroundColor: "#fff",
  height: "100%",
  animation: `${slideIn} 0.3s ease-out`,
}));

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { mode } = useContext(ThemeContext) || { mode: "light" };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Log user and language for debugging
  useEffect(() => {
    console.log("Navbar user:", user);
    console.log("Current language:", i18n.language);
  }, [user, i18n.language]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (cart.length > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/notifications",
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setNotifications(response.data.filter((n) => !n.read));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotifMenuOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
    fetchNotifications();
  };
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/notifications/${id}`,
        { read: true },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "am" : "en";
    i18n.changeLanguage(newLang);
    console.log("Language toggled to:", newLang);
  };

  const navItems = [
    { label: t("Home"), path: "/", icon: <HomeIcon /> },
    { label: t("Products"), path: "/products", icon: <StoreIcon /> },
    { label: t("Orders"), path: "/my-orders", icon: <ListAltIcon /> },
    ...(user && user.role === "admin"
      ? [
          {
            label: t("Admin Dashboard"),
            path: "/admin",
            icon: <AdminPanelSettingsIcon />,
          },
        ]
      : []),
  ];

  const drawerContent = (
    <DrawerList>
      {navItems.map((item) => (
        <ListItem
          button
          key={item.label}
          onClick={() => {
            navigate(item.path);
            setDrawerOpen(false);
          }}
        >
          <ListItemIcon sx={{ color: "#111" }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} sx={{ color: "#111" }} />
        </ListItem>
      ))}
      <ListItem
        button
        onClick={() => {
          navigate("/cart");
          setDrawerOpen(false);
        }}
      >
        <ListItemIcon sx={{ color: "#111" }}>
          <Badge badgeContent={cart.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={t("Cart")} sx={{ color: "#111" }} />
      </ListItem>
      <ListItem
        button
        onClick={() => {
          navigate("/wishlist");
          setDrawerOpen(false);
        }}
      >
        <ListItemIcon sx={{ color: "#111" }}>
          <Badge badgeContent={wishlist.length} color="error">
            <FavoriteIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={t("Wishlist")} sx={{ color: "#111" }} />
      </ListItem>
      <ListItem button onClick={handleNotifMenuOpen}>
        <ListItemIcon sx={{ color: "#111" }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={t("Notifications")} sx={{ color: "#111" }} />
      </ListItem>
      {user ? (
        <>
          <ListItem
            button
            onClick={() => {
              navigate("/profile");
              setDrawerOpen(false);
            }}
          >
            <ListItemIcon sx={{ color: "#111" }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={t("Profile")} sx={{ color: "#111" }} />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleLogout();
              setDrawerOpen(false);
            }}
          >
            <ListItemIcon sx={{ color: "#111" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t("Logout")} sx={{ color: "#111" }} />
          </ListItem>
        </>
      ) : (
        <ListItem
          button
          onClick={() => {
            navigate("/login");
            setDrawerOpen(false);
          }}
        >
          <ListItemIcon sx={{ color: "#111" }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary={t("Login")} sx={{ color: "#111" }} />
        </ListItem>
      )}
      <ListItem button onClick={toggleLanguage}>
        <ListItemText
          primary={i18n.language === "en" ? "en" : "አማ"}
          sx={{ color: "#111" }}
        />
      </ListItem>
    </DrawerList>
  );

  return (
    <StyledAppBar position="sticky">
      <Toolbar
        sx={{
          py: { xs: 1, md: 1.5 },
          minHeight: { xs: 48, sm: 56, md: 64 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, md: 2 },
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/logo.png" // Path to your logo in public/
              alt="EthioShop Logo"
              style={{ height: "50px", marginRight: "10px" }} // Adjust size as needed
            />
          </Link>
        </Box>

        {/* Search Bar */}
        <SearchBox
          variant="outlined"
          size="small"
          placeholder={t("Search products...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#555" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Navigation and Cart */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, md: 1.5 },
          }}
        >
          <CartIconButton
            onClick={() => navigate("/cart")}
            title={t("Cart")}
            animate={cartAnimate}
          >
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </CartIconButton>
          {isLaptop ? (
            <>
              <NavIconButton component={Link} to="/" title={t("Home")}>
                <HomeIcon />
              </NavIconButton>
              <NavIconButton
                component={Link}
                to="/products"
                title={t("Products")}
              >
                <StoreIcon />
              </NavIconButton>
              <NavIconButton
                component={Link}
                to="/my-orders"
                title={t("Orders")}
              >
                <ListAltIcon />
              </NavIconButton>
              {user && user.role === "admin" && (
                <NavIconButton
                  component={Link}
                  to="/admin"
                  title={t("Admin Dashboard")}
                >
                  <AdminPanelSettingsIcon />
                </NavIconButton>
              )}
              {user ? (
                <>
                  <NavIconButton
                    component={Link}
                    to="/wishlist"
                    title={t("Wishlist")}
                  >
                    <Badge badgeContent={wishlist.length} color="error">
                      <FavoriteIcon />
                    </Badge>
                  </NavIconButton>
                  <NavIconButton
                    onClick={handleNotifMenuOpen}
                    title={t("Notifications")}
                  >
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </NavIconButton>
                  <NavIconButton
                    onClick={handleMenuOpen}
                    title={
                      user && user.name
                        ? user.name
                        : user && user.email
                        ? user.email.split("@")[0]
                        : "User"
                    }
                  >
                    <PersonIcon />
                  </NavIconButton>
                  <NavIconButton onClick={toggleLanguage}>
                    <Typography variant="body2">
                      {i18n.language === "en" ? "en" : "አማ"}
                    </Typography>
                  </NavIconButton>
                </>
              ) : (
                <>
                  <NavIconButton
                    component={Link}
                    to="/login"
                    title={t("Login")}
                  >
                    <PersonIcon />
                  </NavIconButton>
                  <NavIconButton onClick={toggleLanguage}>
                    <Typography variant="body2">
                      {i18n.language === "en" ? "en" : "አማ"}
                    </Typography>
                  </NavIconButton>
                </>
              )}
            </>
          ) : (
            <NavIconButton edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </NavIconButton>
          )}
        </Box>
      </Toolbar>

      {/* Menus and Drawer */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { mt: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleMenuClose();
          }}
        >
          {t("Profile")}
        </MenuItem>
        {user && user.role === "admin" && (
          <MenuItem
            onClick={() => {
              navigate("/admin");
              handleMenuClose();
            }}
          >
            {t("Admin Dashboard")}
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>{t("Logout")}</MenuItem>
      </Menu>
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: { xs: 200, sm: 250, md: 300 },
            mt: 1,
            overflowY: "auto",
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography sx={{ fontSize: 14 }}>
              {t("No new notifications")}
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif._id}
              onClick={() => markAsRead(notif._id)}
              sx={{ whiteSpace: "normal", py: 1 }}
            >
              <Typography sx={{ fontSize: 14 }}>{notif.message}</Typography>
            </MenuItem>
          ))
        )}
      </Menu>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ "& .MuiDrawer-paper": { width: 250 } }}
      >
        {drawerContent}
      </Drawer>

      {user && <Chat />}
    </StyledAppBar>
  );
}

export default Navbar;
