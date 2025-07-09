import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

        // Initialize data (loads from cache or API)
        await dataInitializer.initialize();

        // Ensure cameras are loaded on refresh
        const isRefresh = sessionStorage.getItem("was_refresh") === "true";
        if (isRefresh) {
          sessionStorage.removeItem("was_refresh");
          // Force refresh cameras data on page refresh
          await dataInitializer.refreshCamerasData();
        }

        setIsDataLoaded(true);

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

  // Show loading state while data is being initialized
  if (!isDataLoaded && !dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Application
          </h2>
          <p className="text-gray-500">
            Initializing data and connecting to real-time services...
          </p>
        </div>
      </div>
    );
  }

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

// External dashboard redirect component
const ExternalDashboardRedirect = () => {
  useEffect(() => {
    window.location.replace("https://cerulean-hotteok-d35763.netlify.app/");
  }, []);
  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppInitializer>
          <WebSocketProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
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
                        <ExternalDashboardRedirect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ExternalDashboardRedirect />
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
            </TooltipProvider>
          </WebSocketProvider>
        </AppInitializer>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
