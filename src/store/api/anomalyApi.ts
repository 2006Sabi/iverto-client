import { baseApi } from './baseApi';
import type { 
  Anomaly, 
  CreateAnomalyRequest, 
  UpdateAnomalyRequest, 
  PaginatedResponse,
  AnomalyQueryParams,
  ApiResponse
} from '../../types/api';

export const anomalyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnomalies: builder.query<PaginatedResponse<Anomaly[]>, AnomalyQueryParams | void>({
      query: (params: AnomalyQueryParams = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        
        return `/anomalies?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Anomaly' as const, id: _id })),
              { type: 'Anomaly', id: 'LIST' },
            ]
          : [{ type: 'Anomaly', id: 'LIST' }],
    }),
    
    getAnomaly: builder.query<ApiResponse<Anomaly>, string>({
      query: (id) => `/anomalies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Anomaly', id }],
    }),
    
    createAnomaly: builder.mutation<ApiResponse<Anomaly>, CreateAnomalyRequest>({
      query: (anomalyData) => ({
        url: '/anomalies',
        method: 'POST',
        body: anomalyData,
      }),
      invalidatesTags: [{ type: 'Anomaly', id: 'LIST' }],
    }),
    
    updateAnomalyStatus: builder.mutation<ApiResponse<Anomaly>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/anomalies/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Anomaly', id },
        { type: 'Anomaly', id: 'LIST' },
        { type: 'Anomaly', id: 'STATS' },
        { type: 'Anomaly', id: 'RECENT' },
      ],
    }),
    
    updateAnomaly: builder.mutation<ApiResponse<Anomaly>, { id: string; updates: UpdateAnomalyRequest }>({
      query: ({ id, updates }) => ({
        url: `/anomalies/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Anomaly', id },
        { type: 'Anomaly', id: 'LIST' },
        { type: 'Anomaly', id: 'STATS' },
        { type: 'Anomaly', id: 'RECENT' },
      ],
    }),
    
    deleteAnomaly: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/anomalies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Anomaly', id },
        { type: 'Anomaly', id: 'LIST' },
        { type: 'Anomaly', id: 'STATS' },
        { type: 'Anomaly', id: 'RECENT' },
      ],
    }),
    
    getAnomalyStats: builder.query<ApiResponse<{
      totalAnomalies: number;
      activeAnomalies: number;
      acknowledgedAnomalies: number;
      resolvedAnomalies: number;
      highPriorityAnomalies: number;
      anomaliesToday: number;
    }>, void>({
      query: () => '/anomalies/stats',
      providesTags: [{ type: 'Anomaly', id: 'STATS' }],
    }),
    
    getRecentAnomalies: builder.query<Anomaly[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => `/anomalies/recent?limit=${limit}`,
      transformResponse: (response: PaginatedResponse<Anomaly[]>) => response.data,
      providesTags: [{ type: 'Anomaly', id: 'RECENT' }],
    }),
  }),
});

export const {
  useGetAnomaliesQuery,
  useGetAnomalyQuery,
  useCreateAnomalyMutation,
  useUpdateAnomalyStatusMutation,
  useUpdateAnomalyMutation,
  useDeleteAnomalyMutation,
  useGetAnomalyStatsQuery,
  useGetRecentAnomaliesQuery,
} = anomalyApi; 