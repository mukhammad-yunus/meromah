import { baseApi } from "./baseApi";

const PrivateDsaDatasetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /tests/{test}/questions/{question}/testcases
    getDatasetsForQuestion: builder.query({
      query: ({ test, question }) => `/tests/${test}/questions/${question}/testcases`,
    }),

    // GET /tests/{test}/questions/{question}/testcases/{testcase}
    getDatasetFromQuestionById: builder.query({
      query: ({ test, question, testcase }) => `/tests/${test}/questions/${question}/testcases/${testcase}`,
    }),

    // POST /tests/{test}/questions/{question}/testcases
    createDataset: builder.mutation({
      query: ({ test, question, bodyData }) => ({
        url: `/tests/${test}/questions/${question}/testcases`,
        method: "POST",
        body: bodyData,
      }),
    }),

    // PUT /tests/{test}/questions/{question}/testcases/{testcase}
    updateDataset: builder.mutation({
      query: ({ test, question, testcase, bodyData }) => ({
        url: `/tests/${test}/questions/${question}/testcases/${testcase}`,
        method: "PUT",
        body: bodyData,
      }),
    }),

    // DELETE /tests/{test}/questions/{question}/testcases/{testcase}
    deleteDataset: builder.mutation({
      query: ({ test, question, testcase }) => ({
        url: `/tests/${test}/questions/${question}/testcases/${testcase}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDatasetsForQuestionQuery,
  useGetDatasetFromQuestionByIdQuery,
  useCreateDatasetMutation,
  useUpdateDatasetMutation,
  useDeleteDatasetMutation,
} = PrivateDsaDatasetsApi;


