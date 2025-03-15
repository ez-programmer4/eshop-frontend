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
      if (!token) {
        setCart([]);
        return;
      }
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let items = response.data.items || [];

      // If productId is a string, fetch product details
      if (items.length > 0 && typeof items[0].productId === "string") {
        const productIds = items.map((item) => item.productId);
        const productPromises = productIds.map((id) =>
          axios.get(
            `https://eshop-backend-e11f.onrender.com/api/products/${id}`
          )
        );
        const productResponses = await Promise.all(productPromises);
        const productsMap = new Map(
          productResponses.map((res) => [res.data._id, res.data])
        );
        items = items.map((item) => ({
          ...item,
          productId: productsMap.get(item.productId) || { _id: item.productId },
        }));
      }

      setCart(items);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart([]);
    }
  };

  const addToCart = async (productId, bundleData = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to add items to your cart");
      }
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
      alert(error.message || "Failed to add to cart. Please try again.");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to modify your cart");
      }
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/cart/remove/${cartItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart((prevCart) => prevCart.filter((item) => item._id !== cartItemId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      alert(error.message || "Failed to remove from cart. Please try again.");
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to modify your cart");
      }
      await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/cart/update/${cartItemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert(error.message || "Failed to update quantity. Please try again.");
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
