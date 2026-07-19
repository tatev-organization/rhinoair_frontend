import { baseApi } from './baseApi';

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricingConfig: builder.query<any, void>({
      query: () => '/v1/pricing/config',
      providesTags: ['Pricing'],
    }),
    updatePricingConfig: builder.mutation<any, any>({
      query: (data) => ({
        url: '/v1/pricing/config',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pricing'],
    }),
  }),
});

export const { useGetPricingConfigQuery, useUpdatePricingConfigMutation } = pricingApi;
