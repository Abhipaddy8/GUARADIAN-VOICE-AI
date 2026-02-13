import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: { host: "21.0.0.42" },
    proxy: {
      "/api": "http://localhost:4001"
    }
  }
});
