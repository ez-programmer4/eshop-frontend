import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Assuming user contains token

  const fetchNotifications = async () => {
    if (!user || !user.token) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // Include token
          },
        }
      );
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]); // Re-fetch if user changes

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, error, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
