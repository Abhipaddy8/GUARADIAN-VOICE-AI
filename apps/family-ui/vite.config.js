import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    hmr: { host: "localhost" },
    proxy: {
      "/api": "http://localhost:4001"
    }
  }
});
