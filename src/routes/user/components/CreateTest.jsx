import React, { useState, useMemo, useEffect } from "react";
import { useGetQuestionTypesQuery } from "../../../services/questionTypesApi";
import QuestionPreviewItem from "./QuestionPreviewItem";
import CreateCodeQuestion from "./testCodeType/CreateCodeQuestion";
import EditCodeQuestion from "./testCodeType/EditCodeQuestion";
import CreateTestHeader from "./CreateTestHeader";
import { useSelector } from "react-redux";
import NotFound from "../../../components/NotFound";
import {
  useGetTestDraftsForDescQuery,
  useUpdateTestMutation,
} from "../../../services/testsApi";
import EditMcqQuestion from "./testMcqType/EditMcqQuestion";
import CreateMcqQuestion from "./testMcqType/CreateMcqQuestion";
import TestDraftsSection from "./TestDraftsSection";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const CreateTest = ({ onCancel = undefined }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [draftTest, setDraftTest] = useState(null);
  const { isPopUp, descName, draftTestId, draftTestData } = useSelector(
    (state) => state.testMetadata
  );
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const { data: questionTypes } = useGetQuestionTypesQuery();
  const [updateTest] = useUpdateTestMutation();

  const initialQuestionData = useMemo(
    () => ({
      code: {
        type: "code",
        question_type_id: questionTypes ? questionTypes["code"]?.id : null,
        body: "",
        signature: { value: "", numberOfArguments: 1 },
        test_cases: [
          { expected_output: "" }, // at least one case
        ],
        arguments: [
          [], // arguments for case 0
        ],
      },
      mcq: {
        type: "mcq",
        question_type_id: questionTypes ? questionTypes["mcq"]?.id : null,
        body: "",
        options: [
          { body: "", is_correct: false },
          { body: "", is_correct: false }, // minimum 2 options
        ],
      },
    }),
    [questionTypes]
  );
  const testId = useMemo(
    () => (draftTest === null ? null : draftTest.id),
    [draftTest]
  );
  const { data: draftTests } = useGetTestDraftsForDescQuery(
    { desc: descName },
    { skip: !descName }
  );
  useEffect(() => {
    if (!isPopUp) return;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  useEffect(() => {
    if (!draftTestId) return;
    setDraftTest(draftTestData);
  }, [draftTestData, draftTestId]);
  const handleSelectQuestionType = (type) => {
    const template = initialQuestionData[type];
    if (template) {
      const clonedQuestion = JSON.parse(JSON.stringify(template));
      setCurrentQuestion(clonedQuestion);
      setIsEditMode(false);
    }
    setShowQuestionTypeSelector(false);
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleEditQuestion = (question) => {
    if (!question) return;
    setShowQuestionTypeSelector(false);
    setIsEditMode(true);
    if (
      question?.type === "code" ||
      question?.question_type_id == questionTypes.code.id
    ) {
      const normalizedTestCases =
        question.test_cases?.map((testCase) => ({
          id: testCase.id,
          expected_output: testCase.expected_output || "",
        })) || [];

      const signatureData = question.signature || {};
      const inferredArgLength = Math.max(
        signatureData.numberOfArguments || 0,
        ...normalizedTestCases.map((testCase) => {
          const argsForCase = (question.arguments || []).filter(
            (arg) => arg.test_case_id === testCase.id
          );
          return argsForCase.length;
        })
      );
      const resolvedArgLength = inferredArgLength || 1;

      const groupedArgs =
        normalizedTestCases.length > 0
          ? normalizedTestCases.map((testCase) => {
              const argsForCase = (question.arguments || [])
                .filter((arg) => arg.test_case_id === testCase.id)
                .sort(
                  (a, b) =>
                    (a.order ?? a.arg_order ?? 0) -
                    (b.order ?? b.arg_order ?? 0)
                )
                .map((arg) => arg.value || "");
              if (argsForCase.length === resolvedArgLength) {
                return argsForCase;
              }
              if (argsForCase.length === 0) {
                return Array.from({ length: resolvedArgLength }, () => "");
              }
              if (argsForCase.length > resolvedArgLength) {
                return argsForCase.slice(0, resolvedArgLength);
              }
              return [
                ...argsForCase,
                ...Array.from(
                  { length: resolvedArgLength - argsForCase.length },
                  () => ""
                ),
              ];
            })
          : [Array.from({ length: resolvedArgLength }, () => "")];

      setCurrentQuestion({
        id: question.id,
        type: "code",
        question_type_id: question.question_type_id,
        body: question.body || "",
        signature: {
          id: signatureData.id,
          value: signatureData.value || "",
          numberOfArguments: groupedArgs[0]?.length || resolvedArgLength,
        },
        test_cases:
          normalizedTestCases.length > 0
            ? normalizedTestCases
            : [{ expected_output: "" }],
        arguments: groupedArgs,
        originalTestCaseIds: normalizedTestCases
          .map((testCase) => testCase.id)
          .filter(Boolean),
      });
      return;
    } else if (
      question?.type === "mcq" ||
      question?.question_type_id == questionTypes.mcq.id
    ) {
      const normalizedOptions =
        question.options?.map((option) => ({
          id: option.id,
          body: option.body || "",
          is_correct: Boolean(option.is_correct),
        })) || [];

      setCurrentQuestion({
        id: question.id,
        type: "mcq",
        body: question.body || "",
        options:
          normalizedOptions.length > 0
            ? normalizedOptions
            : [
                { body: "", is_correct: false },
                { body: "", is_correct: false },
              ],
        originalOptionIds: normalizedOptions
          .map((option) => option.id)
          .filter(Boolean),
      });
    }
  };

  const handleQuestionModalCancel = () => {
    setCurrentQuestion(null);
    setIsEditMode(false);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTest({
        desc: Boolean(descName) ? descName : draftTest.desc,
        test: testId,
        testData: {
          status: "published",
        },
      }).unwrap();
      if (onCancel) {
        onCancel();
      } else if(!isPopUp && !onCancel){
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onResetTestForm = () => {
    setDraftTest(null);
    setQuestions([]);
    setCurrentQuestion(null);
    setShowQuestionTypeSelector(false);
    if (onCancel) {
      onCancel();
    }
  };
  const onCreateSuccess = (finalQuestion) => {
    const newQuestions = [...questions, finalQuestion];
    setQuestions(newQuestions);
    setDraftTest((prev) => ({ ...prev, questions: [...newQuestions] }));

    setCurrentQuestion(null);
    setIsEditMode(false);
  };

  const handleUpdateSuccess = (updatedQuestion) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === updatedQuestion.id ? updatedQuestion : question
      )
    );

    let draftFromLocalStorage = null;
    try {
      draftFromLocalStorage = JSON.parse(
        localStorage.getItem("unfinished-test")
      );
    } catch {
      draftFromLocalStorage = null;
    }

    if (draftFromLocalStorage?.questions) {
      draftFromLocalStorage.questions = draftFromLocalStorage.questions.map(
        (question) =>
          question.id === updatedQuestion.id ? updatedQuestion : question
      );
      draftFromLocalStorage.date = new Date().toISOString();
      setDraftTest(draftFromLocalStorage);
    }

    setCurrentQuestion(null);
    setIsEditMode(false);
  };
  const onShowDrafts = (e) => {
    e.preventDefault();
    
    if (isPopUp) {
      setIsDraftsOpen((prev) => !prev);
      return
    }
    navigate("/test/drafts", {replace: true})
  };
  if (!isAuthenticated) return <NotFound />;
  return (
    <form
      onSubmit={handleTestSubmit}
      className={
        isPopUp
          ? "flex flex-col items-center gap-4 fixed inset-0 z-50 p-4 bg-white/50 dark:bg-black/50 md:bg-black/30 backdrop-blur-lg"
          : ""
      }
    >
      <div
        className={`flex flex-col justify-between bg-white dark:bg-neutral-900 h-full gap-4 p-6 ${
          isPopUp
            ? "w-full md:max-w-3/4 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 md:m-6"
            : "w-full"
        }`}
      >
        {isDraftsOpen && isPopUp && (
          <TestDraftsSection
            setDraftTest={setDraftTest}
            draftTests={draftTests}
            onShowDrafts={onShowDrafts}
            questionTypes={questionTypes}
          />
        )}
        {!isDraftsOpen && (
          <>
              <div className="flex items-center justify-between mb-2 select-none">
                {isPopUp ? (
                  <p className="font-medium opacity-50 dark:text-neutral-400">d/{descName}</p>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none w-fit transition-colors"
                    onClick={() => navigate(-1)}
                  >
                    <ChevronLeft className="text-2xl cursor-pointer" />
                    <span className="cursor-pointer">Back</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPopUp && !draftTests?.data?.length}
                  onClick={onShowDrafts}
                  className="font-medium text-primary-blue dark:text-blue-400 rounded hover:underline focus:outline-none disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Drafts
                </button>
              </div>

            <div
              className={
                testId === null
                  ? "flex flex-col justify-between h-full"
                  : "h-full overflow-y-auto"
              }
            >
              <CreateTestHeader
                descId={descName}
                draftTest={draftTest}
                setDraftTest={setDraftTest}
                setQuestions={setQuestions}
                onCancel={onResetTestForm}
              />

              {testId !== null && (
                <>
                  {/* Questions Collector */}
                  <div className="flex flex-col gap-4 mt-6">
                    <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      Questions
                    </label>

                    {/* Display Existing Questions */}
                    {questions.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {questions.map((question, index) => (
                          <QuestionPreviewItem
                            questionTypes={questionTypes}
                            key={question.id}
                            question={question}
                            index={index}
                            onRemove={() => handleRemoveQuestion(question.id)}
                            onEdit={handleEditQuestion}
                            testId={testId}
                          />
                        ))}
                      </div>
                    )}

                    {/* Edit Mode */}
                    {currentQuestion !== null &&
                      testId !== null &&
                      isEditMode && (
                        <>
                          {currentQuestion.type === "code" ||
                          currentQuestion?.question_type_id ===
                            questionTypes.code.id ? (
                            <EditCodeQuestion
                              currentQuestion={currentQuestion}
                              setCurrentQuestion={setCurrentQuestion}
                              onUpdateSuccess={handleUpdateSuccess}
                              onCancel={handleQuestionModalCancel}
                              testId={testId}
                              questionTypeId={questionTypes["code"].id}
                              setIsEditMode={setIsEditMode}
                            />
                          ) : currentQuestion.type === "mcq" ||
                            currentQuestion?.question_type_id ===
                              questionTypes.mcq.id ? (
                            <EditMcqQuestion
                              currentQuestion={currentQuestion}
                              setCurrentQuestion={setCurrentQuestion}
                              onUpdateSuccess={handleUpdateSuccess}
                              onCancel={handleQuestionModalCancel}
                              testId={testId}
                              questionTypeId={questionTypes["mcq"].id}
                              setIsEditMode={setIsEditMode}
                            />
                          ) : null}
                        </>
                      )}

                    {/* Create Mode */}
                    {currentQuestion !== null &&
                      testId !== null &&
                      !isEditMode && (
                        <>
                          {currentQuestion.type === "code" ? (
                            <CreateCodeQuestion
                              currentQuestion={currentQuestion}
                              setCurrentQuestion={setCurrentQuestion}
                              onCreateSuccess={onCreateSuccess}
                              onUpdateSuccess={handleUpdateSuccess}
                              onCancel={handleQuestionModalCancel}
                              testId={testId}
                              questionTypeId={questionTypes["code"].id}
                              setIsEditMode={setIsEditMode}
                            />
                          ) : currentQuestion.type === "mcq" ? (
                            <CreateMcqQuestion
                              currentQuestion={currentQuestion}
                              setCurrentQuestion={setCurrentQuestion}
                              onCreateSuccess={onCreateSuccess}
                              onUpdateSuccess={handleUpdateSuccess}
                              onCancel={handleQuestionModalCancel}
                              testId={testId}
                              questionTypeId={questionTypes["mcq"].id}
                              setIsEditMode={setIsEditMode}
                            />
                          ) : (
                            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                              <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                  New Question - Multiple Choice
                                </span>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                  Question Body
                                </p>
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    type="button"
                                    className="px-4 py-2 rounded text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-600 transition-colors"
                                    onClick={() => setCurrentQuestion(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="px-4 py-2 rounded text-white bg-primary-blue hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-colors"
                                    onClick={() => {
                                      setQuestions((prev) => [
                                        ...prev,
                                        currentQuestion,
                                      ]);
                                      setCurrentQuestion(null);
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                    {/* Question Type Selector */}
                    {showQuestionTypeSelector && (
                      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                            {questions.length === 0
                              ? "Question 1 - Select question type"
                              : `Question ${
                                  questions.length + 1
                                } - Select question type`}
                          </label>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSelectQuestionType(e.target.value);
                                e.target.value = "";
                              }
                            }}
                            className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition cursor-pointer"
                          >
                            <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Select question type...</option>
                            {questionTypes?.data.map((item) => (
                              <option key={item.type} value={item.type} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowQuestionTypeSelector(false)}
                            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none self-start transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add Question Button */}
                    {currentQuestion === null && !showQuestionTypeSelector && (
                      <button
                        type="button"
                        onClick={() => setShowQuestionTypeSelector(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-blue dark:text-blue-400 border border-primary-blue dark:border-blue-400 rounded-lg hover:bg-primary-blue/5 dark:hover:bg-blue-400/10 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-blue-400/30 transition-colors"
                      >
                        <span>+ Add Question</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {testId !== null && (
              <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={onResetTestForm}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questions.length === 0}
                  className="px-6 py-2 text-sm font-medium bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-colors"
                >
                  Save Test
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default CreateTest;
