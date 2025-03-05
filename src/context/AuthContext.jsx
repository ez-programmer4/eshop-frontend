import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

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
      setUser({
        token,
        userId: userData._id, // Match backend _id
        name: userData.name,
        email: userData.email,
        role: userData.role,
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const login = async (email, password, googleToken = null) => {
    try {
      let response;
      if (googleToken) {
        // Google login
        localStorage.setItem("token", googleToken);
        response = await axios.get(
          "https://eshop-backend-e11f.onrender.com/api/users/profile",
          { headers: { Authorization: `Bearer ${googleToken}` } }
        );
      } else {
        // Regular login
        response = await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/login",
          { email, password }
        );
        localStorage.setItem("token", response.data.token);
      }

      const userData = response.data;
      setUser({
        token: googleToken || response.data.token,
        userId: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email, password, name, googleToken = null) => {
    try {
      let userData;
      if (googleToken) {
        // Google registration
        localStorage.setItem("token", googleToken);
        const response = await axios.get(
          "https://eshop-backend-e11f.onrender.com/api/users/profile",
          { headers: { Authorization: `Bearer ${googleToken}` } }
        );
        userData = response.data;
      } else {
        // Regular registration
        await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/register",
          { email, password, name }
        );
        const loginResponse = await axios.post(
          "https://eshop-backend-e11f.onrender.com/api/users/login",
          { email, password }
        );
        localStorage.setItem("token", loginResponse.data.token);
        userData = loginResponse.data.user;
      }

      setUser({
        token: googleToken || loginResponse.data.token,
        userId: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        referralCode: userData.referralCode,
      });
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Register failed:", error);
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
      setUser({ ...user, ...updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
