import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.WORKER_URL": JSON.stringify(env.WORKER_URL),
      "process.env.CLOUDFLARE_API_KEY": JSON.stringify(env.CLOUDFLARE_API_KEY),
      "process.env.CLOUDFLARE_ACCOUNT_ID": JSON.stringify(
        env.CLOUDFLARE_ACOOUNT_ID,
      ),
      "process.env.DEEPSEEK_API_KEY": JSON.stringify(env.DEEPSEEK_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
