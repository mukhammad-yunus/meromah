import React, { useEffect, useState } from "react";
import { useCreateQuestionMutation } from "../../../../services/questionsApi";
import { useCreateOptionMutation } from "../../../../services/questionOptionsApi";
import McqQuestionForm from "./McqQuestionForm";

const CreateMcqQuestion = ({
  currentQuestion,
  setCurrentQuestion,
  onCreateSuccess,
  onCancel,
  testId,
  questionTypeId = 2,
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createQuestion] = useCreateQuestionMutation();
  const [createOption] = useCreateOptionMutation();

  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion({
        type: "mcq",
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

  const handleCreateMcqQuestion = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!testId) {
      setError("Test ID is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
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

      const finalQuestion = {
        id: questionId,
        type: "mcq",
        body: body.trim(),
        options: createdOptions,
      };

      onCreateSuccess(finalQuestion);
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
    <McqQuestionForm
      question={currentQuestion}
      error={error}
      isSubmitting={isSubmitting}
      title="New Multiple Choice Question"
      submitButtonText="Create Question"
      submittingButtonText="Creating..."
      onBodyChange={handleBodyChange}
      onAddOption={handleAddOption}
      onRemoveOption={handleRemoveOption}
      onOptionBodyChange={handleOptionBodyChange}
      onOptionCorrectnessChange={handleOptionCorrectnessChange}
      onSubmit={handleCreateMcqQuestion}
      onCancel={onCancel}
      onErrorClose={() => setError(null)}
      isFormValid={isFormValid()}
    />
  );
};

export default CreateMcqQuestion;

