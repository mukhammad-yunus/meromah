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
    }),

    //profile related e.g. bio, birthday, socials
    getMyProfile: builder.query({
      query: () => "/me/profile",
    }),
    // updateMyProfile will create a new profile if it doesn't exist yet
    updateMyProfile: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile/updateSelf",
        method: "POST",
        body: bodyData,
      }),
    }),
    updateMyBanner: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile/banner",
        method: "POST",
        body: bodyData,
      }),
    }),
    deleteMyBanner: builder.mutation({
      query: () => ({
        url: "/me/profile/banner",
        method: "DELETE",
      }),
    }),
    updateMyAvatar: builder.mutation({
      query: ({ bodyData }) => ({
        url: "/me/profile/avatar",
        method: "POST",
        body: bodyData,
      }),
    }),
    deleteMyAvatar: builder.mutation({
      query: () => ({
        url: "/me/profile/avatar",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,

  useGetMyProfileQuery,
  useUpdateMyProfileMutation,

  useUpdateMyBannerMutation,
  useDeleteMyBannerMutation,
  useUpdateMyAvatarMutation,
  useDeleteMyAvatarMutation,
} = PrivateUserSelfApi;

export const { 
  useGetUserByUsernameQuery,
} = PublicUserApi;
