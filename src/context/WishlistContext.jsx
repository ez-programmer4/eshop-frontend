// src/context/WishlistContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { useTranslation } from "react-i18next";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/wishlist/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const wishlistItems = response.data.items || [];
      const enrichedWishlist = await Promise.all(
        wishlistItems
          .filter((item) => item.productId) // Filter out invalid items
          .map(async (item) => {
            try {
              const productResponse = await axios.get(
                `http://localhost:5000/api/products/${item.productId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
              return { _id: item.productId, ...productResponse.data };
            } catch (error) {
              console.error(
                `Failed to fetch product ${item.productId}:`,
                error
              );
              return {
                _id: item.productId,
                name: t("Unknown Product"),
                price: "N/A",
              };
            }
          })
      );
      setWishlist(enrichedWishlist);
    } catch (error) {
      console.error(
        "Failed to fetch wishlist:",
        error.response?.data || error.message
      );
      setWishlist([]);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      alert(t("Please log in to add items to wishlist"));
      return;
    }
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      return;
    }
    if (wishlist.some((item) => item._id === productId)) {
      return; // Already in wishlist
    }
    try {
      const productResponse = await axios.get(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const newItem = { _id: productId, ...productResponse.data };
      setWishlist((prev) => [...prev, newItem]); // Optimistic update
      await axios.post(
        "http://localhost:5000/api/wishlist",
        { userId: user.userId, productId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      console.error(
        "Failed to add to wishlist:",
        error.response?.data || error.message
      );
      setWishlist((prev) => prev.filter((item) => item._id !== productId)); // Rollback on error
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      return;
    }
    const updatedWishlist = wishlist.filter((item) => item._id !== productId);
    setWishlist(updatedWishlist); // Optimistic update
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (error) {
      console.error(
        "Failed to remove from wishlist:",
        error.response?.data || error.message
      );
      fetchWishlist(); // Re-sync on error
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
