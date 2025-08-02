// CORS Middleware for handling CORS-related issues

import { validateCORSResponse, getCORSHeaders } from "./corsUtils";

export interface CORSResponse {
  success: boolean;
  data?: any;
  error?: string;
  corsHeaders?: Record<string, string>;
}

// Middleware to handle CORS errors in API responses
export const handleCORSError = (error: any): CORSResponse => {
  if (error?.status === 0) {
    // Network error - likely CORS issue
    return {
      success: false,
      error:
        "CORS Error: Unable to connect to server. Please check your network connection.",
      corsHeaders: getCORSHeaders(),
    };
  }

  if (error?.status === 403) {
    // Forbidden - possible CORS origin issue
    return {
      success: false,
      error:
        "Access Forbidden: Your origin is not allowed to access this resource.",
      corsHeaders: getCORSHeaders(),
    };
  }

  if (error?.status === 405) {
    // Method Not Allowed - CORS preflight issue
    return {
      success: false,
      error: "Method Not Allowed: The request method is not supported.",
      corsHeaders: getCORSHeaders(),
    };
  }

  return {
    success: false,
    error: error?.data?.message || "An unexpected error occurred",
    corsHeaders: getCORSHeaders(),
  };
};

// Function to wrap fetch requests with CORS handling
export const corsFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Add CORS headers to the request
    const corsOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...options.headers,
      },
      credentials: "include" as const,
    };

    const response = await fetch(url, corsOptions);

    // Check if response has proper CORS headers
    if (!validateCORSResponse(response)) {
      console.warn("Response missing CORS headers:", response.url);
    }

    return response;
  } catch (error) {
    console.error("CORS fetch error:", error);
    throw error;
  }
};

// Function to handle preflight requests
export const handlePreflightRequest = (request: Request): Response => {
  const corsHeaders = getCORSHeaders(
    request.headers.get("origin") || undefined
  );

  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Function to add CORS headers to any response
export const addCORSHeadersToResponse = (
  response: Response,
  origin?: string
): Response => {
  const corsHeaders = getCORSHeaders(origin);

  // Create new response with CORS headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...corsHeaders,
    },
  });

  return newResponse;
};

// Function to check if CORS is properly configured
export const checkCORSConfiguration = async (
  apiUrl: string
): Promise<boolean> => {
  try {
    const response = await corsFetch(`${apiUrl}/health`, {
      method: "OPTIONS",
    });

    return response.ok && validateCORSResponse(response);
  } catch (error) {
    console.error("CORS configuration check failed:", error);
    return false;
  }
};
