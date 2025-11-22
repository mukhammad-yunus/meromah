import { baseApi } from "./baseApi";

const toQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";
  return `?${new URLSearchParams(params).toString()}`;
};

const PrivateDescSubscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /desc/{desc}/subscribe - Subscribe to a desc
    subscribeToDesc: builder.mutation({
      query: ({ desc }) => ({
        url: `/desc/${desc}/subscribe`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { desc }) => [
        { type: "Desc", id: "desc-subscriptions" },
        { type: "Desc", id: "all-descs" },
      ],
    }),

    // DELETE /desc/{desc}/subscribe - Unsubscribe from a desc
    unsubscribeFromDesc: builder.mutation({
      query: ({ desc }) => ({
        url: `/desc/${desc}/subscribe`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { desc }) => [
        { type: "Desc", id: "desc-subscriptions" },
        { type: "Desc", id: "all-descs" },
      ],
    }),

    // GET /desc/{desc}/subscribers - Author-only list
    getDescSubscribersPrivileged: builder.query({
      query: ({ desc }) => ({
        url: `/desc/${desc}/subscribers`,
      }),
    }),

    // GET /desc-subscriptions/all - Admin list with filters
    getAllDescSubscriptionsPrivileged: builder.query({
      query: ({ queryParams }) => ({
        url: `/desc-subscriptions/all${toQueryString(queryParams)}`,
      }),
    }),

    // GET /desc-subscriptions/{descSubscription} - Admin detail
    getDescSubscriptionPrivileged: builder.query({
      query: ({ descSubscription }) => ({
        url: `/desc-subscriptions/${descSubscription}`,
      }),
    }),

    // POST /desc-subscriptions - Admin create
    createDescSubscriptionPrivileged: builder.mutation({
      query: ({ bodyData }) => ({
        url: `/desc-subscriptions`,
        method: "POST",
        body: bodyData,
      }),
    }),

    // GET /me/desc-subscriptions - Current user's desc subscriptions
    getMyDescSubscriptions: builder.query({
      query: () => ({
        url: `/me/desc-subscriptions`,
      }),
      providesTags: [{ type: "Desc", id: "desc-subscriptions" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSubscribeToDescMutation,
  useUnsubscribeFromDescMutation,
  useGetDescSubscribersPrivilegedQuery,
  useGetAllDescSubscriptionsPrivilegedQuery,
  useGetDescSubscriptionPrivilegedQuery,
  useCreateDescSubscriptionPrivilegedMutation,
  useGetMyDescSubscriptionsQuery,
} = PrivateDescSubscriptionsApi;
