import { baseApi } from '../../api/baseApi';
import { setUser } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (verificationData) => ({
        url: '/auth/verify',
        method: 'POST',
        body: verificationData,
      }),
    }),
    getMe: builder.query<any, string | undefined>({
      query: () => '/auth/me',
      providesTags: ['Profile'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // TransformInterceptor wraps response: { data: { companyId, ... } }
          const profile = data?.data ?? data;
          if (profile) {
            dispatch(setUser(profile));
          }
        } catch (err) {
          // handled by AuthWrapper
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
} = authApi;
