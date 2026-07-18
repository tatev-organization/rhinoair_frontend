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
  }),
});

export const { useGetMyProjectsQuery, useGetProjectByIdQuery } = projectsApi;
