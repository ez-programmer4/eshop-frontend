// src/context/ThemeContext.jsx
import React, { createContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#3498db" },
                secondary: { main: "#e74c3c" },
                background: { default: "#f0f4f8", paper: "#ffffff" }, // Light mode background
                text: { primary: "#2c3e50", secondary: "#7f8c8d" },
              }
            : {
                primary: { main: "#5dade2" },
                secondary: { main: "#e74c3c" },
                background: { default: "#1a2533", paper: "#2c3e50" }, // Dark mode background
                text: { primary: "#e0e6ed", secondary: "#a1b1c2" },
              }),
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#3498db" : "#2c3e50",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#ffffff" : "#34495e",
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Set body background dynamically
  useEffect(() => {
    document.body.style.background =
      mode === "light"
        ? "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)" // Match ProductDetail light theme
        : "#1a2533"; // Match dark mode background.default
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
