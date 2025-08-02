import { baseApi } from './baseApi';
import type { 
  DashboardStats, 
  ApiResponse
} from '../../types/api';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    
    getSystemHealth: builder.query<ApiResponse<{
      system: {
        status: string;
        uptime: string;
        memory: {
          used: number;
          total: number;
        };
        database: {
          status: string;
          connectionCount: number;
        };
      };
      cameras: Array<{
        id: string;
        name: string;
        status: string;
        location: string;
        url: string;
        lastSeen: string;
      }>;
      alerts: {
        total: number;
        online: number;
        offline: number;
      };
    }>, void>({
      query: () => '/dashboard/health',
      providesTags: ['Dashboard'],
    }),
    
    getActivityLog: builder.query<Array<{
      _id: string;
      action: string;
      user: string;
      timestamp: string;
      details?: string;
      ip_address?: string;
    }>, { limit?: number; page?: number }>({
      query: ({ limit = 20, page = 1 } = {}) => 
        `/dashboard/activity?limit=${limit}&page=${page}`,
      providesTags: ['Dashboard'],
    }),
    
    exportData: builder.mutation<{ downloadUrl: string }, {
      type: 'cameras' | 'anomalies' | 'users' | 'all';
      format: 'json' | 'csv' | 'xlsx';
      dateRange?: {
        start: string;
        end: string;
      };
    }>({
      query: (params) => ({
        url: '/dashboard/export',
        method: 'POST',
        body: params,
      }),
    }),
    
    getSystemMetrics: builder.query<{
      cpu: number;
      memory: number;
      disk: number;
      network: {
        inbound: number;
        outbound: number;
      };
      activeConnections: number;
      responseTime: number;
      errorRate: number;
      timestamp: string;
    }, void>({
      query: () => '/dashboard/metrics',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSystemHealthQuery,
  useGetActivityLogQuery,
  useExportDataMutation,
  useGetSystemMetricsQuery,
} = dashboardApi; 