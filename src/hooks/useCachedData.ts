import { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dataInitializer } from "@/services/dataInitializer";
import { setCameras, setCameraStats } from "@/store/slices/dataSlice";

export const useCachedData = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { cameras, cameraStats } = useAppSelector((state) => state.data);

  // Refresh cameras data and update localStorage
  const refreshCameras = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await dataInitializer.refreshCamerasData();
    } catch (error) {
      console.error("Failed to refresh cameras:", error);
    }
  }, [isAuthenticated]);

  // Initialize cameras on mount and authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Refresh cameras data when user logs in
      refreshCameras();
    }
  }, [isAuthenticated, user, refreshCameras]);

  // Handle page refresh - ensure cameras are loaded
  useEffect(() => {
    const handleLoad = () => {
      const wasRefresh = sessionStorage.getItem("was_refresh");
      if (wasRefresh && isAuthenticated) {
        // Refresh cameras data on page refresh
        refreshCameras();
      }
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [isAuthenticated, refreshCameras]);

  return {
    cameras,
    cameraStats,
    refreshCameras,
    isLoading: false, // You can add loading state from Redux if needed
  };
};

// Hook for dashboard stats
export const useCachedDashboardStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const stats = dataInitializer.getDashboardStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard stats"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for system health
export const useCachedSystemHealth = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const health = dataInitializer.getSystemHealth();
        setData(health);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load system health"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for system metrics
export const useCachedSystemMetrics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const metrics = dataInitializer.getSystemMetrics();
        setData(metrics);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load system metrics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for anomalies
export const useCachedAnomalies = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const anomalies = dataInitializer.getAnomalies();
        setData(anomalies);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load anomalies"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for anomaly stats
export const useCachedAnomalyStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const stats = dataInitializer.getAnomalyStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load anomaly stats"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for recent anomalies
export const useCachedRecentAnomalies = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const recent = dataInitializer.getRecentAnomalies();
        setData(recent);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load recent anomalies"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for cameras
export const useCachedCameras = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const cameras = dataInitializer.getCameras();
        setData(cameras);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cameras");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for camera stats
export const useCachedCameraStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataInitializer.initialize();
        const stats = dataInitializer.getCameraStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load camera stats"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Hook for real-time anomalies (from Redux store)
export const useRealtimeAnomalies = () => {
  const latestAnomalies = useAppSelector(
    (state) => state.realtime.latestAnomalies
  );
  const activeAnomalies = useAppSelector(
    (state) => state.realtime.activeAnomalies
  );
  const connectionStatus = useAppSelector(
    (state) => state.realtime.connectionStatus
  );

  return {
    latestAnomalies,
    activeAnomalies,
    connectionStatus,
    isConnected: connectionStatus === "connected",
  };
};

// Hook for data refresh
export const useDataRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await dataInitializer.refreshAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshData, refreshing, error };
};
