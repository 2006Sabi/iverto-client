import { baseApi } from './baseApi';
import { AIReport, ProductivityAnalytics, StateData, AIReportsResponse, ProductivityAnalyticsResponse, StateDataResponse } from '@/types/aiReports';

// Inject aiReportsApi into baseApi
export const aiReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get AI Reports (paginated)
    getAIReports: builder.query<AIReportsResponse, any>({
      query: (params) => ({
        url: '/ai-reports',
        params,
      }),
      providesTags: ['Anomaly'],
    }),
    
    // Get Productivity Analytics
    getProductivityAnalytics: builder.query<ProductivityAnalyticsResponse, any>({
      query: (params) => ({
        url: '/ai-reports/productivity',
        params,
      }),
      providesTags: ['Anomaly'],
    }),
    
    // Get State for Specific Date/Time
    getState: builder.query<StateDataResponse, { date: string; [key: string]: any }>({
      query: ({ date, ...params }) => ({
        url: `/ai-reports/state/${date}`,
        params,
      }),
      providesTags: ['Anomaly'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAIReportsQuery,
  useGetProductivityAnalyticsQuery,
  useGetStateQuery,
} = aiReportsApi;
