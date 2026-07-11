import { baseApi } from './baseApi';

export const quoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitQuote: builder.mutation<any, any>({
      query: (payload) => ({
        url: '/quotes',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Quote'],
    }),
  }),
});

export const { useSubmitQuoteMutation } = quoteApi;
