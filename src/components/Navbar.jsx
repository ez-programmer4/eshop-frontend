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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(to right, #ffffff, #f9fafb)", // Subtle gradient
  color: "#111",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  animation: `${fadeIn} 0.6s ease-out`,
  borderRadius: "0 0 16px 16px",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  zIndex: 1200,
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  color: "#111",
  padding: { xs: "8px", sm: "10px" },
  borderRadius: "50%",
  backgroundColor: "#f5f5f5",
  "&:hover": {
    color: "#f0c14b",
    backgroundColor: "#e0e0e0",
    transform: "scale(1.1)",
    transition: "color 0.2s, background-color 0.2s, transform 0.2s",
  },
  margin: { xs: "0 2px", sm: "0 4px" },
}));

const CartIconButton = styled(NavIconButton)(({ theme, animate }) => ({
  backgroundColor: animate ? "#f0c14b" : "#f5f5f5",
  color: animate ? "#fff" : "#111",
  "&:hover": {
    backgroundColor: "#e0b03a",
    color: "#fff",
  },
  ...(animate && {
    animation: `${pulse} 0.5s ease-out`,
  }),
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: "#f0c14b",
  cursor: "pointer",
  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
  letterSpacing: "1px",
  textTransform: "uppercase",
  flexShrink: 0,
  "&:hover": {
    color: "#e0b03a",
    transition: "color 0.2s",
  },
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "25px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  "& .MuiInputBase-root": {
    padding: "4px 12px",
    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  width: { xs: "120px", sm: "200px", md: "300px" },
  "&:hover .MuiInputBase-root": {
    backgroundColor: "#f5f5f5",
    transition: "background-color 0.2s",
  },
}));

const DrawerList = styled(List)(({ theme }) => ({
  width: 280,
  background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
  height: "100%",
  animation: `${slideIn} 0.4s ease-out`,
  borderRadius: "0 16px 16px 0",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const DrawerItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "&:hover": {
    backgroundColor: "#f0c14b",
    color: "#fff",
    "& .MuiListItemIcon-root": { color: "#fff" },
    transition: "background-color 0.2s, color 0.2s",
  },
}));

function Navbar() {
  const { t } = useTranslation();
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
        { headers: { Authorization: `Bearer ${user?.token}` } }
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
        <DrawerItem
          button
          key={item.label}
          onClick={() => {
            navigate(item.path);
            setDrawerOpen(false);
          }}
        >
          <ListItemIcon sx={{ color: "#111" }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} sx={{ color: "#111" }} />
        </DrawerItem>
      ))}
      <DrawerItem
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
      </DrawerItem>
      <DrawerItem
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
      </DrawerItem>
      <DrawerItem button onClick={handleNotifMenuOpen}>
        <ListItemIcon sx={{ color: "#111" }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary={t("Notifications")} sx={{ color: "#111" }} />
      </DrawerItem>
      {user ? (
        <>
          <DrawerItem
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
          </DrawerItem>
          <DrawerItem
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
          </DrawerItem>
        </>
      ) : (
        <DrawerItem
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
        </DrawerItem>
      )}
    </DrawerList>
  );

  return (
    <StyledAppBar>
      <Toolbar
        sx={{
          py: { xs: 1.5, md: 2 },
          minHeight: { xs: 56, sm: 64, md: 72 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, md: 2 },
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Logo */}
        <LogoTypography onClick={() => navigate("/")}>
          {t("EthioShop")}
        </LogoTypography>

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
                <SearchIcon sx={{ color: "#666" }} />
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
                    title={user.name || user.email.split("@")[0]}
                  >
                    <PersonIcon />
                  </NavIconButton>
                </>
              ) : (
                <NavIconButton component={Link} to="/login" title={t("Login")}>
                  <PersonIcon />
                </NavIconButton>
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
          sx: {
            mt: 1.5,
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            bgcolor: "#fff",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleMenuClose();
          }}
          sx={{ "&:hover": { bgcolor: "#f0c14b", color: "#fff" } }}
        >
          {t("Profile")}
        </MenuItem>
        {user && user.role === "admin" && (
          <MenuItem
            onClick={() => {
              navigate("/admin");
              handleMenuClose();
            }}
            sx={{ "&:hover": { bgcolor: "#f0c14b", color: "#fff" } }}
          >
            {t("Admin Dashboard")}
          </MenuItem>
        )}
        <MenuItem
          onClick={handleLogout}
          sx={{ "&:hover": { bgcolor: "#f0c14b", color: "#fff" } }}
        >
          {t("Logout")}
        </MenuItem>
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
            width: { xs: 220, sm: 280, md: 320 },
            mt: 1.5,
            overflowY: "auto",
            bgcolor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
              {t("No new notifications")}
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif._id}
              onClick={() => markAsRead(notif._id)}
              sx={{
                whiteSpace: "normal",
                py: 1.5,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <Typography sx={{ fontSize: "0.9rem", color: "#111" }}>
                {notif.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ "& .MuiDrawer-paper": { width: 280 } }}
      >
        {drawerContent}
      </Drawer>

      {user && <Chat />}
    </StyledAppBar>
  );
}

export default Navbar;
