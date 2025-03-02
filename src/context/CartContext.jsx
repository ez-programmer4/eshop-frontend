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

  const fetchProduct = async (id) => {
    console.log("fetchProduct called with ID:", id); // Debug
    if (!id || id === "undefined") {
      console.error("fetchProduct received invalid ID:", id);
      return null;
    }
    try {
      const response = await axios.get(
        `https://ethioshop-820b.onrender.com/api/products/${id}`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(`Product ${id} not found`);
        return null;
      }
      throw error;
    }
  };

  const addToCart = async (productId) => {
    console.log("addToCart called with productId:", productId); // Debug
    try {
      const product = await fetchProduct(productId);
      if (!product) {
        console.warn(`Product ${productId} not found, skipping add to cart`);
        alert("This product is no longer available.");
        return;
      }

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
      alert("Failed to add item to cart. Please try again.");
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
