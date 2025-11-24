import React from 'react'

const McqPreview = ({ question, index, questionTypeLabel, onRemove }) => {
  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">
            Question {index + 1}
          </span>
          <span className="text-sm text-neutral-500">{questionTypeLabel}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-sm text-neutral-400 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Question Body */}
      <div className="mb-4">
        <p className="text-sm text-neutral-900 whitespace-pre-wrap">
          {question.body || "No question body"}
        </p>
      </div>

      {/* Options */}
      {question.options && question.options.length > 0 && (
        <div className="flex flex-col gap-2">
          {question.options.map((option, optIndex) => (
            <div
              key={option.id || optIndex}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                option.is_correct
                  ? "bg-green-50 border-green-200"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  option.is_correct ? "bg-green-500" : "bg-neutral-300"
                }`}
              >
                {option.is_correct && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span className="text-sm text-neutral-900 flex-1">
                {option.body || "No option text"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default McqPreview