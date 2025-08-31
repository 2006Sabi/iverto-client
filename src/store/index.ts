import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import { aiReportsApi } from './api/aiReportsApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import realtimeSlice from './slices/realtimeSlice';
import dataSlice from './slices/dataSlice';

// Import all API endpoints to ensure they're injected into baseApi
import './api/anomalyApi';
import './api/anomalyEntityApi';
import './api/authApi';
import './api/cameraApi';
import './api/dashboardApi';
import './api/aiReportsApi';

export const store = configureStore({
  reducer: {
    // API slice (all APIs are injected into this)
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Regular slices
    auth: authSlice,
    ui: uiSlice,
    realtime: realtimeSlice,
    data: dataSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(baseApi.middleware),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 