import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensures assets load from root (e.g., /assets/...)
  server: {
    proxy: {
      "/api": "https://eshop-backend-e11f.onrender.com", // Dev proxy
    },
  },
});
