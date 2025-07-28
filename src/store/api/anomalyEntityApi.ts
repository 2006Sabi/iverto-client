import { baseApi } from './baseApi';
import type { AnomalyEntity } from '@/types/api';

interface AnomalyEntityResponse {
  success: boolean;
  message: string;
  data: {
    entities: AnomalyEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const anomalyEntityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnomalyEntities: builder.query<AnomalyEntity[], void>({
      query: () => ({
        url: '/anomaly-entities',
        method: 'GET',
      }),
      transformResponse: (response: AnomalyEntityResponse) => response.data.entities,
      providesTags: ['AnomalyEntities'],
    }),
  }),
});

export const {
  useGetAnomalyEntitiesQuery,
} = anomalyEntityApi; 