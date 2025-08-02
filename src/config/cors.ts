// CORS Configuration for different environments

import { CORSConfig } from "@/utils/corsUtils";

// Development CORS configuration
export const developmentCORSConfig: CORSConfig = {
  origin: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://localhost:5173", // Vite default port
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-API-Key",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With", "X-Total-Count"],
  maxAge: 86400,
};

// Production CORS configuration
export const productionCORSConfig: CORSConfig = {
  origin: [
    "https://iverto.onrender.com",
    "https://iverto-ai.vercel.app",
    "https://iverto.com",
    "https://www.iverto.com",
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
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400,
};

// Staging CORS configuration
export const stagingCORSConfig: CORSConfig = {
  origin: [
    "https://staging.iverto.onrender.com",
    "https://staging.iverto-ai.vercel.app",
    "https://iverto-staging.vercel.app",
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
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400,
};

// Get CORS configuration based on environment
export const getCORSConfig = (): CORSConfig => {
  const env = import.meta.env.MODE;

  switch (env) {
    case "development":
      return developmentCORSConfig;
    case "staging":
      return stagingCORSConfig;
    case "production":
      return productionCORSConfig;
    default:
      return developmentCORSConfig;
  }
};

// CORS validation functions
export const validateCORSOrigin = (origin: string): boolean => {
  const config = getCORSConfig();
  const allowedOrigins = Array.isArray(config.origin)
    ? config.origin
    : [config.origin];

  return allowedOrigins.includes(origin) || allowedOrigins.includes("*");
};

export const validateCORSMethod = (method: string): boolean => {
  const config = getCORSConfig();
  return config.methods.includes(method.toUpperCase());
};

export const validateCORSHeader = (header: string): boolean => {
  const config = getCORSConfig();
  return config.allowedHeaders.includes(header);
};

// CORS debugging utilities
export const logCORSInfo = () => {
  if (import.meta.env.DEV) {
    const config = getCORSConfig();
    console.log("CORS Configuration:", {
      environment: import.meta.env.MODE,
      origins: config.origin,
      methods: config.methods,
      credentials: config.credentials,
    });
  }
};

// Initialize CORS logging in development
if (import.meta.env.DEV) {
  logCORSInfo();
}
