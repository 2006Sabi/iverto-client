import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAppDispatch } from "@/store/hooks";
import { useToast } from "@/components/ui/custom-toaster";
import type { Anomaly } from "@/types/api";
import { useNavigate } from "react-router-dom";

export const GlobalAnomalyNotifier = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { subscribeToAnomalies, isConnected } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    // Only subscribe if WebSocket is connected
    if (!isConnected) {
      return;
    }

    try {
      const unsubscribe = subscribeToAnomalies((anomaly: Anomaly) => {
        try {
          // Show custom toast notification
          toast.warning(
            `🚨 ${anomaly.type} Detected`,
            `${anomaly.type} at ${anomaly.location} (${anomaly.confidence}%)`
          );
          navigate("/alerts", {
            replace: true,
            state: { anomalyId: anomaly._id },
          });
        } catch (error) {
          console.warn("Error in anomaly notification handler:", error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Error setting up anomaly subscription:", error);
    }
  }, [subscribeToAnomalies, dispatch, navigate, isConnected]);

  // This component doesn't render anything visible
  return null;
};
