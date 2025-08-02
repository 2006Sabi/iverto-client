import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Anomaly, Camera } from '@/types/api';

interface RealtimeState {
  // WebSocket connection status
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnected: string | null;
  
  // Real-time data
  latestAnomalies: Anomaly[];
  activeAnomalies: Anomaly[];
  cameraStatusUpdates: Record<string, 'Online' | 'Offline'>;
  
  // Performance metrics
  lastUpdate: string | null;
  updateCount: number;
  
  // Error tracking
  connectionErrors: string[];
  lastError: string | null;
}

const initialState: RealtimeState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  lastConnected: null,
  latestAnomalies: [],
  activeAnomalies: [],
  cameraStatusUpdates: {},
  lastUpdate: null,
  updateCount: 0,
  connectionErrors: [],
  lastError: null,
};

const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    // Connection management
    setConnectionStatus: (state, action: PayloadAction<RealtimeState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
      if (action.payload === 'connected') {
        state.lastConnected = new Date().toISOString();
      }
    },
    
    // Anomaly updates
    addNewAnomaly: (state, action: PayloadAction<Anomaly>) => {
      const anomaly = action.payload;
      
      // Add to latest anomalies (keep only last 10)
      state.latestAnomalies.unshift(anomaly);
      if (state.latestAnomalies.length > 10) {
        state.latestAnomalies = state.latestAnomalies.slice(0, 10);
      }
      
      // Add to active anomalies if status is Active
      if (anomaly.status === 'Active') {
        const existingIndex = state.activeAnomalies.findIndex(a => a._id === anomaly._id);
        if (existingIndex === -1) {
          state.activeAnomalies.push(anomaly);
        } else {
          state.activeAnomalies[existingIndex] = anomaly;
        }
      }
      
      state.lastUpdate = new Date().toISOString();
      state.updateCount += 1;
    },
    
    updateAnomalyStatus: (state, action: PayloadAction<{ id: string; status: Anomaly['status'] }>) => {
      const { id, status } = action.payload;
      
      // Update in latest anomalies
      const latestIndex = state.latestAnomalies.findIndex(a => a._id === id);
      if (latestIndex !== -1) {
        state.latestAnomalies[latestIndex].status = status;
      }
      
      // Update in active anomalies
      if (status === 'Active') {
        // Add to active if not already there
        const activeIndex = state.activeAnomalies.findIndex(a => a._id === id);
        if (activeIndex === -1) {
          const anomaly = state.latestAnomalies.find(a => a._id === id);
          if (anomaly) {
            state.activeAnomalies.push(anomaly);
          }
        }
      } else {
        // Remove from active anomalies
        state.activeAnomalies = state.activeAnomalies.filter(a => a._id !== id);
      }
      
      state.lastUpdate = new Date().toISOString();
    },
    
    // Camera status updates
    updateCameraStatus: (state, action: PayloadAction<{ id: string; status: 'Online' | 'Offline' }>) => {
      const { id, status } = action.payload;
      state.cameraStatusUpdates[id] = status;
      state.lastUpdate = new Date().toISOString();
    },
    
    // Bulk updates
    setLatestAnomalies: (state, action: PayloadAction<Anomaly[]>) => {
      state.latestAnomalies = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    
    setActiveAnomalies: (state, action: PayloadAction<Anomaly[]>) => {
      state.activeAnomalies = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    
    // Error handling
    addConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionErrors.push(action.payload);
      state.lastError = action.payload;
      if (state.connectionErrors.length > 10) {
        state.connectionErrors = state.connectionErrors.slice(-10);
      }
    },
    
    clearErrors: (state) => {
      state.connectionErrors = [];
      state.lastError = null;
    },
    
    // Reset state
    resetRealtime: (state) => {
      state.latestAnomalies = [];
      state.activeAnomalies = [];
      state.cameraStatusUpdates = {};
      state.updateCount = 0;
      state.lastUpdate = null;
    },
  },
});

export const {
  setConnectionStatus,
  addNewAnomaly,
  updateAnomalyStatus,
  updateCameraStatus,
  setLatestAnomalies,
  setActiveAnomalies,
  addConnectionError,
  clearErrors,
  resetRealtime,
} = realtimeSlice.actions;

export default realtimeSlice.reducer; 