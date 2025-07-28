import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeView: 'dashboard' | 'live-cameras' | 'alerts' | 'profile';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  isOnline: boolean;
  lastSync: number | null;
}

const initialState: UiState = {
  activeView: 'dashboard',
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system',
  notifications: [],
  isOnline: navigator.onLine,
  lastSync: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveView: (state, action: PayloadAction<UiState['activeView']>) => {
      state.activeView = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setTheme: (state, action: PayloadAction<UiState['theme']>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
      }>
    ) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (action.payload) {
        state.lastSync = Date.now();
      }
    },
    
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },
  },
});

export const {
  setActiveView,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  setOnlineStatus,
  updateLastSync,
} = uiSlice.actions;

export default uiSlice.reducer; 