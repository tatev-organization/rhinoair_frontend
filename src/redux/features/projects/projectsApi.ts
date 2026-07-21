import { baseApi } from '../../api/baseApi';

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProjects: builder.query<any, void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query<any, string>({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    uploadDocument: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, formData) => [
        { type: 'Project', id: formData.get('projectId') as string },
      ],
    }),
  }),
});

export const { useGetMyProjectsQuery, useGetProjectByIdQuery, useUploadDocumentMutation } = projectsApi;
