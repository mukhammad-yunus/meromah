import { baseApi } from "./baseApi";

const PrivateDsaArgumentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /tests/{test}/questions/{question}/testcases/{testcase}/arguments
    getArgumentsForDataset: builder.query({
      query: ({ test, question, testcase }) => `/tests/${test}/questions/${question}/testcases/${testcase}/arguments`,
    }),

    // GET /tests/{test}/questions/{question}/testcases/{testcase}/arguments/{argument}
    getArgumentFromDatasetById: builder.query({
      query: ({ test, question, testcase, argument }) => `/tests/${test}/questions/${question}/testcases/${testcase}/arguments/${argument}`,
    }),

    // POST /tests/{test}/questions/{question}/testcases/{testcase}/arguments
    createArgument: builder.mutation({
      query: ({ test, question, testcase, bodyData }) => ({
        url: `/tests/${test}/questions/${question}/testcases/${testcase}/arguments`,
        method: "POST",
        body: bodyData,
      }),
    }),

    // PUT /tests/{test}/questions/{question}/testcases/{testcase}/arguments/{argument}
    updateArgument: builder.mutation({
      query: ({ test, question, testcase, argument, bodyData }) => ({
        url: `/tests/${test}/questions/${question}/testcases/${testcase}/arguments/${argument}`,
        method: "PUT",
        body: bodyData,
      }),
    }),

    // DELETE /tests/{test}/questions/{question}/testcases/{testcase}/arguments/{argument}
    deleteArgument: builder.mutation({
      query: ({ test, question, testcase, argument }) => ({
        url: `/tests/${test}/questions/${question}/testcases/${testcase}/arguments/${argument}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetArgumentsForDatasetQuery,
  useGetArgumentFromDatasetByIdQuery,
  useCreateArgumentMutation,
  useUpdateArgumentMutation,
  useDeleteArgumentMutation,
} = PrivateDsaArgumentsApi;


