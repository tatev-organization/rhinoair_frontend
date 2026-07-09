import { baseApi } from '../../api/baseApi';
import { setCredentials, setUser } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken) {
            dispatch(setCredentials({ accessToken: data.accessToken }));
            // We can also fetch the profile right after login if needed, 
            // but usually it's handled by the layout or dashboard wrapper
          }
        } catch (err) {
          // Handle error gracefully if needed
        }
      },
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
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Profile'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setUser(data));
          }
        } catch (err) {
          // Handle error
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
