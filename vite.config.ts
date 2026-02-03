/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    server: {
      host: "::",
      port: 5173,
    },
    plugins: [
      react(),      
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // 프로덕션: hidden 소스맵 (Sentry 업로드용, 브라우저 노출 안됨)
      sourcemap: isProduction ? "hidden" : false,
    },
    test: {
      globals: true,
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    },
  };
});
