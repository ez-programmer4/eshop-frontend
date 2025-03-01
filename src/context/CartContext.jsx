import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (productId) => {
    try {
      const response = await axios.get(`/api/products/${productId}`);
      const product = response.data;
      setCart((prevCart) => {
        const updatedCart = [...prevCart];
        const existingItem = updatedCart.find(
          (item) => item.productId === product._id
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedCart.push({ productId: product._id, product, quantity: 1 });
        }

        return updatedCart;
      });
    } catch (error) {
      console.error(
        "Failed to add to cart:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
