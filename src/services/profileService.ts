import { config } from "@/config/environment";

// Fallback profile data for development/testing
const fallbackProfile = {
  _id: "fallback-user-id",
  name: "Demo User",
  email: "demo@example.com",
  role: "admin",
  avatar: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getProfile() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      // Return null instead of throwing error when no token is found
      console.warn("No authentication token found - user may not be logged in");
      return null;
    }

    const response = await fetch(`${config.apiUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies if needed
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem("token");
        throw new Error("Unauthorized - Please login again");
      }
      if (response.status === 403) {
        throw new Error("Forbidden - Access denied");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Profile fetch error:", error);

    // Handle CORS errors specifically
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.warn("CORS or network error detected, using fallback profile");

      // In development, return fallback data
      if (config.isDevelopment) {
        return fallbackProfile;
      }

      throw new Error(
        "Network error - Please check your connection or try again later"
      );
    }

    throw error;
  }
}
