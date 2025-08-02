import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomToastProvider } from "@/components/ui/custom-toaster";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { initializeAuth } from "./store/slices/authSlice";
import { setOnlineStatus } from "./store/slices/uiSlice";
import { AuthGuard } from "@/components/AuthGuard";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { dataInitializer } from "@/services/dataInitializer";
import Index from "./pages/Index";

import Dashboard from "./pages/Dashboard";
import Cameras from "./pages/Cameras";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { GlobalAnomalyNotifier } from "@/components/GlobalAnomalyNotifier";
import RegisterApprovalPendingPage from "./pages/RegisterApprovalPendingPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import { LocalIpProvider } from "@/contexts/LocalIpContext";

// Improved Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Don't catch WebSocket-related errors
      if (
        event.error?.message?.includes("WebSocket") ||
        event.error?.message?.includes("socket") ||
        event.error?.message?.includes("connection") ||
        event.filename?.includes("socket") ||
        event.filename?.includes("websocket")
      ) {
        console.warn(
          "WebSocket error caught by error boundary, ignoring:",
          event.error
        );
        return;
      }

      // Don't catch network-related errors
      if (
        event.error?.message?.includes("Network") ||
        event.error?.message?.includes("fetch") ||
        event.error?.message?.includes("timeout")
      ) {
        console.warn(
          "Network error caught by error boundary, ignoring:",
          event.error
        );
        return;
      }

      console.error("Unhandled error caught by error boundary:", event.error);
      setError(event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Don't catch WebSocket-related promise rejections
      if (
        event.reason?.message?.includes("WebSocket") ||
        event.reason?.message?.includes("socket") ||
        event.reason?.message?.includes("connection")
      ) {
        console.warn(
          "WebSocket promise rejection caught by error boundary, ignoring:",
          event.reason
        );
        return;
      }

      console.error(
        "Unhandled promise rejection caught by error boundary:",
        event.reason
      );
      setError(event.reason);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            Please check the console for more details
          </p>
          {error && (
            <details className="text-left mb-4 p-4 bg-gray-100 rounded">
              <summary className="cursor-pointer font-medium">
                Error Details
              </summary>
              <pre className="text-sm text-red-600 mt-2 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Component to handle app initialization
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth state from localStorage
        store.dispatch(initializeAuth());

        // Initialize data in background without blocking UI
        dataInitializer
          .initialize()
          .then(() => {
            setIsDataLoaded(true);
          })
          .catch((error) => {
            console.warn(
              "Data initialization failed, but app will continue:",
              error
            );
            // Don't set error state for data initialization failures
            // The app should continue to work with cached data
            setIsDataLoaded(true);
          });

        // Set refresh flag for WebSocket connection handling
        const isRefresh = sessionStorage.getItem("was_refresh") === "true";
        if (isRefresh) {
          sessionStorage.removeItem("was_refresh");
          // Force refresh cameras data on page refresh
          dataInitializer.refreshCamerasData().catch((error) => {
            console.warn("Failed to refresh cameras data:", error);
          });
        }

        // Set up page refresh detection
        const handleBeforeUnload = () => {
          sessionStorage.setItem("was_refresh", "true");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };

        // Handle online/offline status
        const handleOnline = () => {
          store.dispatch(setOnlineStatus(true));
        };

        const handleOffline = () => {
          store.dispatch(setOnlineStatus(false));
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        };
      } catch (error) {
        console.error("Critical app initialization error:", error);
        setDataError(
          error instanceof Error ? error.message : "Failed to initialize app"
        );
      }
    };

    initializeApp();
  }, []);

  // Show error state only for critical initialization failures
  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Initialization Failed
          </h1>
          <p className="text-gray-600 mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Protected Route Component - Re-enabling authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <AuthGuard>{children}</AuthGuard>;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <CustomToastProvider>
          <AppInitializer>
            <WebSocketProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <GlobalAnomalyNotifier />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/pending-registration"
                      element={<RegisterApprovalPendingPage />}
                    />
                    <Route
                      path="/otp-verification"
                      element={<OtpVerificationPage />}
                    />

                    {/* Protected routes with LocalIpProvider */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <LocalIpProvider>
                            <Dashboard />
                          </LocalIpProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <LocalIpProvider>
                            <Dashboard />
                          </LocalIpProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cameras"
                      element={
                        <ProtectedRoute>
                          <LocalIpProvider>
                            <Cameras />
                          </LocalIpProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <LocalIpProvider>
                            <Profile />
                          </LocalIpProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/alerts"
                      element={
                        <ProtectedRoute>
                          <LocalIpProvider>
                            <Alerts />
                          </LocalIpProvider>
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all route - redirect to dashboard */}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </WebSocketProvider>
          </AppInitializer>
        </CustomToastProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
