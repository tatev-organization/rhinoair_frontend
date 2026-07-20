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
    getAllProjects: builder.query<any, void>({
      query: () => '/admin/projects',
      providesTags: ['Project'],
    }),
    updateProjectPhase: builder.mutation<any, { projectId: string; currentPhaseIndex: number; currentPhase: string; phaseClass: string }>({
      query: ({ projectId, ...body }) => ({
        url: `/admin/projects/${projectId}/phase`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectById: builder.query<any, string>({
      query: (projectId) => `/admin/projects/${projectId}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    updateTaskStatus: builder.mutation<any, { projectId: string; taskId: string; status: string }>({
      query: ({ projectId, taskId, status }) => ({
        url: `/admin/projects/${projectId}/tasks/${taskId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    updatePartnerTier: builder.mutation<any, { companyId: string; tier: number }>({
      query: ({ companyId, tier }) => ({
        url: `/admin/partners/${companyId}/tier`,
        method: 'PATCH',
        body: { tier },
      }),
      invalidatesTags: (result, error, { companyId }) => [{ type: 'Partners', id: companyId }, 'Partners'],
    }),
    getPartnerQuotes: builder.query<any, string>({
      query: (companyId) => `/admin/partners/${companyId}/quotes`,
      providesTags: (result, error, id) => [{ type: 'Partners', id: `quotes-${id}` }],
    }),
    uploadAdminDocument: builder.mutation<any, { projectId: string; file: File }>({
      query: ({ projectId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/admin/projects/${projectId}/documents`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    uploadAdminPhoto: builder.mutation<any, { projectId: string; file: File }>({
      query: ({ projectId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/admin/projects/${projectId}/photos`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    getAdminDocuments: builder.query<any, string>({
      query: (projectId) => `/admin/projects/${projectId}/documents`,
      providesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
    getAdminPhotos: builder.query<any, string>({
      query: (projectId) => `/admin/projects/${projectId}/photos`,
      providesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
  useGetSTCustomersQuery,
  useAssignSTCustomerMutation,
  useRemoveSTCustomerMutation,
  useGetAllProjectsQuery,
  useUpdateProjectPhaseMutation,
  useGetProjectByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdatePartnerTierMutation,
  useGetPartnerQuotesQuery,
  useUploadAdminDocumentMutation,
  useUploadAdminPhotoMutation,
  useGetAdminDocumentsQuery,
  useGetAdminPhotosQuery,
} = adminApi;

