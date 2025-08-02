// CORS Utility Functions

export interface CORSConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

// Default CORS configuration
export const defaultCORSConfig: CORSConfig = {
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
    "Cache-Control",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

// Function to check if origin is allowed
export const isOriginAllowed = (origin: string): boolean => {
  const allowedOrigins = Array.isArray(defaultCORSConfig.origin)
    ? defaultCORSConfig.origin
    : [defaultCORSConfig.origin];

  return allowedOrigins.includes(origin) || allowedOrigins.includes("*");
};

// Function to get CORS headers for a request
export const getCORSHeaders = (origin?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": defaultCORSConfig.methods.join(", "),
    "Access-Control-Allow-Headers": defaultCORSConfig.allowedHeaders.join(", "),
    "Access-Control-Allow-Credentials":
      defaultCORSConfig.credentials.toString(),
  };

  if (defaultCORSConfig.exposedHeaders) {
    headers["Access-Control-Expose-Headers"] =
      defaultCORSConfig.exposedHeaders.join(", ");
  }

  if (defaultCORSConfig.maxAge) {
    headers["Access-Control-Max-Age"] = defaultCORSConfig.maxAge.toString();
  }

  // Set origin header
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
};

// Function to handle preflight requests
export const handlePreflight = (origin?: string) => {
  const headers = getCORSHeaders(origin);
  return {
    status: 200,
    headers,
    body: "",
  };
};

// Function to add CORS headers to fetch requests
export const addCORSHeadersToRequest = (
  init: RequestInit = {}
): RequestInit => {
  const headers = new Headers(init.headers);

  // Add CORS-related headers
  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  if (typeof window !== "undefined") {
    headers.set("Origin", window.location.origin);
  }

  return {
    ...init,
    headers,
    credentials: "include",
  };
};

// Function to validate CORS response
export const validateCORSResponse = (response: Response): boolean => {
  const corsHeaders = [
    "access-control-allow-origin",
    "access-control-allow-methods",
    "access-control-allow-headers",
  ];

  return corsHeaders.some((header) => response.headers.has(header));
};
