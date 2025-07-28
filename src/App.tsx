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
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Cameras from "./pages/Cameras";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { GlobalAnomalyNotifier } from "@/components/GlobalAnomalyNotifier";
import PendingRegistration from "./components/PendingRegistration";
import RegisterApprovalPendingPage from "./pages/RegisterApprovalPendingPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import { LocalIpProvider } from "@/contexts/LocalIpContext";

// Simple Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

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

  return <div onError={() => setHasError(true)}>{children}</div>;
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
            setDataError(
              error instanceof Error
                ? error.message
                : "Failed to initialize app"
            );
          });

        // Ensure cameras are loaded on refresh
        const isRefresh = sessionStorage.getItem("was_refresh") === "true";
        if (isRefresh) {
          sessionStorage.removeItem("was_refresh");
          // Force refresh cameras data on page refresh
          dataInitializer.refreshCamerasData().catch(console.error);
        }

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
        setDataError(
          error instanceof Error ? error.message : "Failed to initialize app"
        );
      }
    };

    initializeApp();
  }, []);

  // Show error state if initialization failed
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
                <LocalIpProvider>
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

                      {/* Protected routes - temporarily bypassed */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/cameras"
                        element={
                          <ProtectedRoute>
                            <Cameras />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/alerts"
                        element={
                          <ProtectedRoute>
                            <Alerts />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </LocalIpProvider>
              </TooltipProvider>
            </WebSocketProvider>
          </AppInitializer>
        </CustomToastProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
