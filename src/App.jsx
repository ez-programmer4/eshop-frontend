import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ThemeContextProvider from "./context/ThemeContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import ProductDetail from "./components/ProductDetail.jsx";
import Cart from "./components/Cart.jsx";
import OrderHistory from "./components/OrderHistory.jsx";
import SupportForm from "./components/SupportForm.jsx";
import Wishlist from "./components/Wishlist.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import UserProfile from "./components/UserProfile.jsx";
import OrderDetail from "./components/OrderDetail.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";
import Categories from "./pages/Categories.jsx";
import Products from "./pages/Products.jsx";
import { Container } from "@mui/material";
import "./App.css";

function App() {
  return (
    <Router>
      <ThemeContextProvider>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google" element={<GoogleAuthCallback />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/my-orders" element={<OrderHistory />} />
            <Route path="/support" element={<SupportForm />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </Container>
      </ThemeContextProvider>
    </Router>
  );
}

export default App;
