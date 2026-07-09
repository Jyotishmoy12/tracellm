import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET ?? env.VITE_API_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    ...(proxyTarget
      ? {
          server: {
            proxy: {
              "/v1": proxyTarget,
              "/health": proxyTarget,
              "/openapi.json": proxyTarget
            }
          }
        }
      : {})
  };
});
