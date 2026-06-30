import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const basePath = env.VITE_BASE_PATH || "/";

  return {
    plugins: [react()],
    base: mode === "production" ? basePath : "/",
    server: {
      port: 5173,
      proxy: {
        "/socket.io": {
          target: "http://localhost:3001",
          ws: true,
        },
      },
    },
  };
});
