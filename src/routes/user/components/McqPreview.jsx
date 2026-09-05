import React from "react";
import PreviewActionsMenu from "./PreviewActionsMenu";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";

const McqPreview = ({
  question,
  questionNum,
  questionTypeLabel,
  onRemove,
  onEdit,
}) => {
  return (
    <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-neutral-900 dark:text-neutral-100">Question {questionNum}</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{questionTypeLabel}</span>
        </div>
        <PreviewActionsMenu
          onEdit={() => onEdit && onEdit(question)}
          onRemove={() => onRemove && onRemove(question.id)}
        />
      </div>

      {/* Question Body */}
      <div className="mb-4">
        <MarkdownViewer>{question.body || "No question body"}</MarkdownViewer>
        {/* <p className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
          {question.body || "No question body"}
        </p> */}
      </div>

      {/* Options */}
      {question.options && question.options.length > 0 && (
        <div className="flex flex-col gap-2">
          {question.options.map((option, optIndex) => (
            <div
              key={option.id || optIndex}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                option.is_correct
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  option.is_correct ? "bg-green-500 dark:bg-green-600" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                {option.is_correct ? (
                  <span className="text-white text-xs">✓</span>
                ): null}
              </div>
              <span className="text-sm text-neutral-900 dark:text-neutral-100 flex-1">
                {option.body || "No option text"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default McqPreview;
