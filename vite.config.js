import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://eshop-backend-e11f.onrender.com", // Ensure this matches your backend port
    },
  },
});
