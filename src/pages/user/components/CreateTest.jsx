import React, { useState, useRef } from "react";
import CommunitySelection from "./CommunitySelection";
const QUESTION_TYPES = [
  { type: "code", label: "Code Question" },
  { type: "multiple_choice", label: "Multiple Choice" },
];

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
  multiple_choice: {
    type: "multiple_choice",
    body: "",
    options: [
      { body: "", is_correct: false },
      { body: "", is_correct: false }, // minimum 2 options
    ],
  },
};
const CreateTest = ({ descId, onCancel = undefined, onError }) => {
  const testTitleRef = useRef(null);
  const testDescriptionRef = useRef(null);
  const selectedDescNameRef = useRef(null);
  const descSelectionResetRef = useRef(null);

  const [isFormValid, setIsFormValid] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);

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

  return (
    <form
      onSubmit={handleTestSubmit}
      className={`p-4 flex flex-col justify-between min-h-screen ${
        !descId &&
        "max-h-5/6 bg-white rounded-lg shadow-sm border border-neutral-200 m-6"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Desc Selection - only show when descId is not provided */}
        {!descId && (
          <CommunitySelection
            communityType={"desc"}
            onSelectBoard={handleSelectDesc}
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
            type="text"
            placeholder="Test title"
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Description *
          </label>
          <textarea
            ref={testDescriptionRef}
            placeholder="Describe your test..."
            rows={4}
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors resize-y"
          />
        </div>
        {/* Questions Collector */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-neutral-800">
            Questions
          </label>
          {/* Display Existing Questions */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-700">
                      Question {index + 1}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {question.type === "code"
                        ? "Code Question"
                        : "Multiple Choice"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <span className="text-sm">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          {currentQuestion !== null && (
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-neutral-700">
                  {currentQuestion.type === "code"
                    ? "New Question - Code Question"
                    : "New Question - Multiple Choice"}
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
                      setQuestions((prev) => [...prev, [currentQuestion]]);
                      setCurrentQuestion(null);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Question Type Selector - shown when empty or when adding new */}
          {showQuestionTypeSelector && (
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-600">
                  {questions.length === 0
                    ? "Question 1 - Select question type"
                    : `Question ${questions.length + 1} - Select question type`}
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
                  {QUESTION_TYPES.map((item) => (
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
          disabled={!isFormValid}
          className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Create Test
        </button>
      </div>
    </form>
  );
};

export default CreateTest;
