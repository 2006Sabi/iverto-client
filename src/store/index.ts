import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import realtimeSlice from './slices/realtimeSlice';
import dataSlice from './slices/dataSlice';

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