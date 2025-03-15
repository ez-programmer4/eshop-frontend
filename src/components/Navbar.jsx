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
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%), url("https://images.unsplash.com/photo-1528459801416-a263057e4a34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80") no-repeat center/cover`,
  color: "#1a202c",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  animation: `${fadeIn} 0.6s ease-out`,
  borderRadius: "0 0 16px 16px",
  backdropFilter: "blur(5px)",
  [theme.breakpoints.down("sm")]: { borderRadius: "0 0 12px 12px" },
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  color: "#4a5568",
  padding: theme.spacing(1),
  "&:hover": {
    color: "#ff6b81",
    transform: "scale(1.1)",
    backgroundColor: "rgba(255, 107, 129, 0.1)",
  },
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(0.75) },
}));

const CartIconButton = styled(NavIconButton)(({ theme, animate }) => ({
  ...(animate && {
    animation: `${bounce} 0.5s ease-out`,
  }),
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "#ff6b81",
  cursor: "pointer",
  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  letterSpacing: "-0.2px",
  flexShrink: 0,
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  "& .MuiInputBase-root": {
    padding: theme.spacing(0.5, 1),
    fontSize: { xs: "0.9rem", sm: "1rem" },
    color: "#4a5568",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#feb47b",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ff6b81",
  },
  width: { xs: "120px", sm: "200px", md: "300px" },
  transition: "all 0.3s ease",
}));

const DrawerList = styled(List)(({ theme }) => ({
  width: 260,
  backgroundColor: "#fff",
  height: "100%",
  animation: `${slideIn} 0.4s ease-out`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
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

  const totalCartItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  useEffect(() => {
    if (user) fetchNotifications();
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

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "am" : "en";
    i18n.changeLanguage(newLang);
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
          sx={{ py: 1.5 }}
        >
          <ListItemIcon sx={{ color: "#4a5568" }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.label}
            sx={{ color: "#1a202c", fontWeight: 500 }}
          />
        </ListItem>
      ))}
      <ListItem
        button
        onClick={() => {
          navigate("/cart");
          setDrawerOpen(false);
        }}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon sx={{ color: "#4a5568" }}>
          <Badge badgeContent={totalCartItems} color="error">
            <ShoppingCartIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText
          primary={t("Cart")}
          sx={{ color: "#1a202c", fontWeight: 500 }}
        />
      </ListItem>
      <ListItem
        button
        onClick={() => {
          navigate("/wishlist");
          setDrawerOpen(false);
        }}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon sx={{ color: "#4a5568" }}>
          <Badge badgeContent={wishlist.length} color="error">
            <FavoriteIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText
          primary={t("Wishlist")}
          sx={{ color: "#1a202c", fontWeight: 500 }}
        />
      </ListItem>
      <ListItem button onClick={handleNotifMenuOpen} sx={{ py: 1.5 }}>
        <ListItemIcon sx={{ color: "#4a5568" }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText
          primary={t("Notifications")}
          sx={{ color: "#1a202c", fontWeight: 500 }}
        />
      </ListItem>
      {user ? (
        <>
          <ListItem
            button
            onClick={() => {
              navigate("/profile");
              setDrawerOpen(false);
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ color: "#4a5568" }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("Profile")}
              sx={{ color: "#1a202c", fontWeight: 500 }}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleLogout();
              setDrawerOpen(false);
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ color: "#4a5568" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("Logout")}
              sx={{ color: "#1a202c", fontWeight: 500 }}
            />
          </ListItem>
        </>
      ) : (
        <ListItem
          button
          onClick={() => {
            navigate("/login");
            setDrawerOpen(false);
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon sx={{ color: "#4a5568" }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("Login")}
            sx={{ color: "#1a202c", fontWeight: 500 }}
          />
        </ListItem>
      )}
      <ListItem button onClick={toggleLanguage} sx={{ py: 1.5 }}>
        <ListItemText
          primary={i18n.language === "en" ? "English" : "አማርኛ"}
          sx={{ color: "#ff6b81", fontWeight: 600 }}
        />
      </ListItem>
    </DrawerList>
  );

  return (
    <StyledAppBar position="sticky">
      <Toolbar
        sx={{
          py: { xs: 1, md: 1.5 },
          minHeight: { xs: 56, sm: 64, md: 72 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, md: 2 },
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <LogoTypography variant="h6">EthioShop</LogoTypography>
          </Link>
        </Box>

        {/* Search Bar */}
        {isLaptop && (
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
                  <SearchIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
          />
        )}

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
            <Badge badgeContent={totalCartItems} color="error">
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
                </>
              ) : (
                <NavIconButton component={Link} to="/login" title={t("Login")}>
                  <PersonIcon />
                </NavIconButton>
              )}
              <NavIconButton onClick={toggleLanguage} title={t("Language")}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#ff6b81" }}
                >
                  {i18n.language === "en" ? "EN" : "AM"}
                </Typography>
              </NavIconButton>
            </>
          ) : (
            <NavIconButton edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </NavIconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile/Tablet Search Bar */}
      {(isMobile || isTablet) && (
        <Box sx={{ px: 2, pb: 1 }}>
          <SearchBox
            variant="outlined"
            size="small"
            placeholder={t("Search products...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* Menus and Drawer */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            bgcolor: "#fff",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleMenuClose();
          }}
          sx={{ color: "#1a202c", fontWeight: 500, py: 1 }}
        >
          {t("Profile")}
        </MenuItem>
        {user && user.role === "admin" && (
          <MenuItem
            onClick={() => {
              navigate("/admin");
              handleMenuClose();
            }}
            sx={{ color: "#1a202c", fontWeight: 500, py: 1 }}
          >
            {t("Admin Dashboard")}
          </MenuItem>
        )}
        <MenuItem
          onClick={handleLogout}
          sx={{ color: "#ff6b81", fontWeight: 500, py: 1 }}
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
            mt: 1,
            overflowY: "auto",
            bgcolor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem sx={{ py: 1.5 }}>
            <Typography sx={{ fontSize: "0.95rem", color: "#4a5568" }}>
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
                "&:hover": { bgcolor: "#f7fafc" },
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", color: "#1a202c" }}>
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
        sx={{ "& .MuiDrawer-paper": { width: { xs: 240, sm: 260 } } }}
      >
        {drawerContent}
      </Drawer>

      {user && <Chat />}
    </StyledAppBar>
  );
}

export default Navbar;
