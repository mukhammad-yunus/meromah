import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSubmission,
  removeOption,
  setSubmission,
} from "../../../app/testSessionSlice";
import TestMarkdownViewer from "../../../components/markdownViewer/TestMarkdownViewer";

const RenderMultiSelectMcqQuestion = () => {
  const dispatch = useDispatch();
  const { submission, currentIndex, questions } = useSelector(
    (state) => state.testSession
  );
  const question = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex]
  );
  const selectedArray = useMemo(
    () => new Set(submission[question.id] ?? []),
    [submission, question]
  );
  const handleSetOption = ({ option_id }) => {
    dispatch(
      setSubmission({
        question_id: question.id,
        question_type: "mcq",
        option_id,
      })
    );
  };
  useEffect(() => {
    if (submission[question.id] !== undefined) return
    dispatch(
      initializeSubmission({
        question_id: question.id,
        question_type: "mcq",
      })
    );
  }, [question, dispatch]);
  const handleRemoveOption = ({ option_id }) => {
    dispatch(removeOption({ question_id: question.id, option_id }));
  };
  return (
    <div className="space-y-8 dark:bg-neutral-950">
      <div className="space-y-2">
        <TestMarkdownViewer>{question.body}</TestMarkdownViewer>
        {/* <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 leading-snug">
          {question.body}
        </h2> */}
      </div>
      <main className="grid gap-3">
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium select-none">
          Select all that apply
        </p>
        {question.options?.map((opt) => {
          const isSelected = selectedArray.has(opt.id);
          return (
            <label
              key={`${opt.question_id}-${opt.id}`}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-indigo-200 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
            >
              <div
                className={`w-5 h-5 min-w-5 min-h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                          : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                      }`}
              >
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    handleRemoveOption({ option_id: opt.id });
                  } else {
                    handleSetOption({ option_id: opt.id });
                  }
                }}
                className="sr-only"
              />
              <span
                className={`ml-4 text-base ${
                  isSelected
                    ? "text-indigo-900 dark:text-indigo-100 font-medium"
                    : "text-neutral-800 dark:text-neutral-200"
                }`}
              >
                {opt.body}
              </span>
            </label>
          );
        })}
      </main>
    </div>
  );
};

export default RenderMultiSelectMcqQuestion;
