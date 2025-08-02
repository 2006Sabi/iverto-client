import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useToast } from "@/components/ui/custom-toaster";
import type { Anomaly } from "@/types/api";
import { config } from "@/config/environment";
import {
  setConnectionStatus as setReduxConnectionStatus,
  addNewAnomaly,
  updateCameraStatus,
  addConnectionError,
} from "@/store/slices/realtimeSlice";
import OperationService from "@/services/operationService";

// In development, use the proxy URL (same as the dev server)
// The Vite dev server proxies /socket.io requests to the production server
const SOCKET_URL = config.isDevelopment
  ? `${window.location.protocol}//${window.location.host}`
  : config.socketUrl;

interface WebSocketContextType {
  isConnected: boolean;
  socket: Socket | null;
  sendMessage: (event: string, data: any) => void;
  subscribeToAnomalies: (callback: (anomaly: Anomaly) => void) => () => void;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    // Instead of throwing an error, return a safe fallback
    return {
      isConnected: false,
      socket: null,
      sendMessage: () => {}, // No-op function
      subscribeToAnomalies: () => () => {}, // No-op function
      connectionStatus: "disconnected" as const,
      reconnect: () => {}, // No-op function
    };
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const anomalyCallbacksRef = useRef<Set<(anomaly: Anomaly) => void>>(
    new Set()
  );
  const operationService = OperationService.getInstance();
  const isInitializingRef = useRef(false);

  // Initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    if (!token) {
      return null;
    }

    // Prevent multiple simultaneous initialization attempts
    if (isInitializingRef.current || socketRef.current?.connected) {
      return socketRef.current;
    }

    // Check if we're in a page refresh scenario
    const isPageRefresh = sessionStorage.getItem("was_refresh") === "true";
    if (isPageRefresh) {
      sessionStorage.removeItem("was_refresh");
      // Add a longer delay for page refresh to ensure the page is fully loaded
      setTimeout(() => {
        initializeSocket();
      }, 2000);
      return null;
    }

    isInitializingRef.current = true;

    try {
      setConnectionStatus("connecting");

      // Show connection message for Render's slower response
      toast.info(
        "Connecting to Real-time Service",
        "Please wait while we establish the connection...",
        3000
      );

      // Add a delay for Render's cold start
      setTimeout(() => {
        if (!isInitializingRef.current) return; // Check if still initializing

        console.log("Initializing WebSocket connection to:", SOCKET_URL);

        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"], // Only use WebSocket, no polling fallback
          timeout: 30000, // Reduced timeout for faster failure detection
          forceNew: true,
          reconnection: true, // Enable reconnection
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          autoConnect: true,
        });

        socketRef.current = socket;

        // Connection events
        socket.on("connect", () => {
          setIsConnected(true);
          setConnectionStatus("connected");
          dispatch(setReduxConnectionStatus("connected"));
          isInitializingRef.current = false;

          // Show success message
          toast.success(
            "Real-time Connection Established",
            "You're now connected to live monitoring services"
          );
        });

        socket.on("disconnect", (reason) => {
          setIsConnected(false);
          setConnectionStatus("disconnected");
          dispatch(setReduxConnectionStatus("disconnected"));
          isInitializingRef.current = false;

          if (reason === "io server disconnect") {
            // Server disconnected us, try to reconnect
            try {
              socket.connect();
            } catch (error) {
              console.warn(
                "Failed to reconnect after server disconnect:",
                error
              );
            }
          }
        });

        socket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err);
          setConnectionStatus("error");
          setIsConnected(false);
          dispatch(setReduxConnectionStatus("error"));
          dispatch(addConnectionError(err.message));
          isInitializingRef.current = false;

          // Only show error toast for non-timeout errors
          if (
            !err.message.includes("timeout") &&
            !err.message.includes("xhr poll error")
          ) {
            toast.error(
              "Connection Failed",
              `Unable to connect to real-time service: ${err.message}`,
              5000
            );
          }
        });

        socket.on("reconnect", (attemptNumber) => {
          console.log("WebSocket reconnected after", attemptNumber, "attempts");
          setConnectionStatus("connected");
          setIsConnected(true);
          dispatch(setReduxConnectionStatus("connected"));

          toast.success(
            "Reconnected",
            "Real-time connection has been restored"
          );
        });

        socket.on("reconnect_error", (error) => {
          console.error("WebSocket reconnection error:", error);
          setConnectionStatus("error");
          setIsConnected(false);
          dispatch(setReduxConnectionStatus("error"));

          // Don't show error toast for reconnection errors to avoid spam
          console.warn("Reconnection failed, will retry automatically");
        });

        // Anomaly events
        socket.on("anomaly:new", (anomaly: any) => {
          try {
            // Normalize anomaly data
            let normalized = { ...anomaly };
            if (
              normalized.camera_id &&
              typeof normalized.camera_id === "object"
            ) {
              normalized.camera_id =
                normalized.camera_id._id || normalized.camera_id.id;
            }
            if (
              normalized.camera &&
              typeof normalized.camera === "object" &&
              normalized.camera._id
            ) {
              normalized.camera_id = normalized.camera._id;
              delete normalized.camera;
            }
            if (!normalized._id || !normalized.camera_id || !normalized.type) {
              return;
            }
            if (typeof normalized.camera_id !== "string") {
              normalized.camera_id = String(normalized.camera_id);
            }

            // Update Redux store via operation service
            operationService.handleAnomalyAdded(normalized);

            // Also dispatch to realtime slice for backward compatibility
            dispatch(addNewAnomaly(normalized));

            // Notify all subscribers
            anomalyCallbacksRef.current.forEach((callback) => {
              try {
                callback(normalized);
              } catch (error) {
                console.warn("Error in anomaly callback:", error);
              }
            });

            // Show toast notification
            toast.error(
              "🚨 New Anomaly Detected",
              `${normalized.type} at ${normalized.location} (${normalized.confidence}% confidence)`,
              10000
            );
          } catch (error) {
            console.warn("Error processing anomaly:", error);
          }
        });

        // Camera status updates
        socket.on(
          "camera:status",
          (data: { id: string; status: "Online" | "Offline" }) => {
            try {
              dispatch(updateCameraStatus(data));
            } catch (error) {
              console.warn("Error updating camera status:", error);
            }
          }
        );

        // Camera operations
        socket.on("camera:added", (cameraData: any) => {
          try {
            operationService.handleCameraAdded(cameraData);
          } catch (error) {
            console.warn("Error handling camera added:", error);
          }
        });

        socket.on("camera:updated", (cameraData: any) => {
          try {
            operationService.handleCameraUpdated(cameraData);
          } catch (error) {
            console.warn("Error handling camera updated:", error);
          }
        });

        socket.on("camera:deleted", (cameraId: string) => {
          try {
            operationService.handleCameraDeleted(cameraId);
          } catch (error) {
            console.warn("Error handling camera deleted:", error);
          }
        });

        // Anomaly operations
        socket.on("anomaly:updated", (anomalyData: any) => {
          try {
            operationService.handleAnomalyUpdated(anomalyData);
          } catch (error) {
            console.warn("Error handling anomaly updated:", error);
          }
        });

        socket.on("anomaly:deleted", (anomalyId: string) => {
          try {
            operationService.handleAnomalyDeleted(anomalyId);
          } catch (error) {
            console.warn("Error handling anomaly deleted:", error);
          }
        });

        // Error handling
        socket.on("error", (error) => {
          setConnectionStatus("error");
          dispatch(setReduxConnectionStatus("error"));
          dispatch(addConnectionError(`WebSocket error: ${error.message}`));
        });
      }, 2000); // 2 second delay for Render's cold start

      return socketRef.current;
    } catch (error) {
      console.warn("Failed to initialize WebSocket:", error);
      setConnectionStatus("error");
      setIsConnected(false);
      dispatch(setReduxConnectionStatus("error"));
      isInitializingRef.current = false;
      return null;
    }
  }, [token, dispatch, toast, operationService]);

  // Cleanup WebSocket connection
  const cleanupSocket = useCallback(() => {
    try {
      isInitializingRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setConnectionStatus("disconnected");
    } catch (error) {
      console.warn("Error during socket cleanup:", error);
    }
  }, []);

  // Initialize socket when token changes - only depend on token
  useEffect(() => {
    if (token) {
      // Add a small delay to ensure the page is fully loaded before connecting
      const timer = setTimeout(() => {
        initializeSocket();
      }, 100);

      return () => {
        clearTimeout(timer);
        cleanupSocket();
      };
    } else {
      cleanupSocket();
    }

    // Cleanup on unmount or token change
    return () => {
      cleanupSocket();
    };
  }, [token]); // Only depend on token, not the functions

  // Send message utility
  const sendMessage = useCallback((event: string, data: any) => {
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    } catch (error) {
      console.warn("Error sending WebSocket message:", error);
    }
  }, []);

  // Subscribe to anomalies
  const subscribeToAnomalies = useCallback(
    (callback: (anomaly: Anomaly) => void) => {
      anomalyCallbacksRef.current.add(callback);

      // Return unsubscribe function
      return () => {
        anomalyCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  // Manual reconnect function
  const reconnect = useCallback(() => {
    try {
      cleanupSocket();
      // Longer delay for Render's cold start
      setTimeout(() => {
        initializeSocket();
      }, 3000); // Increased from 100ms to 3 seconds
    } catch (error) {
      console.warn("Error during manual reconnect:", error);
    }
  }, [cleanupSocket, initializeSocket]);

  const value: WebSocketContextType = {
    isConnected,
    socket: socketRef.current,
    sendMessage,
    subscribeToAnomalies,
    connectionStatus,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
