import { baseApi } from "./baseApi";

/*
This api is not complete yet. It will contain all board related endpoints,
both private and public.
*/

const toQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";
  return `?${new URLSearchParams(params).toString()}`;
};

const PrivateBoardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBoard: builder.mutation({
      query: (boardData) => ({
        url: "/boards",
        method: "POST",
        body: boardData,
      }),
    }),
    updateBoard: builder.mutation({
      query: ({ board, boardData }) => ({
        url: `/boards/${board}`,
        method: "PUT",
        body: boardData,
      }),
    }),
    deleteBoard: builder.mutation({
      query: ({ board }) => ({
        url: `/boards/${board}`,
        method: "DELETE",
      }),
    }),
    // check if a name available for a new board
    checkBoardNameIsAvailable: builder.query({
      query: (queryData) => ({
        url: `/boards/isBoardNameAvailable${toQueryString(queryData)}`,
      }),
    }),
    updateBoardBanner: builder.mutation({
      query: ({ board, boardData }) => ({
        url: `/boards/${board}/banner`,
        body: boardData,
        method: 'POST',
      }),
      invalidatesTags: (result, error, {board}) => [
        { type: "Board", id: `board-${board}` },
      ],
    }),
    deleteBoardBanner: builder.mutation({
      query: (board ) => ({
        url: `/boards/${board}/banner`,
        method: 'DELETE',
      }),
    }),
    updateBoardAvatar: builder.mutation({
      query: ({ board, boardData }) => ({
        url: `/boards/${board}/avatar`,
        body: boardData,
        method: 'POST',
      }),
      invalidatesTags: (result, error, {board}) => [
        { type: "Board", id: `board-${board}` },
      ],
    }),
    deleteBoardAvatar: builder.mutation({
      query: (board) => ({
        url: `/boards/${board}/avatar`,
        method: 'DELETE',
      }),
    }),
  }),
});
const PublicBoardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // get all boards
    getBoards: builder.query({
      query: (queryParams) => `/boards${toQueryString(queryParams)}`,
      providesTags: [{ type: "Board", id: "all-boards" }],
    }),
    getBoard: builder.query({
      query: (board) => `/boards/${board}`,
      providesTags: (result, error, board) => [
        { type: "Board", id: `board-${board}` },
      ],
    }),
    searchBoards: builder.query({
      query: (queryParams) => `/boards/search${toQueryString(queryParams)}`,
    }),
  }),
});

export const {
  useUpdateBoardMutation,
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useCheckBoardNameIsAvailableQuery,
  useUpdateBoardBannerMutation,
  useUpdateBoardAvatarMutation,
  useDeleteBoardBannerMutation,
  useDeleteBoardAvatarMutation
} = PrivateBoardApi;

export const { useGetBoardsQuery, useGetBoardQuery, useSearchBoardsQuery } = PublicBoardApi;
