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

const SOCKET_URL = config.socketUrl;

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
    throw new Error("useWebSocket must be used within a WebSocketProvider");
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

  // Initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    if (!token) {
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    setConnectionStatus("connecting");

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      timeout: 60000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      dispatch(setReduxConnectionStatus("connected"));

      // Remove connection toast to reduce notifications
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      dispatch(setReduxConnectionStatus("disconnected"));

      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        socket.connect();
      }
    });

    socket.on("connect_error", (err) => {
      setConnectionStatus("error");
      setIsConnected(false);
      dispatch(setReduxConnectionStatus("error"));
      dispatch(addConnectionError(err.message));
    });

    socket.on("reconnect", (attemptNumber) => {
      setIsConnected(true);
      setConnectionStatus("connected");
      dispatch(setReduxConnectionStatus("connected"));

      toast.success(
        "Connection Restored",
        "Real-time monitoring has been reconnected"
      );
    });

    socket.on("reconnect_error", (error) => {
      setConnectionStatus("error");
      dispatch(setReduxConnectionStatus("error"));
      dispatch(addConnectionError(`Reconnection failed: ${error.message}`));
    });

    socket.on("reconnect_failed", () => {
      setConnectionStatus("error");
      setIsConnected(false);
      dispatch(setReduxConnectionStatus("error"));
      dispatch(
        addConnectionError("Reconnection failed after maximum attempts")
      );

      toast.error(
        "Connection Failed",
        "Unable to establish real-time connection. Please refresh the page."
      );
    });

    // Anomaly events
    socket.on("anomaly:new", (anomaly: any) => {
      // Normalize anomaly data
      let normalized = { ...anomaly };
      if (normalized.camera_id && typeof normalized.camera_id === "object") {
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
          // Silent error handling
        }
      });

      // Show toast notification
      toast.error(
        "🚨 New Anomaly Detected",
        `${normalized.type} at ${normalized.location} (${normalized.confidence}% confidence)`,
        10000
      );
    });

    // Camera status updates
    socket.on(
      "camera:status",
      (data: { id: string; status: "Online" | "Offline" }) => {
        dispatch(updateCameraStatus(data));
      }
    );

    // Camera operations
    socket.on("camera:added", (cameraData: any) => {
      operationService.handleCameraAdded(cameraData);
    });

    socket.on("camera:updated", (cameraData: any) => {
      operationService.handleCameraUpdated(cameraData);
    });

    socket.on("camera:deleted", (cameraId: string) => {
      operationService.handleCameraDeleted(cameraId);
    });

    // Anomaly operations
    socket.on("anomaly:updated", (anomalyData: any) => {
      operationService.handleAnomalyUpdated(anomalyData);
    });

    socket.on("anomaly:deleted", (anomalyId: string) => {
      operationService.handleAnomalyDeleted(anomalyId);
    });

    // Error handling
    socket.on("error", (error) => {
      setConnectionStatus("error");
      dispatch(setReduxConnectionStatus("error"));
      dispatch(addConnectionError(`WebSocket error: ${error.message}`));
    });

    return socket;
  }, [token]);

  // Cleanup WebSocket connection
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  // Initialize socket when token changes
  useEffect(() => {
    if (token) {
      const socket = initializeSocket();

      return () => {
        cleanupSocket();
      };
    } else {
      cleanupSocket();
    }
  }, [token, initializeSocket, cleanupSocket]);

  // Send message utility
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
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
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    initializeSocket();
  }, [initializeSocket]);

  // Auto-reconnect on network changes
  useEffect(() => {
    const handleOnline = () => {
      if (token && !socketRef.current?.connected) {
        initializeSocket();
      }
    };

    const handleOffline = () => {
      setConnectionStatus("disconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, initializeSocket]);

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
