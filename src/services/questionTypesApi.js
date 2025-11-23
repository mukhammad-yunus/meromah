import { baseApi } from "./baseApi";

const questionTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionTypes: builder.query({
      query: () => "question-types",
    }),
  }),
  overrideExisting: true,
});

export const { useGetQuestionTypesQuery } = questionTypesApi;
