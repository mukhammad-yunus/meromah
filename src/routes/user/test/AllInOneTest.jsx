import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import {
  initializeSubmission,
  completeTest,
  resetSession,
} from "../../../app/testSessionSlice";
import { usePostTestSubmitMutation, usePostTestQuitMutation } from "../../../services/testsApi";
import TestMarkdownViewer from "../../../components/markdownViewer/TestMarkdownViewer";
import Toast from "../../../components/Toast";
import AllInOneMcqQuestion from "./AllInOneMcqQuestion";
import AllInOneCodeQuestion from "./AllInOneCodeQuestion";

export const AllInOneTest = () => {
  const { descId, testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { questions, submission, test, questionTypes, meta } = useSelector(
    (state) => state.testSession
  );
  const [submitTest, { isLoading: isSubmitting }] = usePostTestSubmitMutation();
  const [quitTest] = usePostTestQuitMutation();
  const [isQuitModal, setIsQuitModal] = useState(false);
  const [isSubmitModal, setIsSubmitModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState({ hasError: false, message: null });

  // Calculate skipped questions
  const skippedQuestions = useMemo(() => {
    return questions.filter((question) => {
      const questionType = questionTypes[question.question_type_id];
      const currentSubmission = submission[question.id];
      
      if (!currentSubmission) return true;
      
      if (questionType?.type === "mcq") {
        // MCQ is skipped if no options are selected
        return !Array.isArray(currentSubmission) || currentSubmission.length === 0;
      } else if (questionType?.type === "code") {
        // Code is skipped if empty or just placeholder/template
        const code = typeof currentSubmission === "string" ? currentSubmission.trim() : "";
        if (!code || code.length === 0) return true;
        
        // Check if it's just the default placeholder
        if (/^#\s*Write your solution here\s*$/i.test(code)) return true;
        
        // Check if it's just the default template
        if (question?.signature) {
          const defaultTemplate = `def ${question.signature.signature}(${Array.from({
            length: question.signature.arg_nums,
          })
            .map((_, i) => `arg${i + 1}`)
            .join(", ")}):\n\t# Write your solution here`;
          if (code.trim() === defaultTemplate.trim()) return true;
        }
        
        return false;
      }
      return true;
    });
  }, [questions, questionTypes, submission]);

  const handleSubmit = useCallback(async () => {
    try {
      const results = await submitTest({
        desc: descId,
        test: testId,
        bodyData: { submission },
      }).unwrap();
      dispatch(completeTest({ results }));
    } catch (err) {
      setError({ hasError: true, message: err.data?.message || "Failed to submit test" });
    }
  }, [submitTest, descId, testId, submission, dispatch]);

  const handleSubmitClick = () => {
    if (skippedQuestions.length > 0) {
      setIsSubmitModal(true);
    } else {
      handleSubmit();
    }
  };

  // Timer logic
  useEffect(() => {
    if (!test.duration || !meta.startedAt) return;
    const startTime = meta.startedAt;
    const durationMs = test.duration * 60 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [test.duration, meta.startedAt, handleSubmit]);

  const minutes = Math.floor((timeRemaining || 0) / 60);
  const seconds = (timeRemaining || 0) % 60;
  const isUrgent = timeRemaining !== null && timeRemaining < 60;
  const timerStyles = isUrgent
    ? "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900"
    : "text-neutral-700 bg-white border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700";

  // Initialize submissions for all questions
  useEffect(() => {
    questions.forEach((question) => {
      if (submission[question.id] === undefined) {
        const questionType = questionTypes[question.question_type_id];
        dispatch(
          initializeSubmission({
            question_id: question.id,
            question_type: questionType?.type === "code" ? "code" : "mcq",
            value:
              questionType?.type === "code" && question?.signature
                ? `def ${question.signature.signature}(${Array.from({
                    length: question.signature.arg_nums,
                  })
                    .map((_, i) => `arg${i + 1}`)
                    .join(", ")}):\n\t# Write your solution here`
                : questionType?.type === "code"
                ? "# Write your solution here"
                : [],
          })
        );
      }
    });
  }, [questions, questionTypes, dispatch]);

  const handleQuit = async () => {
    try {
      await quitTest({ desc: descId, test: testId }).unwrap();
      dispatch(resetSession());
      navigate(-1);
    } catch (err) {
      console.error("Failed to quit:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {test.title}
            </h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              All Questions ({questions.length})
            </span>
          </div>
          <div className="flex items-center gap-4">
            {test.duration !== null && (
              <div
                className={`px-3 py-1.5 rounded-md border text-sm font-mono font-medium transition-colors ${timerStyles}`}
              >
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </div>
            )}
            <button
              onClick={() => setIsQuitModal(true)}
              className="px-5 py-2 font-medium text-red-500 border border-red-500 rounded dark:bg-red-500 dark:text-neutral-100 dark:border-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-100 dark:hover:text-red-600 dark:hover:border-red-100 transition-colors"
            >
              Quit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {questions.map((question, index) => {
          const questionType = questionTypes[question.question_type_id];
          const currentSubmission = submission[question.id] ?? [];

          return (
            <div
              key={question.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-neutral-50/30 dark:bg-neutral-900/30"
            >
              {/* Question Header */}
              <div className="flex items-start gap-2 justify-between mb-4">
                <div className="flex gap-3 flex-1">
                  <p className="w-8 h-8 min-h-8 min-w-8 flex items-center justify-center text-sm font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {index + 1}
                  </p>
                </div>
              </div>

              {/* Question Body */}
              <div className="mb-4">
                <TestMarkdownViewer>{question.body}</TestMarkdownViewer>
              </div>

              {/* Answers */}
              <div className="pl-11">
                {questionType?.type === "mcq" && question.options ? (
                  <AllInOneMcqQuestion question={question} />
                ) : questionType?.type === "code" ? (
                  <AllInOneCodeQuestion
                    question={question}
                    currentSubmission={currentSubmission}
                    onError={setError}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {skippedQuestions.length > 0 && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              {skippedQuestions.length} question{skippedQuestions.length !== 1 ? "s" : ""} not answered
            </div>
          )}
          <div className={skippedQuestions.length > 0 ? "ml-auto" : ""}>
            <Button
              variant="primary"
              onClick={handleSubmitClick}
              className="px-6 py-2 text-sm font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
        </div>
      </footer>

      {/* Quit Modal */}
      {isQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Quit Test?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Are you sure you want to quit? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsQuitModal(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleQuit}
                className="px-4 py-2"
              >
                Quit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Warning Modal */}
      {isSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Warning: Unanswered Questions
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              You have {skippedQuestions.length} unanswered question{skippedQuestions.length !== 1 ? "s" : ""}. Are you sure you want to submit the test?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsSubmitModal(false)}
                className="px-4 py-2"
              >
                Go Back
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsSubmitModal(false);
                  handleSubmit();
                }}
                className="px-4 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Anyway"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error.hasError && (
        <Toast
          message={error.message}
          onClose={() => setError({ hasError: false, message: null })}
          key={"all-in-one-error"}
          time={10000}
          type="error"
        />
      )}
    </div>
  );
};

