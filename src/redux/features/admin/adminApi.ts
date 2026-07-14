import { baseApi } from '../../api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<any, void>({
      query: () => '/admin/partners',
      providesTags: ['Partners'],
    }),
    getPartnerById: builder.query<any, string>({
      query: (companyId) => `/admin/partners/${companyId}`,
      providesTags: (result, error, id) => [{ type: 'Partners', id }],
    }),
    getSTCustomers: builder.query<any, void>({
      query: () => '/admin/st-customers',
    }),
    assignSTCustomer: builder.mutation<any, { companyId: string; serviceTitanCustomerId: string }>({
      query: ({ companyId, serviceTitanCustomerId }) => ({
        url: `/admin/partners/${companyId}/st-customers`,
        method: 'POST',
        body: { serviceTitanCustomerId },
      }),
      invalidatesTags: ['Partners'],
    }),
    removeSTCustomer: builder.mutation<any, { companyId: string; stCustomerId: string }>({
      query: ({ companyId, stCustomerId }) => ({
        url: `/admin/partners/${companyId}/st-customers/${stCustomerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useGetSTCustomersQuery,
  useAssignSTCustomerMutation,
  useRemoveSTCustomerMutation,
} = adminApi;
