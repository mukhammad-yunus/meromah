import React, { useEffect, useState } from "react";
import {
  useCreateOptionMutation,
  useDeleteOptionMutation,
  useUpdateOptionMutation,
} from "../../../../services/questionOptionsApi";
import { useUpdateQuestionMutation } from "../../../../services/questionsApi";
import McqQuestionForm from "./McqQuestionForm";

const EditMcqQuestion = ({
  currentQuestion,
  setCurrentQuestion,
  onUpdateSuccess,
  onCancel,
  testId,
  questionTypeId = 2,
  setIsEditMode,
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateQuestion] = useUpdateQuestionMutation();
  const [createOption] = useCreateOptionMutation();
  const [deleteOption] = useDeleteOptionMutation();
  const [updateOption] = useUpdateOptionMutation();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!currentQuestion) return null;

  const { body, options = [] } = currentQuestion;

  const handleBodyChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      body: e.target.value,
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...options, { body: "", is_correct: false }],
    });
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setCurrentQuestion({
      ...currentQuestion,
      options: options.filter((_, i) => i !== index),
    });
  };

  const handleOptionBodyChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], body: value };
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

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

  const isFormValid = () => {
    if (!body?.trim()) return false;
    if (!options || options.length < 2) return false;
    if (!options.every((opt) => opt.body?.trim())) return false;
    if (!options.some((opt) => opt.is_correct)) return false;
    return true;
  };

  const handleUpdateMcqQuestion = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!testId || !currentQuestion?.id) {
      setError("Question ID is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateQuestion({
        test: testId,
        question: currentQuestion.id,
        bodyData: {
          body: body.trim(),
          question_type_id: questionTypeId,
        },
      }).unwrap();

      const originalOptionIds = new Set(
        currentQuestion.originalOptionIds || []
      );
      const newOptionIds = new Set(options.map((option) => option.id));
      for (const optionId of originalOptionIds) {
        if (!optionId || newOptionIds.has(optionId)) continue;
        await deleteOption({
          test: testId,
          question: currentQuestion.id,
          option: optionId,
        }).unwrap();
      }

      const createdOptions = [];
      for (let i = 0; i < options.length; i++) {
        const option = options[i]
        if (originalOptionIds.has(option.id)) {
          await updateOption({
              test: testId,
              question: currentQuestion.id,
              option: option.id,
              bodyData: {
                body: option.body.trim(),
                is_correct: option.is_correct,
              },
            }).unwrap();
          createdOptions.push({
            id: option.id,
            body: option.body.trim(),
            is_correct: option.is_correct,
          });
          continue
        }
        const optionResult = await createOption({
            test: testId,
            question: currentQuestion.id,
            bodyData: {
              body: option.body.trim(),
              is_correct: option.is_correct,
            },
          }).unwrap();

          const optionId = optionResult.id || optionResult.data?.id;
          createdOptions.push({
            id: optionId,
            body: option.body.trim(),
            is_correct: option.is_correct,
          });
      }

      const finalQuestion = {
        id: currentQuestion.id,
        type: "mcq",
        body: body.trim(),
        options: createdOptions,
      };

      if (setIsEditMode) {
        setIsEditMode(false);
      }

      if (onUpdateSuccess) {
        onUpdateSuccess(finalQuestion);
      }

      setCurrentQuestion(null);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to update multiple choice question. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (setIsEditMode) {
      setIsEditMode(false);
    }
    onCancel();
  };

  return (
    <McqQuestionForm
      question={currentQuestion}
      error={error}
      isSubmitting={isSubmitting}
      title="Edit Multiple Choice Question"
      submitButtonText="Update Question"
      submittingButtonText="Updating..."
      onBodyChange={handleBodyChange}
      onAddOption={handleAddOption}
      onRemoveOption={handleRemoveOption}
      onOptionBodyChange={handleOptionBodyChange}
      onOptionCorrectnessChange={handleOptionCorrectnessChange}
      onSubmit={handleUpdateMcqQuestion}
      onCancel={handleCancel}
      onErrorClose={() => setError(null)}
      isFormValid={isFormValid()}
    />
  );
};

export default EditMcqQuestion;
