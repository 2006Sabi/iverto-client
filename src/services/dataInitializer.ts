import { store } from "@/store";
import { config } from "@/config/environment";
import {
  setLatestAnomalies,
  setActiveAnomalies,
} from "@/store/slices/realtimeSlice";
import {
  setDashboardStats,
  setSystemHealth,
  setCameras,
  setCameraStats,
  setAnomalies,
  setAnomalyStats,
  setRecentAnomalies,
  setLoading,
  setError,
} from "@/store/slices/dataSlice";

// LocalStorage keys
const STORAGE_KEYS = {
  DASHBOARD_STATS: "inverto_dashboard_stats",
  SYSTEM_HEALTH: "inverto_system_health",
  SYSTEM_METRICS: "inverto_system_metrics",
  ANOMALIES: "inverto_anomalies",
  ANOMALY_STATS: "inverto_anomaly_stats",
  RECENT_ANOMALIES: "inverto_recent_anomalies",
  CAMERAS: "inverto_cameras",
  CAMERA_STATS: "inverto_camera_stats",
  LAST_LOAD_TIME: "inverto_last_load_time",
  IS_FRESH_LOAD: "inverto_is_fresh_load",
} as const;

// Data expiration time (5 minutes)
const DATA_EXPIRY_TIME = 5 * 60 * 1000;

interface StoredData {
  data: any;
  timestamp: number;
  version: string;
}

class DataInitializer {
  private static instance: DataInitializer;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly APP_VERSION = "1.0.0";

  private constructor() {}

  static getInstance(): DataInitializer {
    if (!DataInitializer.instance) {
      DataInitializer.instance = new DataInitializer();
    }
    return DataInitializer.instance;
  }

  // Check if this is a fresh page load (browser refresh)
  private isFreshLoad(): boolean {
    const isFresh = sessionStorage.getItem(STORAGE_KEYS.IS_FRESH_LOAD) === null;
    if (isFresh) {
      sessionStorage.setItem(STORAGE_KEYS.IS_FRESH_LOAD, "false");
    }
    return isFresh;
  }

