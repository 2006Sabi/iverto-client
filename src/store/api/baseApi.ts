import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import { config } from "@/config/environment";
import { addCORSHeadersToRequest } from "@/utils/corsUtils";
import { handleCORSError } from "@/utils/corsMiddleware";

const baseQuery = fetchBaseQuery({
  baseUrl: config.apiUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // Set CORS headers using utility function
    const corsHeaders = addCORSHeadersToRequest().headers as Headers;
    corsHeaders.forEach((value, key) => {
      headers.set(key, value);
    });

    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized
  if (result?.error?.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult?.data && (refreshResult.data as any).success) {
      // Store the new token
      api.dispatch({
        type: "auth/setCredentials",
        payload: (refreshResult.data as any).data,
      });

      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: "auth/logout" });
    }
  }

  // Handle CORS errors
  if (
    result?.error?.status === 0 ||
    result?.error?.status === 403 ||
    result?.error?.status === 405
  ) {
    const corsError = handleCORSError(result.error);
    console.warn(`CORS error for ${args.url}:`, corsError);
    return {
      error: {
        status: result.error.status,
        data: { message: corsError.error },
      },
    };
  }

  // Handle 500 Internal Server Error - log but don't break the app
  if (result?.error?.status === 500) {
    console.warn(`Server error for ${args.url}:`, result.error);
    // Return a structured error that components can handle gracefully
    return {
      error: {
        status: 500,
        data: { message: "Server temporarily unavailable" },
      },
    };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Camera", "Anomaly", "Dashboard", "AnomalyEntities"],
  endpoints: () => ({}),
  keepUnusedDataFor: 600, // Keep data for 10 minutes (increased from 5)
  refetchOnMountOrArgChange: 60, // Refetch if data is older than 60 seconds (increased from 30)
  refetchOnFocus: false, // Disable refetch on focus to reduce unnecessary requests
  refetchOnReconnect: true,
});
