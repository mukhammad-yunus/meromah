import { data } from "react-router-dom";
import { baseApi } from "./baseApi";

const questionTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionTypes: builder.query({
      query: () => "question-types",
      transformResponse: (response) => {
        const result = {
          data: [],
        };

        response.data.forEach((item) => {
          result[item.name] = {
            id: item.id,
            type: item.name,
            label: item.description,
          };
          if (item.name === "mcq" || item.name === "code") {
            result.data.push({ type: item.name, label: item.description });
          }
        });
        return result;
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetQuestionTypesQuery } = questionTypesApi;
