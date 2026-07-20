import { baseApi } from '../../api/baseApi';

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInvoices: builder.query<any, void>({
      query: () => '/invoices',
      providesTags: ['Invoice'],
    }),
  }),
});

export const { useGetMyInvoicesQuery } = invoicesApi;
