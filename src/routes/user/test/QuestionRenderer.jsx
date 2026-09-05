import React, { lazy, Suspense, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "../../../components/Loading";
import Toast from "../../../components/Toast";
const RenderCodeQuestion = lazy(() => import("./RenderCodeQuestion"));
const RenderMultiSelectMcqQuestion = lazy(() =>
  import("./RenderMultiSelectMcqQuestion")
);

const renders = {
  code: RenderCodeQuestion,
  mcq: RenderMultiSelectMcqQuestion,
};

const QuestionRenderer = () => {
  const [error, setError] = useState({
    hasError: false,
    message: null,
  });

  const { questions, currentIndex, questionTypes } = useSelector((state) => state.testSession);

  const question = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex]
  );

  const QuestionComponent = useMemo(() => {
    if (!questionTypes) return null;
    const questionType = questionTypes[question.question_type_id]
    return renders[questionType.type] ?? null;
  }, [questionTypes, question]);

  return (
    <Suspense fallback={<Loading />}>
      {QuestionComponent ? (
        <>
          <QuestionComponent onError={(err) => setError(err)} />
          {error.hasError ? (
            <Toast
              message={error.message}
              onClose={() => setError({ hasError: false, message: null })}
              key={"question-renderer"}
              type="error"
            />
          ) : null}
        </>
      ) : (
        <div className="text-red-600 font-medium">
          Something went wrong while rendering this question.
        </div>
      )}
    </Suspense>
  );
};

export default QuestionRenderer;
