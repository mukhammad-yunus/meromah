import React, { useState, useEffect } from "react";
import { useCreateQuestionMutation } from "../../../services/questionsApi";
import { useCreateOptionMutation } from "../../../services/questionOptionsApi";
import Toast from "../../../components/Toast";
import AutoResizeTextarea from "./AutoResizeTextarea";

const CreateTestMcqType = ({
  currentQuestion,
  setCurrentQuestion,
  onCreateSuccess,
  onCancel,
  testId,
  questionTypeId = 2, // Default to 2 for multiple_choice
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createQuestion] = useCreateQuestionMutation();
  const [createOption] = useCreateOptionMutation();

  // Initialize currentQuestion if null
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion({
        type: "multiple_choice",
        body: "",
        options: [
          { body: "", is_correct: false },
          { body: "", is_correct: false },
        ],
      });
    }
  }, [currentQuestion, setCurrentQuestion]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!currentQuestion) return null;

  const { body, options } = currentQuestion;

  // Update question body
  const handleBodyChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      body: e.target.value,
    });
  };

  // Add option
  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...options, { body: "", is_correct: false }],
    });
  };

  // Remove option (but keep minimum 2)
  const handleRemoveOption = (index) => {
    if (options.length <= 2) return; // Minimum 2 options required
    setCurrentQuestion({
      ...currentQuestion,
      options: options.filter((_, i) => i !== index),
    });
  };

  // Update option body
  const handleOptionBodyChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], body: value };
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Toggle option correctness
  const handleOptionCorrectnessChange = (index) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      is_correct: !newOptions[index].is_correct,
    };
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Validate form
  const isFormValid = () => {
    if (!body?.trim()) return false;
    if (!options || options.length < 2) return false;
    if (!options.every((opt) => opt.body?.trim())) return false;
    if (!options.some((opt) => opt.is_correct)) return false;
    return true;
  };

  // Handle create
  const handleCreateMcqQuestion = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!testId) {
      setError("Test ID is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create question
      const questionResult = await createQuestion({
        test: testId,
        bodyData: {
          body: body.trim(),
          question_type_id: questionTypeId,
        },
      }).unwrap();

      const questionId = questionResult.id || questionResult.data?.id;

      if (!questionId) {
        throw new Error("Failed to get question ID from response");
      }

      // Step 2: Create options
      const createdOptions = [];
      for (let i = 0; i < options.length; i++) {
        const optionResult = await createOption({
          test: testId,
          question: questionId,
          bodyData: {
            body: options[i].body.trim(),
            is_correct: options[i].is_correct,
          },
        }).unwrap();

        const optionId = optionResult.id || optionResult.data?.id;
        createdOptions.push({
          id: optionId,
          body: options[i].body.trim(),
          is_correct: options[i].is_correct,
        });
      }

      // Build final hydrated object
      const finalQuestion = {
        id: questionId,
        type: "multiple_choice",
        body: body.trim(),
        options: createdOptions,
      };

      // Call success callback
      onCreateSuccess(finalQuestion);

      // Reset state
      setCurrentQuestion(null);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to create multiple choice question. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 flex items-start md:items-center justify-center bg-black/30 backdrop-blur-sm z-50 overflow-auto">
      <div className="w-full flex flex-col items-center justify-between min-h-full md:min-h-0 md:max-w-4xl md:max-h-[90vh] p-4 md:p-6 md:border md:border-neutral-200 md:rounded-lg bg-neutral-50 md:my-4 md:overflow-hidden">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-1 min-h-0 w-full">
          {/* Header */}
          <p className="text-base md:text-sm font-medium text-neutral-700">
            New Multiple Choice Question
          </p>

          {/* Content */}
          <div className="flex flex-col gap-6 flex-1 min-h-0 md:max-h-[calc(90vh-180px)] md:overflow-y-auto">
            {/* Question Body */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-800">
                Question Body <span className="text-red-500">*</span>
              </label>
              <AutoResizeTextarea
                value={body || ""}
                onChange={handleBodyChange}
                placeholder="Enter the question description..."
                className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none min-h-[100px]"
              />
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800">
                  Options <span className="text-red-500">*</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 bg-white border border-neutral-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-neutral-700">
                        Option {index + 1}
                      </span>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Option Body */}
                      <div>
                        <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                          Option Text <span className="text-red-500">*</span>
                        </label>
                        <AutoResizeTextarea
                          value={option.body || ""}
                          onChange={(e) =>
                            handleOptionBodyChange(index, e.target.value)
                          }
                          placeholder="Enter option text..."
                          className="w-full px-3 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      {/* Correct Answer Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`correct-${index}`}
                          checked={option.is_correct || false}
                          onChange={() => handleOptionCorrectnessChange(index)}
                          className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                          htmlFor={`correct-${index}`}
                          className="text-sm font-medium text-neutral-700 cursor-pointer"
                        >
                          Mark as correct answer
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  + Add Option
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-neutral-200 bg-neutral-50">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateMcqQuestion}
              disabled={!isFormValid() || isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? "Creating..." : "Create Question"}
            </button>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}
      </div>
    </main>
  );
};

export default CreateTestMcqType;
