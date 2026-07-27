import { baseApi } from '../../api/baseApi';

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInvoices: builder.query<any, void>({
      query: () => '/invoices',
      providesTags: ['Invoice'],
    }),
    getInvoiceDetails: builder.query<any, string>({
      query: (invoiceId) => `/invoices/${invoiceId}/details`,
      providesTags: (result, error, arg) => [{ type: 'Invoice', id: arg }],
    }),
  }),
});

export const { useGetMyInvoicesQuery, useGetInvoiceDetailsQuery } = invoicesApi;
