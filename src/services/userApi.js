import { baseApi } from "./baseApi";

const PublicUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserByUsername: builder.query({
      query: (username) => ({
        url: `/users/${username}`,
      }),
    }),
  }),
});

const PrivateUserSelfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // main details related e.g. name, email, username
    getMe: builder.query({
      query: () => "/me",
      providesTags: [{type:'Profile', id: 'getMe'}]
    }),
    updateMe: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me",
        method: "PUT",
        body: bodyData,
      }),
      invalidatesTags: [{type:'Profile', id: 'getMe'}]
    }),

    //profile related e.g. bio, birthday, socials
    getMyProfile: builder.query({
      query: () => "/me/profile",
      providesTags: [{type:'Profile', id: 'getMyProfile'}]
    }),
    updateMyProfile: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile",
        method: "PUT",
        body: bodyData,
      }),
      invalidatesTags: [{type:'Profile', id: 'getMyProfile'}, {type:'Profile', id: 'getMe'}]
    }),

    // Avatar management
    updateMyAvatar: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile/avatar",
        method: "POST",
        body: bodyData,
      }),
      invalidatesTags: [{type:'Profile', id: 'getMe'}]
    }),
    deleteMyAvatar: builder.mutation({
      query: () => ({
        url: "/me/profile/avatar",
        method: "DELETE",
      }),
      invalidatesTags: [{type:'Profile', id: 'getMe'}]
    }),

    // Banner management
    updateMyBanner: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile/banner",
        method: "POST",
        body: bodyData,
      }),
      invalidatesTags: [{type:'Profile', id: 'getMyProfile'}]
    }),
    deleteMyBanner: builder.mutation({
      query: () => ({
        url: "/me/profile/banner",
        method: "DELETE",
      }),
      invalidatesTags: [{type:'Profile', id: 'getMyProfile'}]
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,

  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUpdateMyAvatarMutation,
  useDeleteMyAvatarMutation,
  useUpdateMyBannerMutation,
  useDeleteMyBannerMutation,
} = PrivateUserSelfApi;

export const { 
  useGetUserByUsernameQuery,
} = PublicUserApi;
