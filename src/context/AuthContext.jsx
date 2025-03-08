import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode"; // Add this dependency

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/users/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const userData = response.data;
      const decodedToken = jwtDecode(token); // Decode JWT to get id
      setUser({
        token,
        id: decodedToken.id || userData._id, // Use id from JWT or _id from response
        name: userData.name || "User", // Fallback if name is missing
        email: userData.email,
        role: userData.role || "user", // Default to "user" if missing
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        error.response?.data || error.message
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const login = async (email, password, googleToken = null) => {
    try {
      let response;
      if (googleToken) {
        localStorage.setItem("token", googleToken);
        response = await axios.get(
          "https://eshop-backend-e11f.onrender.com/api/users/profile",
          { headers: { Authorization: `Bearer ${googleToken}` } }
        );
      } else {
        response = await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/login",
          { email, password }
        );
        localStorage.setItem("token", response.data.token);
      }

      const userData = response.data.user || response.data; // Handle nested user object
      const token = googleToken || response.data.token;
      const decodedToken = jwtDecode(token);
      setUser({
        token,
        id: decodedToken.id || userData._id,
        name: userData.name || "User",
        email: userData.email,
        role: userData.role || "user",
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email, password, name, googleToken = null) => {
    try {
      let userData;
      let token;
      if (googleToken) {
        localStorage.setItem("token", googleToken);
        const response = await axios.get(
          "https://eshop-backend-e11f.onrender.com/api/users/profile",
          { headers: { Authorization: `Bearer ${googleToken}` } }
        );
        userData = response.data;
        token = googleToken;
      } else {
        await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/register",
          { email, password, name }
        );
        const loginResponse = await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/login",
          { email, password }
        );
        userData = loginResponse.data.user || loginResponse.data;
        token = loginResponse.data.token;
      }

      const decodedToken = jwtDecode(token);
      setUser({
        token,
        id: decodedToken.id || userData._id,
        name: userData.name || name || "User",
        email: userData.email || email,
        role: userData.role || "user",
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Register failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = async (data) => {
    try {
      const response = await axios.put(
        "https://eshop-backend-e11f.onrender.com/api/users/profile",
        data,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedUser = response.data;
      setUser({
        ...user,
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        role: updatedUser.role || user.role,
        referralCode: updatedUser.referralCode || user.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error(
        "Update user failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
