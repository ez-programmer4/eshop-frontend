import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      setUser({
        token,
        userId: storedUser.id, // Align with backend 'id'
        name: storedUser.name,
        email: storedUser.email,
        role: storedUser.role,
        referralCode: storedUser.referralCode,
      });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://eshop-backend-e11f.onrender.com/api/users/login",
        {
          email,
          password,
        }
      );
      const userData = response.data.user; // Extract user object
      setUser({
        token: response.data.token,
        userId: userData.id, // Use 'id' from backend
        name: userData.name,
        email: userData.email,
        role: userData.role,
        referralCode: userData.referralCode,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData)); // Store full user object
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      await axios.post("/api/users/register", { email, password, name });
      await login(email, password);
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
      const response = await axios.put("/api/users/profile", data, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
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
