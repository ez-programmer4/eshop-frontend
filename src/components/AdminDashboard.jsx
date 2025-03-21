// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Divider,
  CircularProgress,
  useMediaQuery,
  keyframes,
  TablePagination,
  Collapse,
  Chip,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const socket = io("https://eshop-backend-e11f.onrender.com");

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Custom styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
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

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: "box-shadow 0.3s",
  "&:hover": {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
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
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTab-root": {
    fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
    color: "#555",
    padding: theme.spacing(1),
    textTransform: "none",
    "&:hover": {
      color: "#f0c14b",
      transition: "color 0.2s",
    },
    "&.Mui-selected": {
      color: "#f0c14b",
    },
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#f0c14b",
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: "#555",
  transition: "transform 0.2s, color 0.2s",
  "&:hover": {
    transform: "scale(1.2) rotate(5deg)",
    color: "#f0c14b",
    animation: `${pulse} 0.5s infinite`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#999",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#f0c14b",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#f0c14b",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#999",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#f0c14b",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#f0c14b",
  },
}));

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const chatListRef = useRef(null);

  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    monthlySales: [],
  });
  const [reviewStats, setReviewStats] = useState([]);
  const [activityTrends, setActivityTrends] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [bundleFormData, setBundleFormData] = useState({
    name: "",
    description: "",
    products: [],
    discount: "",
  });
  const [filterData, setFilterData] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
    search: "",
  });
  const [orderFilters, setOrderFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [discountFormData, setDiscountFormData] = useState({
    code: "",
    percentage: "",
    expiresAt: "",
  });
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchAnalytics(),
          fetchUsers(),
          fetchActivities(),
          fetchReviewStats(),
          fetchActivityTrends(),
          fetchPendingReviews(),
          fetchReturnRequests(),
          fetchSalesByCategory(),
          fetchHeatmapData(),
          fetchBundles(),
          fetchReferrals(),
          fetchDiscounts(),
          fetchChatMessages(),
          fetchCategories(),
        ]);
      } catch (error) {
        setError(t("Failed to load dashboard data"));
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();

    socket.on("receiveMessageAdmin", ({ userId, msg }) => {
      setChatMessages((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] || []), msg],
      }));
    });

    return () => {
      socket.off("receiveMessageAdmin");
    };
  }, [user, navigate, t]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages, selectedChatUserId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterData.category) params.category = filterData.category;
      if (filterData.minPrice) params.minPrice = filterData.minPrice;
      if (filterData.maxPrice) params.maxPrice = filterData.maxPrice;
      if (filterData.minStock) params.minStock = filterData.minStock;
      if (filterData.maxStock) params.maxStock = filterData.maxStock;
      if (filterData.sort) params.sort = filterData.sort;
      if (filterData.search) params.search = filterData.search;

      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products",
        {
          params,
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setProducts(response.data);
    } catch (error) {
      setError(
        t("Failed to fetch products") +
          ": " +
          (error.response?.data.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/orders",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setOrders(response.data);
    } catch (error) {
      console.error(
        "Fetch orders error:",
        error.response?.data || error.message
      );
    }
  };
  const filterAndSortOrders = () => {
    let filteredOrders = [...orders];

    if (orderFilters.status) {
      filteredOrders = filteredOrders.filter(
        (o) => o.status === orderFilters.status
      );
    }
    if (orderFilters.search) {
      const searchLower = orderFilters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (o) =>
          o._id.toLowerCase().includes(searchLower) ||
          (o.userId?.email || "").toLowerCase().includes(searchLower)
      );
    }
    if (orderFilters.startDate) {
      filteredOrders = filteredOrders.filter(
        (o) => new Date(o.createdAt) >= new Date(orderFilters.startDate)
      );
    }
    if (orderFilters.endDate) {
      filteredOrders = filteredOrders.filter(
        (o) => new Date(o.createdAt) <= new Date(orderFilters.endDate)
      );
    }

    filteredOrders.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortField === "createdAt") {
        return sortOrder === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filteredOrders;
  };

  // Paginated orders
  const paginatedOrders = filterAndSortOrders().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Event handlers
  const handleOrderFilterChange = (e) => {
    const { name, value } = e.target;
    setOrderFilters({ ...orderFilters, [name]: value });
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/orders/analytics",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error(
        "Fetch analytics error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/users",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error(
        "Fetch users error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/activities",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setActivities(response.data);
    } catch (error) {
      console.error(
        "Fetch activities error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products/analytics",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReviewStats(response.data);
    } catch (error) {
      console.error(
        "Fetch review stats error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchActivityTrends = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/activities/trends",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setActivityTrends(response.data);
    } catch (error) {
      console.error(
        "Fetch activity trends error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const allReviews = response.data.flatMap((product) =>
        product.reviews
          .filter((review) => review.pending)
          .map((review) => ({
            ...review,
            productId: product._id,
            productName: product.name,
          }))
      );
      setPendingReviews(allReviews);
    } catch (error) {
      console.error(
        "Fetch pending reviews error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/return-requests",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReturnRequests(response.data);
    } catch (error) {
      console.error(
        "Fetch return requests error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchSalesByCategory = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/products/sales-analytics",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSalesByCategory(response.data);
    } catch (error) {
      console.error(
        "Fetch sales by category error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/activities/heatmap",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setHeatmapData(response.data);
    } catch (error) {
      console.error(
        "Fetch heatmap data error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchBundles = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/bundles",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setBundles(response.data);
    } catch (error) {
      console.error(
        "Fetch bundles error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/referrals",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReferrals(response.data);
    } catch (error) {
      console.error(
        "Fetch referrals error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/discounts",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setDiscounts(response.data);
    } catch (error) {
      console.error(
        "Fetch discounts error:",
        error.response?.data || error.message
      );
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/categories",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchChatMessages = async () => {
    setChatMessages({}); // Placeholder - implement backend chat fetch if needed
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleBundleInputChange = (e) => {
    const { name, value } = e.target;
    setBundleFormData({ ...bundleFormData, [name]: value });
  };

  const handleBundleProductChange = (e) => {
    const selected = e.target.value;
    setBundleFormData({ ...bundleFormData, products: selected });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  };

  const applyFilters = () => fetchProducts();

  const clearFilters = () => {
    setFilterData({
      category: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: "",
      search: "",
    });
    fetchProducts();
  };

  const handleDiscountInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountFormData({ ...discountFormData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t("Product name is required"));
      return false;
    }
    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      setError(t("Valid price is required"));
      return false;
    }
    if (!formData.category) {
      setError(t("Category is required"));
      return false;
    }
    if (
      formData.stock === "" ||
      isNaN(formData.stock) ||
      Number(formData.stock) < 0
    ) {
      setError(t("Valid stock quantity is required"));
      return false;
    }
    return true;
  };

  const validateUserForm = () => {
    if (!userFormData.name || !userFormData.email || !userFormData.role) {
      setError(t("Name, email, and role are required"));
      return false;
    }
    return true;
  };

  const validateBundleForm = () => {
    if (
      !bundleFormData.name ||
      !bundleFormData.description ||
      !bundleFormData.products.length ||
      !bundleFormData.discount
    ) {
      setError(t("All fields are required"));
      return false;
    }
    const discount = Number(bundleFormData.discount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      setError(t("Discount must be between 0 and 100"));
      return false;
    }
    return true;
  };

  const validateDiscountForm = () => {
    if (!discountFormData.code || !discountFormData.percentage) {
      setError(t("Code and percentage are required"));
      return false;
    }
    const percentage = Number(discountFormData.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError(t("Percentage must be between 0 and 100"));
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/products",
        {
          ...formData,
          description: formData.description || "",
          image: formData.image || "",
          stock: Number(formData.stock), // Ensure stock is a number
          price: Number(formData.price), // Ensure price is a number
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProducts([...products, response.data]);
      resetProductForm();
      setSuccess(t("Product added successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to add product") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || "",
    });
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/products/${editingProduct._id}`,
        {
          ...formData,
          description: formData.description || "",
          image: formData.image || "",
          stock: Number(formData.stock),
          price: Number(formData.price),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProducts(
        products.map((p) => (p._id === editingProduct._id ? response.data : p))
      );
      resetProductForm();
      setSuccess(t("Product updated successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update product") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setProducts(products.filter((p) => p._id !== id));
      setSuccess(t("Product deleted successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to delete product") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    });
    setError("");
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders(orders.map((o) => (o._id === orderId ? response.data : o)));
      setSuccess(t(`Order status updated to ${status}`));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update order status") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({ name: user.name, email: user.email, role: user.role });
  };

  const handleUpdateUser = async () => {
    if (!validateUserForm()) return;
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/users/${editingUser._id}`,
        userFormData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUsers(
        users.map((u) => (u._id === editingUser._id ? response.data : u))
      );
      resetUserForm();
      setSuccess(t("User updated successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update user") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUsers(users.filter((u) => u._id !== id));
      setSuccess(t("User deleted successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to delete user") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleApproveReview = async (productId, reviewId) => {
    try {
      await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/products/${productId}/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPendingReviews(pendingReviews.filter((r) => r._id !== reviewId));
      setSuccess(t("Review approved successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to approve review") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleUpdateReturnRequest = async (requestId, status) => {
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/return-requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReturnRequests(
        returnRequests.map((req) =>
          req._id === requestId ? response.data : req
        )
      );
      setSuccess(t(`Return request ${status.toLowerCase()} successfully`));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update return request") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleAddBundle = async () => {
    if (!validateBundleForm()) return;
    try {
      const payload = {
        ...bundleFormData,
        discount: Number(bundleFormData.discount),
      };
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/bundles",
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setBundles([...bundles, response.data]);
      resetBundleForm();
      setSuccess(t("Bundle added successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to add bundle") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle(bundle);
    setBundleFormData({
      name: bundle.name,
      description: bundle.description,
      products: bundle.products.map((p) => p._id),
      discount: bundle.discount,
    });
  };

  const handleUpdateBundle = async () => {
    if (!validateBundleForm()) return;
    try {
      const payload = {
        ...bundleFormData,
        discount: Number(bundleFormData.discount),
      };
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/bundles/${editingBundle._id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBundles(
        bundles.map((b) => (b._id === editingBundle._id ? response.data : b))
      );
      resetBundleForm();
      setSuccess(t("Bundle updated successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update bundle") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleDeleteBundle = async (id) => {
    try {
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/bundles/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setBundles(bundles.filter((b) => b._id !== id));
      setSuccess(t("Bundle deleted successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to delete bundle") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleAddDiscount = async () => {
    if (!validateDiscountForm()) return;
    try {
      const payload = {
        ...discountFormData,
        percentage: Number(discountFormData.percentage),
        expiresAt: discountFormData.expiresAt || undefined,
      };
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/discounts",
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setDiscounts([...discounts, response.data]);
      resetDiscountForm();
      setSuccess(t("Discount added successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to add discount") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountFormData({
      code: discount.code,
      percentage: discount.percentage,
      expiresAt: discount.expiresAt ? discount.expiresAt.slice(0, 10) : "",
    });
  };

  const handleUpdateDiscount = async () => {
    if (!validateDiscountForm()) return;
    try {
      const payload = {
        ...discountFormData,
        percentage: Number(discountFormData.percentage),
        expiresAt: discountFormData.expiresAt || undefined,
      };
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/discounts/${editingDiscount._id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDiscounts(
        discounts.map((d) =>
          d._id === editingDiscount._id ? response.data : d
        )
      );
      resetDiscountForm();
      setSuccess(t("Discount updated successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update discount") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleDeleteDiscount = async (id) => {
    try {
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/discounts/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setDiscounts(discounts.filter((d) => d._id !== id));
      setSuccess(t("Discount deleted successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to delete discount") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  const validateCategoryForm = () => {
    if (!categoryFormData.name) {
      setError(t("Category name is required"));
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateCategoryForm()) return;
    try {
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/categories",
        categoryFormData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCategories([...categories, response.data]);
      resetCategoryForm();
      setSuccess(t("Category added successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to add category") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleUpdateCategory = async () => {
    if (!validateCategoryForm()) return;
    try {
      const response = await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/categories/${editingCategory._id}`,
        categoryFormData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCategories(
        categories.map((cat) =>
          cat._id === editingCategory._id ? response.data : cat
        )
      );
      resetCategoryForm();
      setSuccess(t("Category updated successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to update category") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setCategories(categories.filter((cat) => cat._id !== id));
      setSuccess(t("Category deleted successfully"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to delete category") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "", description: "" });
    setError("");
  };

  const handleOpenChat = (userId) => {
    setSelectedChatUserId(userId);
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim() && selectedChatUserId) {
      socket.emit("sendMessage", {
        userId: selectedChatUserId,
        message: chatInput,
        isAdmin: true,
      });
      setChatInput("");
    }
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setUserFormData({ name: "", email: "", role: "" });
    setError("");
  };

  const resetBundleForm = () => {
    setEditingBundle(null);
    setBundleFormData({
      name: "",
      description: "",
      products: [],
      discount: "",
    });
    setError("");
  };

  const resetDiscountForm = () => {
    setEditingDiscount(null);
    setDiscountFormData({ code: "", percentage: "", expiresAt: "" });
    setError("");
  };

  const salesChartData = {
    labels: analytics.monthlySales.map((sale) => `${sale.month}/${sale.year}`),
    datasets: [
      {
        label: t("Total Revenue ($)"),
        data: analytics.monthlySales.map((sale) => sale.totalRevenue),
        borderColor: "#f0c14b",
        backgroundColor: "rgba(240, 193, 75, 0.2)",
        fill: true,
      },
      {
        label: t("Total Orders"),
        data: analytics.monthlySales.map((sale) => sale.totalOrders),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.2)",
        fill: true,
      },
    ],
  };

  const activityChartData = {
    labels: activityTrends.map((trend) => trend.date),
    datasets: [
      {
        label: t("Logins"),
        data: activityTrends.map((trend) => trend.logins),
        borderColor: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        fill: true,
      },
      {
        label: t("Purchases"),
        data: activityTrends.map((trend) => trend.purchases),
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: t("Monthly Sales Overview"),
        color: "#111",
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#555" } },
      x: {
        ticks: {
          color: "#555",
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
        },
      },
    },
  };

  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: t("User Activity Trends (Last 30 Days)"),
        color: "#111",
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#555" } },
      x: {
        ticks: {
          color: "#555",
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
        },
      },
    },
  };

  return (
    <DashboardContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Admin Dashboard")}
      </Typography>

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
      ) : (
        <>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, bgcolor: "#ffebee" }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2, borderRadius: 2, bgcolor: "#e0f7fa" }}
            >
              {success}
            </Alert>
          )}
          <StyledTabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            centered={!isMobile && !isTablet}
            variant={isMobile || isTablet ? "scrollable" : "standard"}
            scrollButtons={isMobile || isTablet}
            allowScrollButtonsMobile
            sx={{ mb: isMobile ? 2 : 4 }}
          >
            <Tab label={t("Products")} />
            <Tab label={t("Orders")} />
            <Tab label={t("Analytics")} />
            <Tab label={t("Users")} />
            <Tab label={t("Activity")} />
            <Tab label={t("Reviews")} />
            <Tab label={t("Returns")} />
            <Tab label={t("Bundles")} />
            <Tab label={t("Referrals")} />
            <Tab label={t("Support")} />
            <Tab label={t("Discounts")} />
            <Tab label={t("Categories")} /> {/* New Tab */}
          </StyledTabs>
          {tabValue === 0 && (
            <Box>
              {/* Add/Edit Product Form */}
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {editingProduct ? t("Edit Product") : t("Add New Product")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Name")}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Description")}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Price")}
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth margin="normal">
                      <InputLabel>{t("Category")}</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label={t("Category")}
                      >
                        <MenuItem value="">{t("Select Category")}</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat.name}>
                            {t(cat.name)}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Stock")}
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Image URL")}
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <ActionButton
                    onClick={
                      editingProduct ? handleUpdateProduct : handleAddProduct
                    }
                    startIcon={<AddIcon />}
                  >
                    {editingProduct ? t("Update") : t("Add")}
                  </ActionButton>
                  {editingProduct && (
                    <Button
                      variant="outlined"
                      onClick={resetProductForm}
                      sx={{
                        borderRadius: 2,
                        color: "#555",
                        borderColor: "#ccc",
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                </Box>
              </SectionCard>

              {/* Filter Products */}
              <SectionCard sx={{ mt: 4 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Filter Products")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={4}>
                    <StyledFormControl fullWidth>
                      <InputLabel>{t("Category")}</InputLabel>
                      <Select
                        name="category"
                        value={filterData.category}
                        onChange={handleFilterChange}
                        label={t("Category")}
                      >
                        <MenuItem value="">{t("All")}</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat.name}>
                            {t(cat.name)}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <StyledTextField
                      label={t("Min Price")}
                      name="minPrice"
                      type="number"
                      value={filterData.minPrice}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <StyledTextField
                      label={t("Max Price")}
                      name="maxPrice"
                      type="number"
                      value={filterData.maxPrice}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <StyledTextField
                      label={t("Min Stock")}
                      name="minStock"
                      type="number"
                      value={filterData.minStock}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <StyledTextField
                      label={t("Max Stock")}
                      name="maxStock"
                      type="number"
                      value={filterData.maxStock}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledFormControl fullWidth>
                      <InputLabel>{t("Sort By")}</InputLabel>
                      <Select
                        name="sort"
                        value={filterData.sort}
                        onChange={handleFilterChange}
                        label={t("Sort By")}
                      >
                        <MenuItem value="name">{t("Name")}</MenuItem>
                        <MenuItem value="price">{t("Price")}</MenuItem>
                        <MenuItem value="stock">{t("Stock")}</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label={t("Search")}
                      name="search"
                      value={filterData.search}
                      onChange={handleFilterChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <ActionButton onClick={applyFilters} sx={{ mt: 2 }}>
                      {t("Apply Filters")}
                    </ActionButton>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Product List */}
              <SectionCard sx={{ mt: 4 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Product List")}
                </Typography>
                {loading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : products.length === 0 ? (
                  <Typography sx={{ textAlign: "center", color: "#555" }}>
                    {t("No products match your filters.")}
                  </Typography>
                ) : (
                  <List>
                    {products.map((product) => (
                      <ListItem
                        key={product._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                          p: 2,
                        }}
                      >
                        <ListItemText
                          primary={product.name}
                          secondary={`${t("Price")}: $${product.price} | ${t(
                            "Category"
                          )}: ${product.category} | ${t("Stock")}: ${
                            product.stock
                          }`}
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <StyledIconButton
                            onClick={() => handleEditProduct(product)}
                          >
                            <EditIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <DeleteIcon />
                          </StyledIconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </SectionCard>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle2" : "h6"} // Smaller typography on mobile
                  sx={{ fontWeight: 600, mb: isMobile ? 1 : 2 }}
                >
                  {t("Order Filters")}
                </Typography>
                <Grid
                  container
                  spacing={isMobile ? 1 : 2}
                  direction={isMobile ? "column" : "row"}
                >
                  <Grid item xs={12} sm={3}>
                    <StyledFormControl
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                    >
                      <InputLabel>{t("Status")}</InputLabel>
                      <Select
                        name="status"
                        value={orderFilters.status}
                        onChange={handleOrderFilterChange}
                        label={t("Status")}
                      >
                        <MenuItem value="">{t("All")}</MenuItem>
                        <MenuItem value="Pending">{t("Pending")}</MenuItem>
                        <MenuItem value="Shipped">{t("Shipped")}</MenuItem>
                        <MenuItem value="Delivered">{t("Delivered")}</MenuItem>
                        <MenuItem value="Canceled">{t("Canceled")}</MenuItem>
                        <MenuItem value="Returned">{t("Returned")}</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <StyledTextField
                      label={t("Search (ID/Email)")}
                      name="search"
                      value={orderFilters.search}
                      onChange={handleOrderFilterChange}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <StyledTextField
                      label={t("Start Date")}
                      name="startDate"
                      type="date"
                      value={orderFilters.startDate}
                      onChange={handleOrderFilterChange}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <StyledTextField
                      label={t("End Date")}
                      name="endDate"
                      type="date"
                      value={orderFilters.endDate}
                      onChange={handleOrderFilterChange}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle2" : "h6"}
                  sx={{ fontWeight: 600, mb: isMobile ? 1 : 2 }}
                >
                  {t("Order Status Distribution")}
                </Typography>
                <Box
                  sx={{ height: isMobile ? "180px" : "300px", width: "100%" }}
                >
                  <Pie
                    data={{
                      labels: [
                        "Pending",
                        "Shipped",
                        "Delivered",
                        "Canceled",
                        "Returned",
                      ],
                      datasets: [
                        {
                          data: [
                            orders.filter((o) => o.status === "Pending").length,
                            orders.filter((o) => o.status === "Shipped").length,
                            orders.filter((o) => o.status === "Delivered")
                              .length,
                            orders.filter((o) => o.status === "Canceled")
                              .length,
                            orders.filter((o) => o.status === "Returned")
                              .length,
                          ],
                          backgroundColor: [
                            "#f0c14b",
                            "#3498db",
                            "#2ecc71",
                            "#e74c3c",
                            "#9b59b6",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: isMobile ? "bottom" : "top", // Move legend below on mobile
                          labels: { font: { size: isMobile ? 10 : 12 } },
                        },
                        title: {
                          display: true,
                          text: t("Orders by Status"),
                          color: "#111",
                          font: { size: isMobile ? 14 : 16 },
                        },
                      },
                    }}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle2" : "h6"}
                  sx={{ fontWeight: 600, mb: isMobile ? 1 : 2 }}
                >
                  {t("Order List")}
                </Typography>
                <Table
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    tableLayout: "fixed",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ width: "40px", p: isMobile ? 0.5 : 1 }}
                      />
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          width: isMobile ? "20%" : "auto",
                        }}
                        onClick={() => handleSort("_id")}
                      >
                        {t("Order ID")}{" "}
                        {sortField === "_id" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          display: isMobile ? "none" : "table-cell", // Hide on mobile
                        }}
                      >
                        {t("User")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          width: isMobile ? "20%" : "auto",
                        }}
                        onClick={() => handleSort("total")}
                      >
                        {t("Total")}{" "}
                        {sortField === "total" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          width: isMobile ? "25%" : "auto",
                        }}
                        onClick={() => handleSort("createdAt")}
                      >
                        {t("Date")}{" "}
                        {sortField === "createdAt" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          width: isMobile ? "20%" : "auto",
                        }}
                      >
                        {t("Status")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          p: isMobile ? 0.5 : 1,
                          width: isMobile ? "15%" : "auto",
                        }}
                      >
                        {t("Actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <TableRow
                          sx={{
                            "&:hover": { bgcolor: "#f5f5f5" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ p: isMobile ? 0.5 : 1 }}>
                            <IconButton
                              size={isMobile ? "small" : "medium"}
                              onClick={() => toggleOrderExpand(order._id)}
                            >
                              {expandedOrder === order._id ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                              p: isMobile ? 0.5 : 1,
                            }}
                          >
                            {order._id.slice(-6)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                              p: isMobile ? 0.5 : 1,
                              display: isMobile ? "none" : "table-cell",
                            }}
                          >
                            {order.userId?.email || "Unknown"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                              p: isMobile ? 0.5 : 1,
                            }}
                          >
                            ${order.total.toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                              p: isMobile ? 0.5 : 1,
                            }}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ p: isMobile ? 0.5 : 1 }}>
                            <Chip
                              label={t(order.status)}
                              color={
                                order.status === "Delivered"
                                  ? "success"
                                  : order.status === "Canceled" ||
                                    order.status === "Returned"
                                  ? "error"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ p: isMobile ? 0.5 : 1 }}>
                            <StyledFormControl
                              sx={{ minWidth: isMobile ? 80 : 120 }}
                              size={isMobile ? "small" : "medium"}
                            >
                              <InputLabel>{t("Status")}</InputLabel>
                              <Select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    e.target.value
                                  )
                                }
                                label={t("Status")}
                              >
                                <MenuItem value="Pending">
                                  {t("Pending")}
                                </MenuItem>
                                <MenuItem value="Shipped">
                                  {t("Shipped")}
                                </MenuItem>
                                <MenuItem value="Delivered">
                                  {t("Delivered")}
                                </MenuItem>
                                <MenuItem value="Canceled">
                                  {t("Canceled")}
                                </MenuItem>
                                <MenuItem value="Returned">
                                  {t("Returned")}
                                </MenuItem>
                              </Select>
                            </StyledFormControl>
                            <ActionButton
                              component={Link}
                              to={`/order/${order._id}`}
                              sx={{
                                ml: isMobile ? 0.5 : 1,
                                py: isMobile ? 0.2 : 0.5,
                                fontSize: isMobile ? "0.7rem" : "0.875rem",
                              }}
                            >
                              {t("Details")}
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 0 }}>
                            <Collapse
                              in={expandedOrder === order._id}
                              timeout="auto"
                            >
                              <Box
                                sx={{
                                  p: isMobile ? 1 : 2,
                                  bgcolor: "#fafafa",
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                                  }}
                                >
                                  {t("Items")}:
                                </Typography>
                                <List dense>
                                  {order.items.map((item, idx) => (
                                    <ListItem
                                      key={idx}
                                      sx={{ p: isMobile ? 0.2 : 0.5 }}
                                    >
                                      <ListItemText
                                        primary={`${
                                          item.productId?.name || "Unknown"
                                        } x${item.quantity}`}
                                        secondary={
                                          item.bundleId
                                            ? `Bundle ID: ${item.bundleId}`
                                            : null
                                        }
                                        primaryTypographyProps={{
                                          fontSize: isMobile
                                            ? "0.7rem"
                                            : "0.875rem",
                                        }}
                                        secondaryTypographyProps={{
                                          fontSize: isMobile
                                            ? "0.65rem"
                                            : "0.75rem",
                                        }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filterAndSortOrders().length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={t("Rows per page:")}
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t("of")} ${count}`
                  }
                  sx={{
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        fontSize: isMobile ? "0.7rem" : "0.875rem",
                      },
                    "& .MuiTablePagination-actions": {
                      mx: isMobile ? 0.5 : 1,
                    },
                  }}
                />
              </SectionCard>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Analytics Overview")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                      {t("Total Orders")}: {analytics.totalOrders || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                      {t("Total Revenue")}: $
                      {Number(analytics.totalRevenue || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Rest of the snippet remains unchanged */}
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Monthly Sales")}
                </Typography>
                <Box sx={{ height: isMobile ? "200px" : "300px" }}>
                  <Line data={salesChartData} options={chartOptions} />
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Sales by Category")}
                </Typography>
                <Box sx={{ height: isMobile ? "200px" : "300px" }}>
                  <Bar
                    data={{
                      labels: salesByCategory.map((s) => t(s.category)),
                      datasets: [
                        {
                          label: t("Total Sales"),
                          data: salesByCategory.map((s) => s.totalSales),
                          backgroundColor: "#f0c14b",
                        },
                        {
                          label: t("Total Revenue ($)"),
                          data: salesByCategory.map((s) => s.totalRevenue),
                          backgroundColor: "#e74c3c",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: t("Sales by Category") },
                      },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Top Products")}
                </Typography>
                <Table sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Product")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Quantity Sold")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Revenue")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(analytics.topProducts || []).map((product) => (
                      <TableRow key={product.name}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          ${Number(product.revenue || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>

              {/* Remaining sections unchanged */}
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Review Statistics")}
                </Typography>
                <Table sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Product")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Review Count")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t("Average Rating")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviewStats.map((stat) => (
                      <TableRow key={stat.name}>
                        <TableCell>{stat.name}</TableCell>
                        <TableCell>{stat.reviewCount}</TableCell>
                        <TableCell>{stat.averageRating} / 5</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("User Activity Heatmap (Last 30 Days)")}
                </Typography>
                <Box sx={{ height: isMobile ? "200px" : "300px" }}>
                  <Bar
                    data={{
                      labels: heatmapData.map((h) => h.date),
                      datasets: [
                        {
                          label: t("Logins"),
                          data: heatmapData.map((h) => h.logins),
                          backgroundColor: "#2ecc71",
                        },
                        {
                          label: t("Purchases"),
                          data: heatmapData.map((h) => h.purchases),
                          backgroundColor: "#3498db",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: t("Daily Activity") },
                      },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </SectionCard>
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {editingUser ? t("Edit User") : t("Manage Users")}
                </Typography>
                {editingUser && (
                  <Grid container spacing={isMobile ? 1 : 2}>
                    <Grid item xs={12} sm={4}>
                      <StyledTextField
                        label={t("Name")}
                        name="name"
                        value={userFormData.name}
                        onChange={handleUserInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StyledTextField
                        label={t("Email")}
                        name="email"
                        value={userFormData.email}
                        onChange={handleUserInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StyledFormControl fullWidth margin="normal">
                        <InputLabel>{t("Role")}</InputLabel>
                        <Select
                          name="role"
                          value={userFormData.role}
                          onChange={handleUserInputChange}
                          label={t("Role")}
                        >
                          <MenuItem value="user">{t("User")}</MenuItem>
                          <MenuItem value="admin">{t("Admin")}</MenuItem>
                        </Select>
                      </StyledFormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: isMobile ? "center" : "flex-start",
                      }}
                    >
                      <ActionButton onClick={handleUpdateUser}>
                        {t("Update User")}
                      </ActionButton>
                      <Button
                        variant="outlined"
                        onClick={resetUserForm}
                        sx={{
                          borderRadius: 2,
                          color: "#555",
                          borderColor: "#ccc",
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("User List")}
                </Typography>
                <List>
                  {users.map((user) => (
                    <ListItem
                      key={user._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        bgcolor: "#fff",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                      }}
                    >
                      <ListItemText
                        primary={user.name}
                        secondary={`${user.email} - ${t("Role")}: ${t(
                          user.role
                        )}`}
                        sx={{ mb: isMobile ? 1 : 0 }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <StyledIconButton onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </StyledIconButton>
                        <StyledIconButton
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </StyledIconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 4 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("User Activity")}
                </Typography>
                <Box sx={{ height: isMobile ? "200px" : "300px" }}>
                  <Line
                    data={activityChartData}
                    options={activityChartOptions}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Activity Log")}
                </Typography>
                <List>
                  {activities.map((activity) => (
                    <ListItem
                      key={activity._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        bgcolor: "#fff",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                      }}
                    >
                      <ListItemText
                        primary={`${activity.userId?.name || "Unknown User"} (${
                          activity.userId?.email || "N/A"
                        })`}
                        secondary={`${t(activity.action)}: ${
                          activity.details
                        } - ${new Date(activity.timestamp).toLocaleString()}`}
                        sx={{ mb: isMobile ? 1 : 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 5 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Pending Reviews")}
                </Typography>
                <List>
                  {pendingReviews.length === 0 ? (
                    <Typography sx={{ textAlign: "center", color: "#555" }}>
                      {t("No pending reviews.")}
                    </Typography>
                  ) : (
                    pendingReviews.map((review) => (
                      <ListItem
                        key={review._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                        }}
                      >
                        <ListItemText
                          primary={`${review.productName} - ${
                            review.userId?.name || "Unknown User"
                          }`}
                          secondary={`${review.rating}/5 - ${review.comment}`}
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                        <ActionButton
                          onClick={() =>
                            handleApproveReview(review.productId, review._id)
                          }
                        >
                          {t("Approve")}
                        </ActionButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 6 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Pending Return Requests")}
                </Typography>
                <List>
                  {returnRequests.length === 0 ? (
                    <Typography sx={{ textAlign: "center", color: "#555" }}>
                      {t("No pending return requests.")}
                    </Typography>
                  ) : (
                    returnRequests.map((request) => (
                      <ListItem
                        key={request._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                        }}
                      >
                        <ListItemText
                          primary={`${t("Order")} #${
                            request.orderId?._id || "Unknown Order"
                          } - ${request.userId?.name || "Unknown User"} (${
                            request.userId?.email || "N/A"
                          })`}
                          secondary={`${t("Reason")}: ${request.reason} - ${t(
                            "Status"
                          )}: ${t(request.status)}`}
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                        {request.status === "Pending" && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              flexWrap: isMobile ? "wrap" : "nowrap",
                            }}
                          >
                            <ActionButton
                              onClick={() =>
                                handleUpdateReturnRequest(
                                  request._id,
                                  "Approved"
                                )
                              }
                              sx={{
                                bgcolor: "#2ecc71",
                                "&:hover": { bgcolor: "#27ae60" },
                              }}
                            >
                              {t("Approve")}
                            </ActionButton>
                            <ActionButton
                              onClick={() =>
                                handleUpdateReturnRequest(
                                  request._id,
                                  "Rejected"
                                )
                              }
                              sx={{
                                bgcolor: "#e74c3c",
                                "&:hover": { bgcolor: "#c0392b" },
                              }}
                            >
                              {t("Reject")}
                            </ActionButton>
                          </Box>
                        )}
                      </ListItem>
                    ))
                  )}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 7 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {editingBundle ? t("Edit Bundle") : t("Add New Bundle")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Name")}
                      name="name"
                      value={bundleFormData.name}
                      onChange={handleBundleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Discount (%)")}
                      name="discount"
                      type="number"
                      value={bundleFormData.discount}
                      onChange={handleBundleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label={t("Description")}
                      name="description"
                      value={bundleFormData.description}
                      onChange={handleBundleInputChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth margin="normal">
                      <InputLabel>{t("Products")}</InputLabel>
                      <Select
                        multiple
                        name="products"
                        value={bundleFormData.products}
                        onChange={handleBundleProductChange}
                        label={t("Products")}
                      >
                        {products.map((product) => (
                          <MenuItem key={product._id} value={product._id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    justifyContent: isMobile ? "center" : "flex-start",
                  }}
                >
                  <ActionButton
                    onClick={
                      editingBundle ? handleUpdateBundle : handleAddBundle
                    }
                    startIcon={<AddIcon />}
                  >
                    {editingBundle ? t("Update") : t("Add")}
                  </ActionButton>
                  {editingBundle && (
                    <Button
                      variant="outlined"
                      onClick={resetBundleForm}
                      sx={{
                        borderRadius: 2,
                        color: "#555",
                        borderColor: "#ccc",
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Bundle List")}
                </Typography>
                <List>
                  {bundles.map((bundle) => (
                    <ListItem
                      key={bundle._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        bgcolor: "#fff",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                      }}
                    >
                      <ListItemText
                        primary={bundle.name}
                        secondary={`${t("Products")}: ${bundle.products
                          .map((p) => p.name)
                          .join(", ")} - ${t("Discount")}: ${
                          bundle.discount
                        }% - ${t("Price")}: $${bundle.price}`}
                        sx={{ mb: isMobile ? 1 : 0 }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <StyledIconButton
                          onClick={() => handleEditBundle(bundle)}
                        >
                          <EditIcon />
                        </StyledIconButton>
                        <StyledIconButton
                          onClick={() => handleDeleteBundle(bundle._id)}
                        >
                          <DeleteIcon />
                        </StyledIconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 8 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Referral List")}
                </Typography>
                <List>
                  {referrals.length === 0 ? (
                    <Typography sx={{ textAlign: "center", color: "#555" }}>
                      {t("No referrals yet.")}
                    </Typography>
                  ) : (
                    referrals.map((referral) => (
                      <ListItem
                        key={referral._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                        }}
                      >
                        <ListItemText
                          primary={`${
                            referral.referrerId?.name || "Unknown User"
                          } (${referral.referrerId?.email || "N/A"}) -> ${
                            referral.refereeId?.name || "Unknown User"
                          } (${referral.refereeId?.email || "N/A"})`}
                          secondary={`${t("Code")}: ${
                            referral.referralCode
                          } - ${t("Status")}: ${t(referral.status)}`}
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </SectionCard>
            </Box>
          )}
          {tabValue === 9 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Live Support")}
                </Typography>
                {!selectedChatUserId ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t("Active Chats")}
                    </Typography>
                    <List>
                      {Object.entries(chatMessages).length === 0 ? (
                        <Typography sx={{ textAlign: "center", color: "#555" }}>
                          {t("No active chats.")}
                        </Typography>
                      ) : (
                        Object.entries(chatMessages).map(([userId, msgs]) => (
                          <ListItem
                            key={userId}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                              bgcolor: "#fff",
                              borderRadius: 2,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                              flexDirection: isMobile ? "column" : "row",
                              alignItems: isMobile ? "flex-start" : "center",
                            }}
                          >
                            <ListItemText
                              primary={`${userId} - ${msgs.length} ${t(
                                "messages"
                              )}`}
                              secondary={
                                msgs[msgs.length - 1]?.message ||
                                t("No messages yet")
                              }
                              sx={{ mb: isMobile ? 1 : 0 }}
                            />
                            <ActionButton
                              onClick={() => handleOpenChat(userId)}
                            >
                              {t("Chat")}
                            </ActionButton>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t("Chat with User")}: {selectedChatUserId}
                    </Typography>
                    <List
                      sx={{
                        maxHeight: isMobile ? "300px" : "400px",
                        overflowY: "auto",
                        mb: 2,
                      }}
                      ref={chatListRef}
                    >
                      {chatMessages[selectedChatUserId]?.map((msg, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${msg.isAdmin ? "You" : "User"}: ${
                              msg.message
                            }`}
                            secondary={new Date(msg.timestamp).toLocaleString()}
                            sx={{ color: msg.isAdmin ? "#f0c14b" : "#111" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <StyledTextField
                      fullWidth
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t("Type a message...")}
                      variant="outlined"
                      sx={{ mb: 1 }}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendChatMessage()
                      }
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <ActionButton
                        onClick={handleSendChatMessage}
                        sx={{ flex: 1 }}
                      >
                        {t("Send")}
                      </ActionButton>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedChatUserId(null)}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          color: "#555",
                          borderColor: "#ccc",
                        }}
                      >
                        {t("Close Chat")}
                      </Button>
                    </Box>
                  </Box>
                )}
              </SectionCard>
            </Box>
          )}
          {tabValue === 10 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {editingDiscount ? t("Edit Discount") : t("Add New Discount")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label={t("Code")}
                      name="code"
                      value={discountFormData.code}
                      onChange={handleDiscountInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label={t("Percentage (%)")}
                      name="percentage"
                      type="number"
                      value={discountFormData.percentage}
                      onChange={handleDiscountInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label={t("Expires At (optional)")}
                      name="expiresAt"
                      type="date"
                      value={discountFormData.expiresAt}
                      onChange={handleDiscountInputChange}
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    justifyContent: isMobile ? "center" : "flex-start",
                  }}
                >
                  <ActionButton
                    onClick={
                      editingDiscount ? handleUpdateDiscount : handleAddDiscount
                    }
                    startIcon={<AddIcon />}
                  >
                    {editingDiscount ? t("Update") : t("Add")}
                  </ActionButton>
                  {editingDiscount && (
                    <Button
                      variant="outlined"
                      onClick={resetDiscountForm}
                      sx={{
                        borderRadius: 2,
                        color: "#555",
                        borderColor: "#ccc",
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Discount List")}
                </Typography>
                <List>
                  {discounts.length === 0 ? (
                    <Typography sx={{ textAlign: "center", color: "#555" }}>
                      {t("No discounts yet.")}
                    </Typography>
                  ) : (
                    discounts.map((discount) => (
                      <ListItem
                        key={discount._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                        }}
                      >
                        <ListItemText
                          primary={discount.code}
                          secondary={`${t("Discount")}: ${
                            discount.percentage
                          }% - ${t("Expires")}: ${
                            discount.expiresAt
                              ? new Date(
                                  discount.expiresAt
                                ).toLocaleDateString()
                              : t("Never")
                          } - ${t("Active")}: ${
                            discount.active ? t("Yes") : t("No")
                          }`}
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <StyledIconButton
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <EditIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            onClick={() => handleDeleteDiscount(discount._id)}
                          >
                            <DeleteIcon />
                          </StyledIconButton>
                        </Box>
                      </ListItem>
                    ))
                  )}
                </List>
              </SectionCard>
            </Box>
          )}

          {tabValue === 11 && (
            <Box>
              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {editingCategory ? t("Edit Category") : t("Add New Category")}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Name")}
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label={t("Description")}
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    justifyContent: isMobile ? "center" : "flex-start",
                  }}
                >
                  <ActionButton
                    onClick={
                      editingCategory ? handleUpdateCategory : handleAddCategory
                    }
                    startIcon={<AddIcon />}
                  >
                    {editingCategory ? t("Update") : t("Add")}
                  </ActionButton>
                  {editingCategory && (
                    <Button
                      variant="outlined"
                      onClick={resetCategoryForm}
                      sx={{
                        borderRadius: 2,
                        color: "#555",
                        borderColor: "#ccc",
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                </Box>
              </SectionCard>

              <SectionCard>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("Category List")}
                </Typography>
                <List>
                  {categories.length === 0 ? (
                    <Typography sx={{ textAlign: "center", color: "#555" }}>
                      {t("No categories yet.")}
                    </Typography>
                  ) : (
                    categories.map((category) => (
                      <ListItem
                        key={category._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                        }}
                      >
                        <ListItemText
                          primary={category.name}
                          secondary={
                            category.description || t("No description")
                          }
                          sx={{ mb: isMobile ? 1 : 0 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <StyledIconButton
                            onClick={() => handleEditCategory(category)}
                          >
                            <EditIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            onClick={() => handleDeleteCategory(category._id)}
                          >
                            <DeleteIcon />
                          </StyledIconButton>
                        </Box>
                      </ListItem>
                    ))
                  )}
                </List>
              </SectionCard>
            </Box>
          )}
        </>
      )}
    </DashboardContainer>
  );
}

export default AdminDashboard;
