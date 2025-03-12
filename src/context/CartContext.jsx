import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/cart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const addToCart = async (productId, bundleData = null) => {
    try {
      const token = localStorage.getItem("token");
      const payload = bundleData
        ? { productId, quantity: 1, bundle: bundleData }
        : { productId, quantity: 1 };
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/cart/add",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newItem = response.data.item;
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (item) =>
            item.productId === productId &&
            (bundleData
              ? item.bundle?.bundleId === bundleData.bundleId
              : !item.bundle)
        );
        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += 1;
          return updatedCart;
        }
        return [...prevCart, newItem];
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/cart/remove/${cartItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart((prevCart) => prevCart.filter((item) => item._id !== cartItemId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/cart/update/${cartItemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } } // Fixed syntax here
      );
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
