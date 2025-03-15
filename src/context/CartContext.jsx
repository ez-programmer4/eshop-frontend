import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setLoading(false);
        return;
      }
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let items = response.data.items || [];

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
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, bundleData = null) => {
    setLoading(true); // Set loading when adding to cart
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/cart/add",
        { productId, bundle: bundleData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart(); // Refetch cart to ensure updated data
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
    // Loading is set to false in fetchCart's finally block
  };

  const removeFromCart = async (cartItemId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://eshop-backend-e11f.onrender.com/api/cart/remove/${cartItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://eshop-backend-e11f.onrender.com/api/cart/update`,
        { cartItemId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
