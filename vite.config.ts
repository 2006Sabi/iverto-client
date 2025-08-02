import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://iverto.onrender.com",
        "https://iverto-ai.vercel.app",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
    },
    proxy: {
      // Proxy API requests to bypass CORS in development
      "/api": {
        target: "https://iverto.onrender.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Add CORS headers to proxied requests
            proxyReq.setHeader("Access-Control-Allow-Origin", "*");
            proxyReq.setHeader(
              "Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS"
            );
            proxyReq.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization, X-Requested-With, Accept, Origin"
            );
          });
        },
      },
      // Proxy WebSocket connections
      "/socket.io": {
        target: "https://iverto.onrender.com",
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Add CORS headers to WebSocket proxy
            proxyReq.setHeader("Access-Control-Allow-Origin", "*");
            proxyReq.setHeader(
              "Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS"
            );
            proxyReq.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization, X-Requested-With, Accept, Origin"
            );
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
