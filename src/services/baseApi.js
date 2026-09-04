import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  return `${VITE_API_BASE_URL}/api`;
};

const baseBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'include', // Include cookies (HTTP-only) in every request
});

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseBaseQuery,
  tagTypes: ['Comments', 'Post', 'isAuthenticated', 'boardPosts', 'Board', 'Desc','Profile', 'Test'], 
  endpoints: () => ({}),
});
