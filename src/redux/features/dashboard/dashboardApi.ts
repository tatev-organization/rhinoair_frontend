import { baseApi } from '../../api/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<any, void>({
      query: () => '/dashboard',
      providesTags: ['Project', 'Quote', 'Invoice'],
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
