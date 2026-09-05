import React, { useState } from "react";
import {
  useDeleteTestMutation,
  useGetTestAllDraftsQuery,
  useLazyGetTestFromDescByIdQuery,
} from "../../services/testsApi";
import { ChevronLeft } from "lucide-react";
import RelativeTime from "../../components/RelativeTime";
import { useDispatch } from "react-redux";
import { useLazyGetQuestionsForTestQuery } from "../../services/questionsApi";
import {
  setDescName,
  setDraftTestData,
  setDraftTestId,
  setIsPopUp,
} from "../../app/createTestSlice";
import { useNavigate } from "react-router-dom";
import { normalizeDraftTestData } from "../../utils";
import { useGetQuestionTypesQuery } from "../../services/questionTypesApi";

const TestDrafts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processingItemId, setProcessingItemId] = useState(null)
  const { data: drafts } = useGetTestAllDraftsQuery();
  const { data: questionTypes } = useGetQuestionTypesQuery();

  const [getTest] = useLazyGetTestFromDescByIdQuery();
  const [getQuestions] = useLazyGetQuestionsForTestQuery();
  const [deleteDraftTest] = useDeleteTestMutation();
  const onDraftSelect = async (e, item) => {
    e.preventDefault();
    setProcessingItemId(item.id)
    try {
      const res_Test = await getTest({
        desc: item.desc.name,
        test: item.id,
      }).unwrap();
      const res_Questions = await getQuestions({
        test: res_Test.data.id,
      }).unwrap();

      const test = normalizeDraftTestData({
        item,
        testData: res_Test.data,
        questionData: res_Questions.data,
        questionTypes,
      });
      dispatch(setIsPopUp(false));
      dispatch(setDraftTestId(test.id));
      dispatch(setDraftTestData(test));
      dispatch(setDescName(null));
      navigate("/create/test?from=drafts", {replace: true});
    } catch (err) {
      console.error(err);
    }
  };
  const onDraftRemove = async (e, item) => {
    e.preventDefault();
    await deleteDraftTest({
      desc: item.desc.name,
      test: item.id,
    }).unwrap();
  };
  return (
    <section className="flex flex-col justify-between bg-white dark:bg-neutral-900 h-full gap-4 p-6 w-full">
      <div className="w-full flex flex-col gap-4">
        <button
          type="button"
          className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none w-fit transition-colors"
          onClick={()=>navigate(-1)}
        >
          <ChevronLeft className="text-2xl cursor-pointer" />
          <span className="cursor-pointer">Back</span>
        </button>

        <header>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Select a draft test
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Choose one of your saved drafts to load into the form
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {/* Drafts list */}
          <ul className="space-y-3" role="listbox" aria-label="Draft tests">
            {drafts?.data.map((d) => (
              <li
                key={d.id}
                role="option"
                aria-selected="false"
                data-draft-id={d.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all
                  ${processingItemId === d.id && "animate-pulse"}
                  `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline gap-1 justify-between md:justify-start">
                        <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {d.title}
                        </span>
                        <RelativeTime
                          date={d.created_at}
                          className="text-xs font-light opacity-50 dark:opacity-60 whitespace-nowrap"
                        />
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                        {d.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:gap-6">
                  <button
                    type="button"
                    disabled = {processingItemId === d.id }
                    onClick={(e) => onDraftRemove(e, d)}
                    className="text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 hover:underline focus:outline-none transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    disabled = {processingItemId === d.id }
                    onClick={(e) => onDraftSelect(e, d)}
                    className="text-sm px-4 py-2 rounded-md bg-primary-blue text-white hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    Select
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TestDrafts;
