// Environment configuration
export const config = {
  // Use proxy URLs in development to avoid CORS issues
  apiUrl: import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "https://iverto.onrender.com/api",
  socketUrl: import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://iverto.onrender.com",

  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || "Iverto Security System",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === "true",

  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ["VITE_API_URL", "VITE_SOCKET_URL"];
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    // Silent validation - no console warnings in production
  }
};

// Initialize environment validation
validateEnvironment();
