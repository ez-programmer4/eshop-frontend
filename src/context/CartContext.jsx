// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateCartStorage = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = async (productId, bundle = null) => {
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/products/${productId}`
      );
      const product = response.data;

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.productId === productId
        );
        let newCart;
        if (existingItem) {
          newCart = prevCart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newCart = [
            ...prevCart,
            {
              productId,
              product,
              quantity: 1,
              bundle: bundle || null, // Add bundle metadata
            },
          ];
        }
        updateCartStorage(newCart);
        return newCart;
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    updateCartStorage(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    updateCartStorage(newCart);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
