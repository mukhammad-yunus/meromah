import React from "react";
import McqPreview from "./McqPreview";
import CodePreview from "./testCodeType/CodePreview";
import { useDeleteQuestionMutation } from "../../../services/questionsApi";

const QuestionPreviewItem = ({
  question,
  questionTypes,
  index,
  onRemove,
  onEdit,
  testId,
}) => {
  const [deleteQuestion] = useDeleteQuestionMutation();
  const handleRemove = async (questionId) => {
    try {
      await deleteQuestion({ test: testId, question: questionId });
      onRemove()
    } catch (err) {
      console.error(err);
    }
  };
  const getQuestionTypeKey = () => {
    if (question.type === "code") return "code";
    if (question.type === "multiple_choice" || question.type === "mcq")
      return "mcq";
    return "mcq"; // default
  };
  const questionTypeLabel =
    questionTypes?.[getQuestionTypeKey()]?.label || "Question";
  if (question.type === "multiple_choice" || question.type === "mcq") {
    return (
      <McqPreview
        question={question}
        index={index}
        questionTypeLabel={questionTypeLabel}
        onRemove={handleRemove}
        questionNum={index + 1}
        onEdit={() => onEdit && onEdit(question)}
      />
    );
  }

  // Code question
  return (
    <CodePreview
      onRemove={handleRemove}
      questionTypeLabel={questionTypeLabel}
      question={question}
      questionNum={index + 1}
      onEdit={() => onEdit && onEdit(question)}
    />
  );
};

export default QuestionPreviewItem;
