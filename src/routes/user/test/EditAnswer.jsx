import React, { useState, useEffect, useMemo } from "react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import QuestionRenderer from "./QuestionRenderer";
import {
  enterReview,
  goToNextQuestion,
  goToPreviousQuestion,
  setOriginalSubmission,
} from "../../../app/testSessionSlice";

export const EditAnswer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { test, questions, currentIndex, submission } = useSelector(
    (state) => state.testSession
  );
  const originalSubmission = useMemo(() => {
    const question = questions[currentIndex]
    const id = question.id
    return {data: submission[id], id};
  }, []);
  const [disabled, setDisabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const handleNext = () => {
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
      dispatch(enterReview());
    }, 300);
  };

  const handleCancel = () => {
    dispatch(setOriginalSubmission(originalSubmission))
    dispatch(enterReview());
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isUrgent = timeRemaining < 60;
  const timerStyles = isUrgent
    ? "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900"
    : "text-neutral-700 bg-white border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700";
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[150px] sm:max-w-xs">
              {test.title}
            </h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {test.duration !== null && (
            <div
              className={`px-3 py-1.5 rounded-md border text-sm font-mono font-medium transition-colors ${timerStyles}`}
            >
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <QuestionRenderer />
      </main>

      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 transition-colors">
        <div className="max-w-3xl mx-auto flex justify-between gap-4">
          <Button variant="outline" onClick={handleCancel} className="w-24">
            Cancel
          </Button>

          <Button
            variant={"primary"}
            onClick={handleNext}
            disabled={disabled}
            className="w-32 sm:w-40 disabled:animate-pulse appearance-none disabled:opacity-100"
          >
            Review and Submit
          </Button>
        </div>
      </footer>
    </div>
  );
};
