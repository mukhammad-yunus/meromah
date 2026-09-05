import React from "react";
import TestMarkdownViewer from "../../../components/markdownViewer/TestMarkdownViewer";

const McqResult = ({ question, questionNum, result, selectedOptions }) => {
  return (
    <div
      key={question.id}
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-white dark:bg-neutral-900/30"
    >
      {/* Question header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-full text-base font-medium leading-snug">
          <div className="flex">
            <p className="pr-4 font-medium text-neutral-600 dark:text-neutral-300">
              {questionNum}.
            </p>
            {Array.isArray(result.missed_options) &&
            result.missed_options.length > 0 ? (
              <p className="font-semibold text-red-500 select-none">Missed</p>
            ) : result.success ? (
              <p className="font-semibold text-green-500 select-none">
                Correct
              </p>
            ) : (
              <p className="font-semibold text-red-500 select-none">
                Incorrect
              </p>
            )}
          </div>
          <TestMarkdownViewer>{question.body}</TestMarkdownViewer>
        </div>
      </div>

      {/* Answers */}
      <div>
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedOptions.has(option.id);
            const isCorrect =
              Array.isArray(result.correct_options) &&
              result.correct_options.includes(option.id);
            const isIncorrect = Object.values(
              result.incorrect_options,
            ).includes(option.id);
            const isMissed =
              Array.isArray(result.missed_options) &&
              result.missed_options.includes(option.id);

            return (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-2 rounded-md border text-sm transition
                    ${
                      isCorrect
                        ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                        : isIncorrect
                          ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                          : isMissed
                            ? "border-green-400 bg-green-50/50 dark:bg-green-950/10"
                            : "border-neutral-200 dark:border-neutral-800"
                    }`}
              >
                <div
                  className={`min-w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors
                      ${
                        isCorrect
                          ? "border-green-600 bg-green-600"
                          : isIncorrect
                            ? "border-red-600 bg-red-600"
                            : isMissed
                              ? "border-green-600 bg-white dark:bg-neutral-900"
                              : "border-neutral-400"
                      }`}
                >
                  {(isSelected || isMissed) && (
                    <svg
                      className={`w-3 h-3 ${
                        isCorrect
                          ? "text-white"
                          : isIncorrect
                            ? "text-white"
                            : isMissed
                              ? "text-green-600"
                              : ""
                      }`}
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
                <span
                  className={`${
                    isCorrect || isMissed
                      ? "font-medium text-green-700 dark:text-green-400"
                      : isIncorrect
                        ? "font-medium text-red-700 dark:text-red-400"
                        : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {option.body}
                </span>
                {(isMissed || isCorrect) && (
                  <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                    (Correct answer)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default McqResult;
