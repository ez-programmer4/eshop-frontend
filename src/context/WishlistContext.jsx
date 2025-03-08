import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user._id) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user || !user._id) return;
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/wishlist/${user._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const wishlistItems = response.data.items || response.data || [];
      const enrichedWishlist = await Promise.all(
        wishlistItems
          .filter((item) => item.productId || item._id) // Handle both formats
          .map(async (item) => {
            const productId = item.productId || item._id;
            try {
              const productResponse = await axios.get(
                `https://eshop-backend-e11f.onrender.com/api/products/${productId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
              return { _id: productId, ...productResponse.data };
            } catch (error) {
              console.error(`Failed to fetch product ${productId}:`, error);
              return { _id: productId, name: "Unknown Product", price: "N/A" };
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
    if (!user || !user._id) {
      console.error("User not logged in");
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
        `https://eshop-backend-e11f.onrender.com/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const newItem = { _id: productId, ...productResponse.data };
      setWishlist((prev) => [...prev, newItem]); // Optimistic update
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/wishlist",
        { userId: user._id, productId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Sync with backend response if it returns the full wishlist
      if (response.data.items) {
        setWishlist(
          response.data.items.map((item) => ({
            _id: item.productId,
            ...item,
          }))
        );
      }
    } catch (error) {
      console.error(
        "Failed to add to wishlist:",
        error.response?.data || error.message
      );
      setWishlist((prev) => prev.filter((item) => item._id !== productId)); // Rollback
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !user._id) {
      console.error("User not logged in");
      return;
    }
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      return;
    }
    setWishlist((prev) => prev.filter((item) => item._id !== productId)); // Optimistic update
    try {
      const response = await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/wishlist/${user._id}/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Sync with backend response if it returns the updated wishlist
      if (response.data.items) {
        setWishlist(
          response.data.items.map((item) => ({
            _id: item.productId,
            ...item,
          }))
        );
      }
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
