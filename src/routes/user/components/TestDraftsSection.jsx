import React, { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import RelativeTime from "../../../components/RelativeTime";
import {
  useDeleteTestMutation,
  useLazyGetTestFromDescByIdQuery,
} from "../../../services/testsApi";
import { useLazyGetQuestionsForTestQuery } from "../../../services/questionsApi";
import { useDispatch } from "react-redux";
import {
  setDescName,
  setDraftTestId,
  setIsPopUp,
} from "../../../app/createTestSlice";
import { normalizeDraftTestData } from "../../../utils";

const TestDraftsSection = ({
  setDraftTest,
  onShowDrafts,
  draftTests,
  questionTypes,
}) => {
  const closeRef = useRef(null);
  const [getTest] = useLazyGetTestFromDescByIdQuery();
  const dispatch = useDispatch();
  const [getQuestions] = useLazyGetQuestionsForTestQuery();
  const [deleteDraftTest] = useDeleteTestMutation();
  const onDraftSelect = async (e, item) => {
    e.preventDefault();
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
      dispatch(setIsPopUp(true));
      dispatch(setDraftTestId(test.id));
      dispatch(setDescName(test.desc));
      setDraftTest(test);
      onShowDrafts(e);
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
    setDraftTest(null);
  };
  useEffect(() => {
    if (Array.isArray(draftTests?.data) && draftTests.data.length > 0) return;
    closeRef.current.click();
  }, [draftTests]);

  return (
    <div className="flex items-start justify-center">
      <div className="w-full flex flex-col gap-4">
        <button
          type="button"
          onClick={onShowDrafts}
          ref={closeRef}
          className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 focus:outline-none w-fit transition-colors"
        >
          <ChevronLeft className="text-2xl cursor-pointer" />
          <span className="cursor-pointer">Close</span>
        </button>

        <header>
          <h3 className="text-lg font-semibold text-neutral-900">
            Select a draft test
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Choose one of your saved drafts to load into the form
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {/* Drafts list */}
          <ul className="space-y-3" role="listbox" aria-label="Draft tests">
            {draftTests?.data.map((d) => (
              <li
                key={d.id}
                role="option"
                aria-selected="false"
                data-draft-id={d.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline gap-1 justify-between md:justify-start">
                        <span className="text-base font-semibold text-neutral-900 truncate">
                          {d.title}
                        </span>
                        <RelativeTime
                          date={d.created_at}
                          className="text-xs font-light opacity-50 whitespace-nowrap"
                        />
                      </p>
                      <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                        {d.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:gap-6">
                  {/* <div className="text-xs text-neutral-400">
                    
                    <span className="block text-neutral-500 mt-0.5">
                      by {d.author?.username}
                    </span>
                  </div> */}

                  <button
                    type="button"
                    onClick={(e) => onDraftRemove(e, d)}
                    className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline focus:outline-none transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDraftSelect(e, d)}
                    className="text-sm px-4 py-2 rounded-md bg-primary-blue text-white hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestDraftsSection;
