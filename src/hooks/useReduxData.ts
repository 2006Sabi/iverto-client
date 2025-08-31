import { useAppSelector } from '@/store/hooks';

// Hook for dashboard stats from Redux
export const useDashboardStats = () => {
  const { dashboardStats, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: dashboardStats,
    loading: loading.dashboardStats,
    error: errors.dashboardStats,
  };
};

// Hook for system health from Redux
export const useSystemHealth = () => {
  const { systemHealth, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: systemHealth,
    loading: loading.systemHealth,
    error: errors.systemHealth,
  };
};

// Hook for cameras from Redux
export const useCameras = () => {
  const { cameras, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: cameras,
    loading: loading.cameras,
    error: errors.cameras,
  };
};

// Hook for camera stats from Redux
export const useCameraStats = () => {
  const { cameraStats, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: cameraStats,
    loading: loading.cameraStats,
    error: errors.cameraStats,
  };
};

// Hook for anomalies from Redux
export const useAnomalies = () => {
  const { anomalies, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: anomalies,
    loading: loading.anomalies,
    error: errors.anomalies,
  };
};

// Hook for anomaly stats from Redux
export const useAnomalyStats = () => {
  const { anomalyStats, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: anomalyStats,
    loading: loading.anomalyStats,
    error: errors.anomalyStats,
  };
};

// Hook for recent anomalies from Redux
export const useRecentAnomalies = () => {
  const { recentAnomalies, loading, errors } = useAppSelector((state) => state.data);
  
  return {
    data: recentAnomalies,
    loading: loading.recentAnomalies,
    error: errors.recentAnomalies,
  };
};

// Hook for all data loading states
export const useDataLoadingStates = () => {
  const { loading } = useAppSelector((state) => state.data);
  
  return {
    isLoading: Object.values(loading).some(Boolean),
    loadingStates: loading,
  };
};

// Hook for all data errors
export const useDataErrors = () => {
  const { errors } = useAppSelector((state) => state.data);
  
  return {
    hasErrors: Object.values(errors).some(Boolean),
    errors,
  };
};

// Hook for real-time anomalies (from realtime slice)
export const useRealtimeAnomalies = () => {
  const { latestAnomalies, activeAnomalies } = useAppSelector((state) => state.realtime);
  
  return {
    latestAnomalies,
    activeAnomalies,
  };
}; 