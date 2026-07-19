import { baseApi } from './baseApi';

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingConfig: builder.query<any, void>({
      query: () => '/pricing/config',
      providesTags: ['Pricing'],
    }),
    updatePricingConfig: builder.mutation<any, any>({
      query: (data) => ({
        url: '/pricing/config',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pricing'],
    }),
  }),
});

export const { useGetPricingConfigQuery, useUpdatePricingConfigMutation } = pricingApi;
