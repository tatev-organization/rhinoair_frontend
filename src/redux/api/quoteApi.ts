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
    getQuoteById: builder.query<any, string>({
      query: (id) => `/quotes/${id}`,
      providesTags: ['Quote'],
    }),
    updateQuote: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/quotes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Quote', 'Project'],
    }),
  }),
});

export const { useSubmitQuoteMutation, useGetQuoteByIdQuery, useUpdateQuoteMutation } = quoteApi;
