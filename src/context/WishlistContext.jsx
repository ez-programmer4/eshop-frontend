import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user || !user.id) return;
    try {
      const response = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/wishlist/${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const wishlistItems = response.data.items || response.data || [];
      console.log("Wishlist items from backend:", wishlistItems); // Debug log
      const enrichedWishlist = await Promise.all(
        wishlistItems
          .filter((item) => item.productId || item._id)
          .map(async (item) => {
            const productId = item.productId || item._id;
            try {
              const productResponse = await axios.get(
                `https://eshop-backend-e11f.onrender.com/api/products/${productId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
              );
              return { _id: productId, ...productResponse.data };
            } catch (error) {
              console.error(
                `Failed to fetch product ${productId}:`,
                error.response?.data || error.message
              );
              return {
                _id: productId,
                name: "Product Not Found",
                price: "N/A",
                unavailable: true,
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
    if (!user || !user.id) {
      console.error("User not logged in");
      return;
    }
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      return;
    }
    if (wishlist.some((item) => item._id === productId)) {
      return;
    }
    try {
      const productResponse = await axios.get(
        `https://eshop-backend-e11f.onrender.com/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const newItem = { _id: productId, ...productResponse.data };
      setWishlist((prev) => [...prev, newItem]);
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/wishlist",
        { userId: user.id, productId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
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
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !user.id) {
      console.error("User not logged in");
      return;
    }
    if (!productId || typeof productId !== "string") {
      console.error("Invalid productId:", productId);
      return;
    }
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
    try {
      const response = await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/wishlist/${user.id}/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
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
      fetchWishlist();
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
