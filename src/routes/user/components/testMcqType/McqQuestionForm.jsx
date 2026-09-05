import React from "react";
import AutoResizeTextarea from "../AutoResizeTextarea";
import Toast from "../../../../components/Toast";

const McqQuestionForm = ({
  question,
  error,
  isSubmitting,
  title = "Multiple Choice Question",
  submitButtonText = "Submit",
  submittingButtonText = "Submitting...",
  onBodyChange,
  onAddOption,
  onRemoveOption,
  onOptionBodyChange,
  onOptionCorrectnessChange,
  onSubmit,
  onCancel,
  onErrorClose,
  isFormValid,
}) => {
  if (!question) return null;

  const { body, options = [] } = question;

  return (
    <main className="fixed inset-0 flex items-start md:items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 overflow-auto">
      <div className="w-full flex flex-col items-center justify-between min-h-full md:min-h-0 md:max-w-4xl md:max-h-[90vh] p-4 md:p-6 md:border md:border-neutral-200 dark:md:border-neutral-700 md:rounded-lg bg-neutral-50 dark:bg-neutral-900 md:my-4 md:overflow-hidden">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-1 min-h-0 w-full">
          <p className="text-base md:text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {title}
          </p>

          <div className="flex flex-col gap-6 flex-1 min-h-0 md:max-h-[calc(90vh-180px)] md:overflow-y-auto">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Question Body <span className="text-red-500">*</span> <small className="text-xs text-neutral-400">(Markdown supported)</small>
              </label>
              <AutoResizeTextarea
                value={body || ""}
                onChange={onBodyChange}
                placeholder="Enter the question description..."
                className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-none min-h-[100px]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  Options <span className="text-red-500">*</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        Option {index + 1}
                      </span>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveOption(index)}
                          className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 block">
                          Option Text <span className="text-red-500">*</span>
                        </label>
                        <AutoResizeTextarea
                          value={option.body || ""}
                          onChange={(e) => onOptionBodyChange(index, e.target.value)}
                          placeholder="Enter option text..."
                          className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-800 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`correct-${index}`}
                          checked={option.is_correct || false}
                          onChange={() => onOptionCorrectnessChange(index)}
                          className="w-4 h-4 text-blue-600 dark:accent-blue-400 border-neutral-300 dark:border-neutral-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 bg-white dark:bg-neutral-800"
                        />
                        <label
                          htmlFor={`correct-${index}`}
                          className="text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
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
                  onClick={onAddOption}
                  className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-400/10 active:bg-blue-100 dark:active:bg-blue-400/20 transition-colors"
                >
                  + Add Option
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-transparent">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? submittingButtonText : submitButtonText}
            </button>
          </div>
        </div>

        {error && onErrorClose && (
          <Toast type="error" message={error} onClose={onErrorClose} />
        )}
      </div>
    </main>
  );
};

export default McqQuestionForm;

