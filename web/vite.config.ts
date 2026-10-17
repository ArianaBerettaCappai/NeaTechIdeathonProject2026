import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, las llamadas a la API van al backend Express (App/, puerto 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:3000",
      "/api": "http://localhost:3000",
      "/health": "http://localhost:3000",
    },
  },
});
