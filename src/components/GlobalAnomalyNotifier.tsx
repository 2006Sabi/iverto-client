import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAppDispatch } from "@/store/hooks";
import { useToast } from "@/components/ui/custom-toaster";
import type { Anomaly } from "@/types/api";
import { useNavigate } from "react-router-dom";

export const GlobalAnomalyNotifier = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { subscribeToAnomalies } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAnomalies((anomaly: Anomaly) => {
      // Show custom toast notification
      toast.warning(
        `🚨 ${anomaly.type} Detected`,
        `${anomaly.type} at ${anomaly.location} (${anomaly.confidence}%)`
      );
      navigate("/alerts", { replace: true, state: { anomalyId: anomaly._id } });
    });

    return unsubscribe;
  }, [subscribeToAnomalies, dispatch, navigate]);

  // This component doesn't render anything visible
  return null;
};
