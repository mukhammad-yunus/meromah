import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetQuestionTypesQuery } from "../../../services/questionTypesApi";
import { Button } from "./Button";
import Loading from "../../../components/Loading";
import { CheckCircle, Edit3 } from "lucide-react";
import { completeTest, jumpToQuestion } from "../../../app/testSessionSlice";
import { usePostTestSubmitMutation } from "../../../services/testsApi";
import { useParams } from "react-router-dom";
import TestMarkdownViewer from "../../../components/markdownViewer/TestMarkdownViewer";

export const ReviewAnswers = () => {
  const { descId, testId } = useParams();
  const { questions, submission, test, questionTypes } = useSelector(
    (state) => state.testSession,
  );
  const dispatch = useDispatch();

  const [submitYourAnswers, { isLoading }] = usePostTestSubmitMutation();
  const handleSubmit = async () => {
    try {
      const results = await submitYourAnswers({
        desc: descId,
        test: testId,
        bodyData: { submission },
      }).unwrap();
      dispatch(completeTest({ results }));
    } catch (err) {}
  };

  const handleEdit = (questionId, questionIndex) => {
    dispatch(jumpToQuestion({ questionIndex, newStatus: "edit" }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Review Your Answers
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {test.title}
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6">
        {/* Banner */}
        <div className="mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1 text-neutral-900 dark:text-neutral-100">
              Review before submitting
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              You can edit any answer before final submission.
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((question, index) => {
            const questionType = questionTypes[question.question_type_id];
            const currentSubmission = submission[question.id] ?? [];
            const selectedOptions = Array.isArray(currentSubmission)
              ? new Set(currentSubmission)
              : new Set();

            return (
              <div
                key={question.id}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-neutral-50/30 dark:bg-neutral-900/30"
              >
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex gap-3 flex-1">
                    <p className="w-8 h-8 min-h-8 min-w-8 flex items-center justify-center text-sm font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {index + 1}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(question.id, index)}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded px-1 py-0.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
                {/* Question header */}
                <div className="text-neutral-800 dark:text-neutral-200 m-6">
                  <TestMarkdownViewer>{question.body}</TestMarkdownViewer>
                </div>
                {/* Answers */}
                <div className="pl-11">
                  {questionType?.type === "mcq" && question.options ? (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isSelected = selectedOptions.has(option.id);
                        return (
                          <div
                            key={option.id}
                            className={`flex items-center gap-3 p-2 rounded-md border text-sm transition-colors
                              ${
                                isSelected
                                  ? "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800/50"
                                  : "border-neutral-200 dark:border-neutral-700"
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
                            <span
                              className={`${
                                isSelected
                                  ? "font-medium text-neutral-800 dark:text-neutral-100"
                                  : "text-neutral-600 dark:text-neutral-300"
                              }`}
                            >
                              {option.body}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : questionType?.type === "code" ? (
                    <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md text-sm font-mono">
                      {currentSubmission ? (
                        <pre className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words">
                          {currentSubmission}
                        </pre>
                      ) : (
                        <span className="italic text-neutral-400 dark:text-neutral-500">
                          No code submitted
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto flex justify-end">
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium"
            disabled={isLoading}
          >
            Submit Test
          </Button>
        </div>
      </footer>
    </div>
  );
};
