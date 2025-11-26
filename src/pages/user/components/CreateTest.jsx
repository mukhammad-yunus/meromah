import React, { useState, useRef, useMemo, useEffect } from "react";
import CommunitySelection from "./CommunitySelection";
import { useCreateTestMutation } from "../../../services/testsApi";
import { useGetQuestionTypesQuery } from "../../../services/questionTypesApi";
import CreateTestCodeType from "./CreateTestCodeType";
import CreateTestMcqType from "./CreateTestMcqType";
import QuestionPreviewItem from "./QuestionPreviewItem";

const initialQuestionData = {
  code: {
    type: "code",
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
    body: "",
    options: [
      { body: "", is_correct: false },
      { body: "", is_correct: false }, // minimum 2 options
    ],
  },
};
const CreateTest = ({ descId, onCancel = undefined, onError }) => {
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

  const testTitleRef = useRef(null);
  const testDescriptionRef = useRef(null);
  const selectedDescNameRef = useRef(null);
  const descSelectionResetRef = useRef(null);

  const [isFormValid, setIsFormValid] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const { data: questionTypes } = useGetQuestionTypesQuery();
  const [createTest] = useCreateTestMutation();
  const testId = useMemo(
    () => (draftTest === null ? null : draftTest.id),
    [draftTest]
  );

  useEffect(() => {
    if (draftTest === null) return;
    testTitleRef.current.value = draftTest.title;
    testDescriptionRef.current.value = draftTest.description;
    selectedDescNameRef.current = draftTest.desc;
    setQuestions(draftTest?.questions || []);
    checkFormValidity();
  }, [draftTest]);

  const checkFormValidity = () => {
    const testTitle = testTitleRef.current?.value?.trim() || "";
    const testDescription = testDescriptionRef.current?.value?.trim() || "";
    const hasDesc = descId || selectedDescNameRef.current;
    setIsFormValid(
      testTitle.length > 0 && testDescription.length > 0 && hasDesc
    );
  };

  const handleSelectDesc = (desc) => {
    selectedDescNameRef.current = desc.name;
    checkFormValidity();
  };

  const handleClearDescSelection = () => {
    selectedDescNameRef.current = null;
    checkFormValidity();
  };

  const handleSelectQuestionType = (type) => {
    const newQuestion = initialQuestionData[type];
    if (newQuestion) {
      setCurrentQuestion(newQuestion);
    }
    setShowQuestionTypeSelector(false);
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    // TODO: Gather test data, questions, files, and submit
  };

  const onResetTestForm = () => {
    if (testTitleRef.current) testTitleRef.current.value = "";
    if (testDescriptionRef.current) testDescriptionRef.current.value = "";
    setQuestions([]);
    setCurrentQuestion(null);
    setShowQuestionTypeSelector(false);
    setIsFormValid(false);
    selectedDescNameRef.current = null;
    if (descSelectionResetRef.current) {
      descSelectionResetRef.current();
    }
    if (onCancel) {
      onCancel();
    }
  };
  const handleInitializeTest = async () => {
    try {
      const bodyData = {
        title: testTitleRef.current.value.trim(),
        description: testDescriptionRef.current.value.trim(),
      };
      const res = await createTest({
        desc: selectedDescNameRef.current,
        bodyData,
      }).unwrap();
      const testDetails = {
        ...bodyData,
        desc: selectedDescNameRef.current,
        id: res.data.id,
        date: new Date().toISOString(),
      };
      setDraftTest(testDetails);
      localStorage.setItem(
        "unfinished-test",
        JSON.stringify({ ...testDetails, questions: [] })
      );
    } catch (err) {
      //TODO: Handle error
    }
  };
  const onCreateSuccess = (finalQuestion) => {
    setQuestions((prev) => [...prev, finalQuestion]);
    let draftFromLocalStorage = JSON.parse(
      localStorage.getItem("unfinished-test")
    );
    draftFromLocalStorage.questions.push(finalQuestion);
    draftFromLocalStorage.date = new Date().toISOString();
    localStorage.setItem(
      "unfinished-test",
      JSON.stringify(draftFromLocalStorage)
    );
    setDraftTest(draftFromLocalStorage);
    setCurrentQuestion(null);
  };
  return (
    <form
      onSubmit={handleTestSubmit}
      className={`p-4 flex flex-col justify-between ${
        !descId &&
        "max-h-5/6 bg-white rounded-lg shadow-sm border border-neutral-200 m-6"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Desc Selection - only show when descId is not provided */}
        {!descId && (
          <CommunitySelection
            communityName={draftTest ? draftTest.desc : undefined}
            communityType={"desc"}
            onSelectCommunity={handleSelectDesc}
            onClearSelection={handleClearDescSelection}
            resetRef={descSelectionResetRef}
          />
        )}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Title *
          </label>
          <input
            ref={testTitleRef}
            disabled={testId !== null}
            type="text"
            placeholder="Test title"
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors disabled:text-neutral-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Description *
          </label>
          <textarea
            ref={testDescriptionRef}
            disabled={testId !== null}
            placeholder="Describe your test..."
            rows={4}
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors resize-y disabled:text-neutral-500"
          />
        </div>
        {/* Questions Collector */}
        {testId !== null && (
          <div className="flex flex-col gap-3">
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
                  />
                ))}
              </div>
            )}
            {currentQuestion !== null && testId !== null && (
              <>
                {currentQuestion.type === "code" ? (
                  <CreateTestCodeType
                    currentQuestion={currentQuestion}
                    setCurrentQuestion={setCurrentQuestion}
                    onCreateSuccess={onCreateSuccess}
                    onCancel={() => setCurrentQuestion(null)}
                    testId={testId}
                    questionTypeId={questionTypes["code"].id}
                  />
                ) : currentQuestion.type === "mcq" ? (
                  <CreateTestMcqType
                    currentQuestion={currentQuestion}
                    setCurrentQuestion={setCurrentQuestion}
                    onCreateSuccess={onCreateSuccess}
                    onCancel={() => setCurrentQuestion(null)}
                    testId={testId}
                    questionTypeId={questionTypes["mcq"].id}
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
                            setQuestions((prev) => [...prev, currentQuestion]);
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
        )}
      </div>
      {/* Action Buttons */}
      {testId === null ? (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={onResetTestForm}
            className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleInitializeTest}
            className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            Initialize Test
          </button>
        </div>
      ) : (
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
            disabled={!isFormValid}
            className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Create Test
          </button>
        </div>
      )}
    </form>
  );
};

export default CreateTest;
