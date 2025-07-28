import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Camera, Anomaly } from "@/types/api";

interface DataState {
  // Dashboard data
  dashboardStats: any | null;
  systemHealth: any | null;

  // Camera data
  cameras: Camera[];
  cameraStats: any | null;

  // Anomaly data
  anomalies: Anomaly[];
  anomalyStats: any | null;
  recentAnomalies: Anomaly[];

  // Loading states
  loading: {
    dashboardStats: boolean;
    systemHealth: boolean;
    cameras: boolean;
    cameraStats: boolean;
    anomalies: boolean;
    anomalyStats: boolean;
    recentAnomalies: boolean;
  };

  // Error states
  errors: {
    dashboardStats: string | null;
    systemHealth: string | null;
    cameras: string | null;
    cameraStats: string | null;
    anomalies: string | null;
    anomalyStats: string | null;
    recentAnomalies: string | null;
  };

  // Last update timestamps
  lastUpdated: {
    dashboardStats: string | null;
    systemHealth: string | null;
    cameras: string | null;
    cameraStats: string | null;
    anomalies: string | null;
    anomalyStats: string | null;
    recentAnomalies: string | null;
  };
}

const initialState: DataState = {
  // Dashboard data
  dashboardStats: null,
  systemHealth: null,

  // Camera data
  cameras: [],
  cameraStats: null,

  // Anomaly data
  anomalies: [],
  anomalyStats: null,
  recentAnomalies: [],

  // Loading states
  loading: {
    dashboardStats: false,
    systemHealth: false,
    cameras: false,
    cameraStats: false,
    anomalies: false,
    anomalyStats: false,
    recentAnomalies: false,
  },

  // Error states
  errors: {
    dashboardStats: null,
    systemHealth: null,
    cameras: null,
    cameraStats: null,
    anomalies: null,
    anomalyStats: null,
    recentAnomalies: null,
  },

  // Last update timestamps
  lastUpdated: {
    dashboardStats: null,
    systemHealth: null,
    cameras: null,
    cameraStats: null,
    anomalies: null,
    anomalyStats: null,
    recentAnomalies: null,
  },
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    // Set data actions
    setDashboardStats: (state, action: PayloadAction<any>) => {
      state.dashboardStats = action.payload;
      state.loading.dashboardStats = false;
      state.errors.dashboardStats = null;
      state.lastUpdated.dashboardStats = new Date().toISOString();
    },

    setSystemHealth: (state, action: PayloadAction<any>) => {
      state.systemHealth = action.payload;
      state.loading.systemHealth = false;
      state.errors.systemHealth = null;
      state.lastUpdated.systemHealth = new Date().toISOString();
    },

    setCameras: (state, action: PayloadAction<Camera[]>) => {
      state.cameras = action.payload;
      state.loading.cameras = false;
      state.errors.cameras = null;
      state.lastUpdated.cameras = new Date().toISOString();
    },

    setCameraStats: (state, action: PayloadAction<any>) => {
      state.cameraStats = action.payload;
      state.loading.cameraStats = false;
      state.errors.cameraStats = null;
      state.lastUpdated.cameraStats = new Date().toISOString();
    },

    setAnomalies: (state, action: PayloadAction<Anomaly[]>) => {
      state.anomalies = action.payload;
      state.loading.anomalies = false;
      state.errors.anomalies = null;
      state.lastUpdated.anomalies = new Date().toISOString();
    },

    setAnomalyStats: (state, action: PayloadAction<any>) => {
      state.anomalyStats = action.payload;
      state.loading.anomalyStats = false;
      state.errors.anomalyStats = null;
      state.lastUpdated.anomalyStats = new Date().toISOString();
    },

    setRecentAnomalies: (state, action: PayloadAction<Anomaly[]>) => {
      state.recentAnomalies = action.payload;
      state.loading.recentAnomalies = false;
      state.errors.recentAnomalies = null;
      state.lastUpdated.recentAnomalies = new Date().toISOString();
    },

    // Loading actions
    setLoading: (
      state,
      action: PayloadAction<{
        key: keyof DataState["loading"];
        loading: boolean;
      }>
    ) => {
      const { key, loading } = action.payload;
      state.loading[key] = loading;
    },

    // Error actions
    setError: (
      state,
      action: PayloadAction<{
        key: keyof DataState["errors"];
        error: string | null;
      }>
    ) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
      state.loading[key] = false;
    },

    // Camera operations
    addCamera: (state, action: PayloadAction<Camera>) => {
      // Check if camera already exists to avoid duplicates
      const existingIndex = state.cameras.findIndex(
        (c) => c._id === action.payload._id
      );
      if (existingIndex === -1) {
        state.cameras.push(action.payload);
        // Update camera stats
        if (state.cameraStats) {
          state.cameraStats.data.totalCameras += 1;
          if (action.payload.status === "Online") {
            state.cameraStats.data.activeCameras += 1;
          } else {
            state.cameraStats.data.offlineCameras += 1;
          }
        }
        // Update dashboard stats
        if (state.dashboardStats) {
          state.dashboardStats.data.totalCameras += 1;
          if (action.payload.status === "Online") {
            state.dashboardStats.data.activeCameras += 1;
          } else {
            state.dashboardStats.data.offlineCameras += 1;
          }
        }
        // Update last updated timestamp
        state.lastUpdated.cameras = new Date().toISOString();
      }
    },

    updateCamera: (state, action: PayloadAction<Camera>) => {
      const index = state.cameras.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        const oldStatus = state.cameras[index].status;
        const newStatus = action.payload.status;

        state.cameras[index] = action.payload;

        // Update camera stats if status changed
        if (oldStatus !== newStatus && state.cameraStats) {
          if (oldStatus === "Online" && newStatus === "Offline") {
            state.cameraStats.data.activeCameras -= 1;
            state.cameraStats.data.offlineCameras += 1;
          } else if (oldStatus === "Offline" && newStatus === "Online") {
            state.cameraStats.data.activeCameras += 1;
            state.cameraStats.data.offlineCameras -= 1;
          }
        }

        // Update dashboard stats
        if (state.dashboardStats) {
          if (oldStatus === "Online" && newStatus === "Offline") {
            state.dashboardStats.data.activeCameras -= 1;
            state.dashboardStats.data.offlineCameras += 1;
          } else if (oldStatus === "Offline" && newStatus === "Online") {
            state.dashboardStats.data.activeCameras += 1;
            state.dashboardStats.data.offlineCameras -= 1;
          }
        }

        // Update last updated timestamp
        state.lastUpdated.cameras = new Date().toISOString();
      }
    },

    removeCamera: (state, action: PayloadAction<string>) => {
      const camera = state.cameras.find((c) => c._id === action.payload);
      if (camera) {
        state.cameras = state.cameras.filter((c) => c._id !== action.payload);

        // Update camera stats
        if (state.cameraStats) {
          state.cameraStats.data.totalCameras -= 1;
          if (camera.status === "Online") {
            state.cameraStats.data.activeCameras -= 1;
          } else {
            state.cameraStats.data.offlineCameras -= 1;
          }
        }

        // Update dashboard stats
        if (state.dashboardStats) {
          state.dashboardStats.data.totalCameras -= 1;
          if (camera.status === "Online") {
            state.dashboardStats.data.activeCameras -= 1;
          } else {
            state.dashboardStats.data.offlineCameras -= 1;
          }
        }

        // Update last updated timestamp
        state.lastUpdated.cameras = new Date().toISOString();
      }
    },

    // Anomaly operations
    addAnomaly: (state, action: PayloadAction<Anomaly>) => {
      state.anomalies.unshift(action.payload);
      state.recentAnomalies.unshift(action.payload);

      // Keep arrays manageable
      if (state.anomalies.length > 100) {
        state.anomalies = state.anomalies.slice(0, 100);
      }
      if (state.recentAnomalies.length > 10) {
        state.recentAnomalies = state.recentAnomalies.slice(0, 10);
      }

      // Update anomaly stats
      if (state.anomalyStats) {
        state.anomalyStats.data.totalAnomalies += 1;
        state.anomalyStats.data.anomaliesToday += 1;
        if (action.payload.status === "Active") {
          state.anomalyStats.data.activeAnomalies += 1;
        }
        if (action.payload.confidence >= 80) {
          state.anomalyStats.data.highPriorityAnomalies += 1;
        }
      }

      // Update dashboard stats
      if (state.dashboardStats) {
        state.dashboardStats.data.anomaliesToday += 1;
        if (action.payload.confidence >= 80) {
          state.dashboardStats.data.highPriorityAnomalies += 1;
        }
      }
    },

    updateAnomaly: (state, action: PayloadAction<Anomaly>) => {
      const index = state.anomalies.findIndex(
        (a) => a._id === action.payload._id
      );
      if (index !== -1) {
        const oldStatus = state.anomalies[index].status;
        const newStatus = action.payload.status;

        state.anomalies[index] = action.payload;

        // Update in recent anomalies too
        const recentIndex = state.recentAnomalies.findIndex(
          (a) => a._id === action.payload._id
        );
        if (recentIndex !== -1) {
          state.recentAnomalies[recentIndex] = action.payload;
        }

        // Update anomaly stats if status changed
        if (oldStatus !== newStatus && state.anomalyStats) {
          if (oldStatus === "Active" && newStatus !== "Active") {
            state.anomalyStats.data.activeAnomalies -= 1;
          } else if (oldStatus !== "Active" && newStatus === "Active") {
            state.anomalyStats.data.activeAnomalies += 1;
          }
        }
      }
    },

    removeAnomaly: (state, action: PayloadAction<string>) => {
      const anomaly = state.anomalies.find((a) => a._id === action.payload);
      if (anomaly) {
        state.anomalies = state.anomalies.filter(
          (a) => a._id !== action.payload
        );
        state.recentAnomalies = state.recentAnomalies.filter(
          (a) => a._id !== action.payload
        );

        // Update anomaly stats
        if (state.anomalyStats) {
          state.anomalyStats.data.totalAnomalies -= 1;
          if (anomaly.status === "Active") {
            state.anomalyStats.data.activeAnomalies -= 1;
          }
          if (anomaly.confidence >= 80) {
            state.anomalyStats.data.highPriorityAnomalies -= 1;
          }
        }

        // Update dashboard stats
        if (state.dashboardStats) {
          if (anomaly.confidence >= 80) {
            state.dashboardStats.data.highPriorityAnomalies -= 1;
          }
        }
      }
    },

    // Clear all data
    clearAllData: (state) => {
      state.dashboardStats = null;
      state.systemHealth = null;
      state.cameras = [];
      state.cameraStats = null;
      state.anomalies = [];
      state.anomalyStats = null;
      state.recentAnomalies = [];

      // Reset loading states
      Object.keys(state.loading).forEach((key) => {
        state.loading[key as keyof DataState["loading"]] = false;
      });

      // Reset error states
      Object.keys(state.errors).forEach((key) => {
        state.errors[key as keyof DataState["errors"]] = null;
      });

      // Reset timestamps
      Object.keys(state.lastUpdated).forEach((key) => {
        state.lastUpdated[key as keyof DataState["lastUpdated"]] = null;
      });
    },
  },
});

export const {
  setDashboardStats,
  setSystemHealth,
  setCameras,
  setCameraStats,
  setAnomalies,
  setAnomalyStats,
  setRecentAnomalies,
  setLoading,
  setError,
  addCamera,
  updateCamera,
  removeCamera,
  addAnomaly,
  updateAnomaly,
  removeAnomaly,
  clearAllData,
} = dataSlice.actions;

export default dataSlice.reducer;
