import { useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import type { Anomaly } from '@/types/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const GlobalAnomalyNotifier = () => {
  const dispatch = useAppDispatch();
  const { subscribeToAnomalies } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAnomalies((anomaly: Anomaly) => {
      // Add to global notifications
      dispatch(addNotification({
        type: 'warning',
        title: `🚨 ${anomaly.type} Detected`,
        message: `${anomaly.type} detected at ${anomaly.location} with ${anomaly.confidence}% confidence`,
      }));
      toast({
        title: `🚨 ${anomaly.type} Detected`,
        description: `${anomaly.type} at ${anomaly.location} (${anomaly.confidence}%)`,
      });
      navigate('/alerts', { replace: true, state: { anomalyId: anomaly._id } });
    });

    return unsubscribe;
  }, [subscribeToAnomalies, dispatch, navigate]);

  // This component doesn't render anything visible
  return null;
}; 