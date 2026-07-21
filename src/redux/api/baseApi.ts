import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as RootState).auth.token;
      
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken');
      }

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Quote', 'Project', 'Partners', 'Pricing', 'Invoice'],
  endpoints: () => ({}),
});
