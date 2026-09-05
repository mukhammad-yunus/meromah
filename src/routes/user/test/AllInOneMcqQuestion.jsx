import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSubmission,
  removeOption,
  setSubmission,
} from "../../../app/testSessionSlice";

const AllInOneMcqQuestion = ({ question }) => {
  const dispatch = useDispatch();
  const { submission } = useSelector((state) => state.testSession);

  const selectedArray = useMemo(
    () => new Set(submission[question.id] ?? []),
    [submission, question]
  );

  useEffect(() => {
    if (submission[question.id] !== undefined) return;
    dispatch(
      initializeSubmission({
        question_id: question.id,
        question_type: "mcq",
      })
    );
  }, [question, dispatch, submission]);

  const handleSetOption = ({ option_id }) => {
    dispatch(
      setSubmission({
        question_id: question.id,
        question_type: "mcq",
        option_id,
      })
    );
  };

  const handleRemoveOption = ({ option_id }) => {
    dispatch(removeOption({ question_id: question.id, option_id }));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-3">
        Select all that apply
      </p>
      {question.options?.map((opt) => {
        const isSelected = selectedArray.has(opt.id);
        return (
          <label
            key={`${opt.question_id}-${opt.id}`}
            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800/50"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
          >
            <div
              className={`w-5 h-5 min-w-5 min-h-5 border-2 rounded-sm flex items-center justify-center transition-colors
                ${
                  isSelected
                    ? "border-neutral-600 dark:border-neutral-400 bg-neutral-600 dark:bg-neutral-400"
                    : "border-neutral-400 dark:border-neutral-600"
                }`}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
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
              className={`${
                isSelected
                  ? "font-medium text-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {opt.body}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default AllInOneMcqQuestion;

