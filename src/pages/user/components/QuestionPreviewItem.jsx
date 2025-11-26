import React from 'react'
import McqPreview from './McqPreview';
import CodePreview from './CodePreview';

const QuestionPreviewItem = ({
  question,
  questionTypes,
  index,
  onRemove,
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
      />
    );
  }

  // Code question
  return (
      <CodePreview
        onRemove={onRemove}
        questionTypeLabel={questionTypeLabel}
        question={question}
        questionNum={index+1}
      />
  );
}

export default QuestionPreviewItem