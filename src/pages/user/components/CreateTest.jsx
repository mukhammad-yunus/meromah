import React, { useState, useMemo, useEffect } from "react";
import { useGetQuestionTypesQuery } from "../../../services/questionTypesApi";
import CreateTestMcqType from "./CreateTestMcqType";
import QuestionPreviewItem from "./QuestionPreviewItem";
import CreateCodeQuestion from "./testCodeType/CreateCodeQuestion";
import EditCodeQuestion from "./testCodeType/EditCodeQuestion";
import CreateTestHeader from "./CreateTestHeader";
import { useSelector } from "react-redux";
import NotFound from "../../../components/NotFound";

const CreateTest = ({ descId, onCancel = undefined }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [draftTest, setDraftTest] = useState(() => {
    const raw = localStorage.getItem("unfinished-test");
    let draftFromLocalStorage = null;

    try {
      draftFromLocalStorage = raw ? JSON.parse(raw) : null;
    } catch {
      draftFromLocalStorage = null;
    }

    if (!draftFromLocalStorage) return null;
    if (descId && draftFromLocalStorage.desc !== descId) return null;
    const target = new Date(draftFromLocalStorage.date).getTime();
    const now = Date.now();
    const diffMs = now - target;
    if (diffMs > 0 && diffMs <= 3600000) {
      return draftFromLocalStorage;
    }
    localStorage.removeItem("unfinished-test");
    return null;
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const { data: questionTypes } = useGetQuestionTypesQuery();
  const initialQuestionData = useMemo(
    () => ({
      code: {
        type: "code",
        type_id: questionTypes ? questionTypes["code"]?.id : null,
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
        type_id: questionTypes ? questionTypes["mcq"]?.id : null,
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
 useEffect(() => {
  if (!descId) return;
  if(draftTest === null) return;
  if(draftTest.desc !== descId){
  localStorage.removeItem("unfinished-test")
  setDraftTest(null)
  }
  
}, [draftTest]);
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

    if (question.type === "code") {
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
        type_id: question.type_id,
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
    }

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
  };

  const handleQuestionModalCancel = () => {
    setCurrentQuestion(null);
    setIsEditMode(false);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    // TODO: Gather test data, questions, files, and submit
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
    setQuestions((prev) => [...prev, finalQuestion]);

    let draftFromLocalStorage = null;
    try {
      const rawDraft = localStorage.getItem("unfinished-test");
      draftFromLocalStorage = rawDraft ? JSON.parse(rawDraft) : null;
    } catch {
      draftFromLocalStorage = null;
    }

    if (draftFromLocalStorage) {
      draftFromLocalStorage.questions = draftFromLocalStorage.questions || [];
      draftFromLocalStorage.questions.push(finalQuestion);
      draftFromLocalStorage.date = new Date().toISOString();
      localStorage.setItem(
        "unfinished-test",
        JSON.stringify(draftFromLocalStorage)
      );
      setDraftTest(draftFromLocalStorage);
    }

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
      localStorage.setItem(
        "unfinished-test",
        JSON.stringify(draftFromLocalStorage)
      );
      setDraftTest(draftFromLocalStorage);
    }

    setCurrentQuestion(null);
    setIsEditMode(false);
  };
  if (!isAuthenticated) return <NotFound />;
  return (
    <form
      onSubmit={handleTestSubmit}
      className={
        !!descId &&
        "flex flex-col items-center gap-4 fixed inset-0 z-50 p-4 bg-white/50 md:bg-black/30 backdrop-blur-lg"
      }
    >
      <div
        className={`flex flex-col justify-start bg-white h-full rounded-lg md:m-6 border border-neutral-200 gap-4 p-6 ${
          !!descId && " w-full md:max-w-3/4 p-6 overflow-y-scroll"
        }`}
      >
        <CreateTestHeader
          descId={descId}
          draftTest={draftTest}
          setDraftTest={setDraftTest}
          setQuestions={setQuestions}
          onCancel={onResetTestForm}
        />
        {testId !== null && (
          <>
            {/* Questions Collector */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-neutral-800">
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
                    />
                  ))}
                </div>
              )}
              {currentQuestion !== null && testId !== null && isEditMode && (
                <>
                  {currentQuestion.type === "code" ? (
                    <EditCodeQuestion
                      currentQuestion={currentQuestion}
                      setCurrentQuestion={setCurrentQuestion}
                      onUpdateSuccess={handleUpdateSuccess}
                      onCancel={handleQuestionModalCancel}
                      testId={testId}
                      questionTypeId={questionTypes["code"].id}
                      setIsEditMode={setIsEditMode}
                    />
                  ) : currentQuestion.type === "mcq" ? null : null}
                </>
              )}
              {currentQuestion !== null && testId !== null && !isEditMode && (
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
                    <CreateTestMcqType
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
                    <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-neutral-700">
                          New Question - Multiple Choice
                        </span>
                        {/* Question Body Input */}
                        <p className="flex flex-col gap-2">Question Body</p>
                        <div className="flex justify-between gap-2">
                          <button
                            className="block px-4 py-2 rounded text-neutral-400 border cursor-pointer "
                            onClick={() => setCurrentQuestion(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="block px-4 py-2 rounded text-white bg-primary-blue border-primary-blue border cursor-pointer "
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
              {/* Question Type Selector - shown when empty or when adding new */}
              {showQuestionTypeSelector && (
                <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-neutral-600">
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
                          e.target.value = ""; // Reset dropdown
                        }
                      }}
                      className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
                    >
                      <option value="">Select question type...</option>
                      {questionTypes.data.map((item) => (
                        <option key={item.type} value={item.type}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showQuestionTypeSelector && (
                    <button
                      type="button"
                      onClick={() => setShowQuestionTypeSelector(false)}
                      className="mt-3 text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              {/* Add Question Button - shown when questions exist */}
              {currentQuestion === null && !showQuestionTypeSelector && (
                <button
                  type="button"
                  onClick={() => setShowQuestionTypeSelector(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue/5 transition-colors"
                >
                  <span>Add Question</span>
                </button>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={onResetTestForm}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleTestSubmit}
                disabled={questions.length === 0}
                className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save Test
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default CreateTest;
