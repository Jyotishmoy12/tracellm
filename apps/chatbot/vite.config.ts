import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  plugins: [react()],
  build: {
    outDir: "dist-web",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:4320",
      "/health": "http://localhost:4320"
    }
  }
});
