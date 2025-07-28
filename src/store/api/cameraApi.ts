import { baseApi } from './baseApi';
import type { 
  Camera, 
  CreateCameraRequest, 
  UpdateCameraRequest, 
  PaginatedResponse,
  CameraQueryParams,
  ApiResponse
} from '../../types/api';

export const cameraApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCameras: builder.query<PaginatedResponse<Camera[]>, CameraQueryParams | void>({
      query: (params: CameraQueryParams = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        
        return `/cameras?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Camera' as const, id: _id })),
              { type: 'Camera', id: 'LIST' },
            ]
          : [{ type: 'Camera', id: 'LIST' }],
    }),
    
    getCamera: builder.query<ApiResponse<Camera>, string>({
      query: (id) => `/cameras/${id}`,
      providesTags: (result, error, id) => [{ type: 'Camera', id }],
    }),
    
    createCamera: builder.mutation<ApiResponse<Camera>, CreateCameraRequest>({
      query: (cameraData) => ({
        url: '/cameras',
        method: 'POST',
        body: cameraData,
      }),
      invalidatesTags: [{ type: 'Camera', id: 'LIST' }],
    }),
    
    updateCamera: builder.mutation<ApiResponse<Camera>, { id: string; updates: UpdateCameraRequest }>({
      query: ({ id, updates }) => ({
        url: `/cameras/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Camera', id },
        { type: 'Camera', id: 'LIST' },
      ],
    }),
    
    deleteCamera: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cameras/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Camera', id },
        { type: 'Camera', id: 'LIST' },
      ],
    }),
    
    getCameraStats: builder.query<ApiResponse<{
      totalCameras: number;
      activeCameras: number;
      offlineCameras: number;
    }>, void>({
      query: () => '/cameras/stats',
      providesTags: [{ type: 'Camera', id: 'STATS' }],
    }),
    
    addCamera: builder.mutation<Camera, CreateCameraRequest>({
      query: (data) => ({
        url: '/cameras',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cameras'],
    }),
  }),
});

export const {
  useGetCamerasQuery,
  useGetCameraQuery,
  useCreateCameraMutation,
  useUpdateCameraMutation,
  useDeleteCameraMutation,
  useGetCameraStatsQuery,
  useAddCameraMutation,
} = cameraApi; 