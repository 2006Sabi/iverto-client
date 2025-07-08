import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/api';
import { dataInitializer } from '@/services/dataInitializer';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  profileChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.profileChecked = true;
      
      // Persist to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      // Clear all cached data for previous user
      dataInitializer.clearCache();
    },
    
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.profileChecked = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    updateTokens: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
      }>
    ) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.profileChecked = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Clear all cached data
      dataInitializer.clearCache();
    },
    
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userString = localStorage.getItem('user');
      
      if (token && refreshToken && userString) {
        try {
          const user = JSON.parse(userString);
          state.user = user;
          state.token = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.profileChecked = false; // Will be set to true after profile check
        } catch (error) {
          // Invalid data in localStorage, clear it
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.profileChecked = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      state.isLoading = false;
    },

    setProfileChecked: (state, action: PayloadAction<boolean>) => {
      state.profileChecked = action.payload;
    },

    clearAuthData: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.profileChecked = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const {
  setCredentials,
  setUser,
  setLoading,
  updateTokens,
  logout,
  initializeAuth,
  setProfileChecked,
  clearAuthData,
} = authSlice.actions;

export default authSlice.reducer; 