import React from "react";
import McqPreview from "./McqPreview";
import CodePreview from "./testCodeType/CodePreview";

const QuestionPreviewItem = ({
  question,
  questionTypes,
  index,
  onRemove,
  onEdit,
}) => {
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
        onRemove={onRemove}
        questionNum={index + 2}
        onEdit={() => onEdit && onEdit(question)}
      />
    );
  }

  // Code question
  return (
    <CodePreview
      onRemove={onRemove}
      questionTypeLabel={questionTypeLabel}
      question={question}
      questionNum={index + 1}
      onEdit={() => onEdit && onEdit(question)}
    />
  );
};

export default QuestionPreviewItem;
