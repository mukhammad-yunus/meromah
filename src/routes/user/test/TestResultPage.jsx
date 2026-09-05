import React from "react";
import { Button } from "./Button";
import { useDispatch, useSelector } from "react-redux";
import McqResult from "./McqResult";
import CodeResult from "./CodeResult";
import { useNavigate, useParams } from "react-router-dom";
import { resetSession } from "../../../app/testSessionSlice";

export const TestResultPage = () => {
  const { descId, testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { results, questionIdToIndex, questions, questionTypes, submission } =
    useSelector((state) => state.testSession);
  const gradeColor = (percentage) =>
    percentage >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : percentage >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
  const onReturnTestPage = () => {
    dispatch(resetSession())
    navigate(`/d/${descId}/test/${testId}`);
  };
  return (
    <div className="min-h-screen p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 text-center transition-colors">
          <h1 className="text-xl font-medium text-neutral-500 dark:text-neutral-400 mb-4 uppercase tracking-wide">
            Assessment Complete
          </h1>
          <div
            className={`text-6xl sm:text-7xl font-bold mb-4 ${gradeColor(
              results.score
            )}`}
          >
            {Number(results.score).toFixed(2)}%
          </div>
          <p className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300 text-lg">
            <span>You scored</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {results.num_correct_answers}
            </span>
            <span>out of {questions.length} points</span>
          </p>
          <div className="mt-8">
            <Button
              variant="primary"
              onClick={onReturnTestPage}
              className="px-8 py-3"
            >
              Return to the Test Page
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white px-1">
            Detailed Review
          </h2>
          {questions.map((question, index) => {
            const questionType = questionTypes[question.question_type_id];
            const currentSubmission = submission[question.id] ?? [];
            const result = results.data[question.id];
            const selectedOptions = Array.isArray(currentSubmission)
              ? new Set(currentSubmission)
              : new Set();
            return questionType.type === "mcq" ? (
              <McqResult
                question={question}
                questionNum={index + 1}
                result={result}
                selectedOptions={selectedOptions}
                key={question.body}
              />
            ) : (
              <CodeResult
                question={question}
                questionNum={index + 1}
                result={result}
                currentSubmission={currentSubmission}
                key={question.body}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