  // Check if stored data is still valid
  private isDataValid(key: string): boolean {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return false;

      const parsed: StoredData = JSON.parse(stored);
      const now = Date.now();

      // Check if data is expired
      if (now - parsed.timestamp > DATA_EXPIRY_TIME) {
        return false;
      }

      // Check if version matches
      if (parsed.version !== this.APP_VERSION) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Store data in localStorage with metadata
  private storeData(key: string, data: any): void {
    try {
      const storedData: StoredData = {
        data,
        timestamp: Date.now(),
        version: this.APP_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(storedData));
    } catch (error) {
      // Silent error handling
    }
  }

  // Retrieve data from localStorage
  private getStoredData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed: StoredData = JSON.parse(stored);
      return parsed.data as T;
    } catch (error) {
      return null;
    }
  }

  // Get authentication token
  private getAuthToken(): string | null {
    // The auth system uses 'token' as the key
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    return token;
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return false;
    }

    try {
      JSON.parse(user); // Validate user data is valid JSON
      return true;
    } catch (error) {
      return false;
    }
  }

  // Make authenticated API request
  private async makeApiRequest(url: string): Promise<any> {
    const token = this.getAuthToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  // Load dashboard data
  private async loadDashboardData(): Promise<void> {
    // Set loading state
    store.dispatch(setLoading({ key: "dashboardStats", loading: true }));
    store.dispatch(setLoading({ key: "systemHealth", loading: true }));

    // Check if we need to fetch fresh data
    const shouldFetch =
      this.isFreshLoad() || !this.isDataValid(STORAGE_KEYS.DASHBOARD_STATS);

    if (shouldFetch) {
      try {
        // Fetch dashboard stats
        const statsData = await this.makeApiRequest(
          `${config.apiUrl}/dashboard/stats`
        );
        this.storeData(STORAGE_KEYS.DASHBOARD_STATS, statsData);
        store.dispatch(setDashboardStats(statsData));

        // Fetch system health
        const healthData = await this.makeApiRequest(
          `${config.apiUrl}/dashboard/health`
        );
        this.storeData(STORAGE_KEYS.SYSTEM_HEALTH, healthData);
        store.dispatch(setSystemHealth(healthData));
      } catch (error) {
        store.dispatch(
          setError({
            key: "dashboardStats",
            error:
              error instanceof Error
                ? error.message
                : "Failed to load dashboard data",
          })
        );
        store.dispatch(
          setError({
            key: "systemHealth",
            error:
              error instanceof Error
                ? error.message
                : "Failed to load system health",
          })
        );
      }
    } else {
      // Load from cache to Redux
      const cachedStats = this.getStoredData(STORAGE_KEYS.DASHBOARD_STATS);
      const cachedHealth = this.getStoredData(STORAGE_KEYS.SYSTEM_HEALTH);

      if (cachedStats) {
        store.dispatch(setDashboardStats(cachedStats));
      }
      if (cachedHealth) {
        store.dispatch(setSystemHealth(cachedHealth));
      }
    }
  }

  // Load anomaly data
  private async loadAnomalyData(): Promise<void> {
    // Set loading states
    store.dispatch(setLoading({ key: "anomalies", loading: true }));
    store.dispatch(setLoading({ key: "anomalyStats", loading: true }));
    store.dispatch(setLoading({ key: "recentAnomalies", loading: true }));

    const shouldFetch =
      this.isFreshLoad() || !this.isDataValid(STORAGE_KEYS.ANOMALIES);

    if (shouldFetch) {
      try {
        // Fetch all anomalies
        const anomaliesData = await this.makeApiRequest(
          `${config.apiUrl}/anomalies?limit=100`
        );
        this.storeData(STORAGE_KEYS.ANOMALIES, anomaliesData);

        // Fetch anomaly stats
        const statsData = await this.makeApiRequest(
          `${config.apiUrl}/anomalies/stats`
        );
        this.storeData(STORAGE_KEYS.ANOMALY_STATS, statsData);

        // Fetch recent anomalies
        const recentData = await this.makeApiRequest(
          `${config.apiUrl}/anomalies/recent?limit=10`
        );
        this.storeData(STORAGE_KEYS.RECENT_ANOMALIES, recentData);

        // Update Redux store with anomaly data
        if (anomaliesData.data && Array.isArray(anomaliesData.data)) {
          store.dispatch(setAnomalies(anomaliesData.data));
          store.dispatch(setLatestAnomalies(anomaliesData.data));
          const activeAnomalies = anomaliesData.data.filter(
            (a: any) => a.status === "Active"
          );
          store.dispatch(setActiveAnomalies(activeAnomalies));
        }

        if (statsData) {
          store.dispatch(setAnomalyStats(statsData));
        }

        if (recentData.data && Array.isArray(recentData.data)) {
                  store.dispatch(setRecentAnomalies(recentData.data));
      }
    } catch (error) {
      store.dispatch(
        setError({
          key: "anomalies",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load anomalies",
        })
      );
      store.dispatch(
        setError({
          key: "anomalyStats",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load anomaly stats",
        })
      );
      store.dispatch(
        setError({
          key: "recentAnomalies",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load recent anomalies",
        })
      );
    } finally {
      // Always clear loading states
      store.dispatch(setLoading({ key: "anomalies", loading: false }));
      store.dispatch(setLoading({ key: "anomalyStats", loading: false }));
      store.dispatch(setLoading({ key: "recentAnomalies", loading: false }));
    }
    } else {
      // Load from cache to Redux
      const cachedAnomalies = this.getStoredData(STORAGE_KEYS.ANOMALIES);
      const cachedStats = this.getStoredData(STORAGE_KEYS.ANOMALY_STATS);
      const cachedRecent = this.getStoredData(STORAGE_KEYS.RECENT_ANOMALIES);

      if (cachedAnomalies?.data && Array.isArray(cachedAnomalies.data)) {
        store.dispatch(setAnomalies(cachedAnomalies.data));
        store.dispatch(setLatestAnomalies(cachedAnomalies.data));
        const activeAnomalies = cachedAnomalies.data.filter(
          (a: any) => a.status === "Active"
        );
        store.dispatch(setActiveAnomalies(activeAnomalies));
      }

      if (cachedStats) {
        store.dispatch(setAnomalyStats(cachedStats));
      }

      if (cachedRecent?.data && Array.isArray(cachedRecent.data)) {
        store.dispatch(setRecentAnomalies(cachedRecent.data));
      }
    }

    // Always clear loading states
    store.dispatch(setLoading({ key: "anomalies", loading: false }));
    store.dispatch(setLoading({ key: "anomalyStats", loading: false }));
    store.dispatch(setLoading({ key: "recentAnomalies", loading: false }));
  }

  // Load camera data
  private async loadCameraData(): Promise<void> {
    // Set loading states
    store.dispatch(setLoading({ key: "cameras", loading: true }));
    store.dispatch(setLoading({ key: "cameraStats", loading: true }));

    // Always fetch cameras on fresh load (refresh) or if data is invalid
    const shouldFetch =
      this.isFreshLoad() || !this.isDataValid(STORAGE_KEYS.CAMERAS);

    if (shouldFetch) {
      try {
        // Fetch all cameras
        const camerasData = await this.makeApiRequest(
          `${config.apiUrl}/cameras`
        );
        this.storeData(STORAGE_KEYS.CAMERAS, camerasData);

        // Fetch camera stats
        const statsData = await this.makeApiRequest(
          `${config.apiUrl}/cameras/stats`
        );
        this.storeData(STORAGE_KEYS.CAMERA_STATS, statsData);

        // Update Redux store with camera data
        if (camerasData.data && Array.isArray(camerasData.data)) {
          store.dispatch(setCameras(camerasData.data));
        }

        if (statsData) {
          store.dispatch(setCameraStats(statsData));
        }

        // Store last load time for cameras specifically
        localStorage.setItem(
          `${STORAGE_KEYS.CAMERAS}_last_load`,
          Date.now().toString()
        );
      } catch (error) {
        store.dispatch(
          setError({
            key: "cameras",
            error:
              error instanceof Error ? error.message : "Failed to load cameras",
          })
        );
        store.dispatch(
          setError({
            key: "cameraStats",
            error:
              error instanceof Error
                ? error.message
                : "Failed to load camera stats",
          })
        );
      }
    } else {
      // Load from cache to Redux
      const cachedCameras = this.getStoredData(STORAGE_KEYS.CAMERAS);
      const cachedStats = this.getStoredData(STORAGE_KEYS.CAMERA_STATS);

      if (cachedCameras?.data && Array.isArray(cachedCameras.data)) {
        store.dispatch(setCameras(cachedCameras.data));
      }

      if (cachedStats) {
        store.dispatch(setCameraStats(cachedStats));
      }
    }

    // Always clear loading states
    store.dispatch(setLoading({ key: "cameras", loading: false }));
    store.dispatch(setLoading({ key: "cameraStats", loading: false }));
  }

  // Force refresh cameras data (for login scenarios)
  async refreshCamerasData(): Promise<void> {
    // Clear camera cache
    localStorage.removeItem(STORAGE_KEYS.CAMERAS);
    localStorage.removeItem(STORAGE_KEYS.CAMERA_STATS);
    localStorage.removeItem(`${STORAGE_KEYS.CAMERAS}_last_load`);

    // Reload camera data
    await this.loadCameraData();
  }

  // Force refresh anomaly data (for delete scenarios)
  async refreshAnomalyData(): Promise<void> {
    // Clear anomaly cache
    localStorage.removeItem(STORAGE_KEYS.ANOMALIES);
    localStorage.removeItem(STORAGE_KEYS.ANOMALY_STATS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_ANOMALIES);

    // Reload anomaly data
    await this.loadAnomalyData();
  }

  // Initialize all data
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  // Test server connectivity
  private async testServerConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${config.apiUrl.replace("/api", "")}/health`
      );
      const data = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      // Check authentication first
      if (!this.isAuthenticated()) {
        this.isInitialized = true;
        return;
      }

      // Test server connection first
      const serverReachable = await this.testServerConnection();
      if (!serverReachable) {
        this.isInitialized = true;
        return;
      }

      // Load all data in parallel, but don't fail if one fails
      const promises = [
        this.loadDashboardData().catch(() => {}),
        this.loadAnomalyData().catch(() => {}),
        this.loadCameraData().catch(() => {}),
      ];

      await Promise.allSettled(promises);

      // Store last load time
      localStorage.setItem(STORAGE_KEYS.LAST_LOAD_TIME, Date.now().toString());

      this.isInitialized = true;
    } catch (error) {
      // Don't throw error, just mark as initialized
      this.isInitialized = true;
    } finally {
      this.initializationPromise = null;
    }
  }

  // Get cached data for components
  getDashboardStats() {
    return this.getStoredData(STORAGE_KEYS.DASHBOARD_STATS);
  }

  getSystemHealth() {
    return this.getStoredData(STORAGE_KEYS.SYSTEM_HEALTH);
  }

  getSystemMetrics() {
    return this.getStoredData(STORAGE_KEYS.SYSTEM_METRICS);
  }

  getAnomalies() {
    return this.getStoredData(STORAGE_KEYS.ANOMALIES);
  }

  getAnomalyStats() {
    return this.getStoredData(STORAGE_KEYS.ANOMALY_STATS);
  }

  getRecentAnomalies() {
    return this.getStoredData(STORAGE_KEYS.RECENT_ANOMALIES);
  }

  getCameras() {
    return this.getStoredData(STORAGE_KEYS.CAMERAS);
  }

  getCameraStats() {
    return this.getStoredData(STORAGE_KEYS.CAMERA_STATS);
  }

  // Force refresh all data
  async refreshAllData(): Promise<void> {
    // Clear all cached data
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.IS_FRESH_LOAD) {
        localStorage.removeItem(key);
      }
    });

    // Reset initialization flag
    this.isInitialized = false;

    // Re-initialize
    await this.initialize();
  }

  // Clear all cached data
  clearCache(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    this.isInitialized = false;
  }
}

export const dataInitializer = DataInitializer.getInstance();
export { STORAGE_KEYS };
