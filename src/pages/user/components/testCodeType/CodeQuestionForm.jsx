import React from "react";
import AutoResizeTextarea from "../AutoResizeTextarea";
import Toast from "../../../../components/Toast";

const CodeQuestionForm = ({
  question,
  error,
  isSubmitting,
  title = "Code Question",
  submitButtonText = "Submit",
  submittingButtonText = "Submitting...",
  onBodyChange,
  onSignatureValueChange,
  onNumberOfArgumentsChange,
  onAddTestCase,
  onRemoveTestCase,
  onArgumentChange,
  onTestCaseOutputChange,
  onSubmit,
  onCancel,
  onErrorClose,
  isFormValid,
}) => {
  if (!question) return null;

  const { body, signature, test_cases, arguments: args } = question;
  const numArgs = signature?.numberOfArguments || 0;

  return (
    <main className="fixed inset-0 flex items-start md:items-center justify-center bg-black/30 backdrop-blur-sm z-50 overflow-auto ">
      <div className="w-full flex flex-col items-center justify-between min-h-full md:min-h-0 md:max-w-4xl md:max-h-[90vh] p-4 md:p-6 md:border md:border-neutral-200 md:rounded-lg bg-neutral-50 md:my-4 md:overflow-hidden">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-1 min-h-0 w-full">
          {/* Header */}
          <p className="text-base md:text-sm font-medium text-neutral-700">
            {title}
          </p>

          {/* Content - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-4 flex-1 min-h-0">
            {/* Question Body */}
            <div className="w-full md:w-1/2 flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-800">
                Question Body <span className="text-red-500">*</span>
              </label>
              <AutoResizeTextarea
                value={body || ""}
                onChange={onBodyChange}
                placeholder="Enter the question description..."
                className="w-full md:hidden h-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none min-h-[150px]"
              />
              <textarea
                value={body || ""}
                onChange={onBodyChange}
                placeholder="Enter the question description..."
                className="w-full hidden md:block h-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none min-h-[150px]"
              />
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2 flex flex-col min-h-0 md:max-h-[calc(90vh-180px)] md:overflow-y-auto">
              <div className="flex flex-col gap-6">
                {/* Signature */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-neutral-800">
                    Function Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={signature?.value || ""}
                      onChange={onSignatureValueChange}
                      placeholder="e.g., solve_problem"
                      className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-neutral-600 whitespace-nowrap">
                        Arguments:
                      </label>
                      <input
                        type="number"
                        max="10"
                        value={signature?.numberOfArguments || 0}
                        onChange={onNumberOfArgumentsChange}
                        className="w-20 px-2 py-1 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {/* Test Cases */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-800">
                      Test Cases <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={onAddTestCase}
                      className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {test_cases.map((testCase, caseIndex) => (
                      <div
                        key={caseIndex}
                        className="p-3 md:p-4 bg-white border border-neutral-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-neutral-700">
                            Test Case {caseIndex + 1}
                          </span>
                          {test_cases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveTestCase(caseIndex)}
                              className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* Arguments */}
                          {numArgs > 0 && (
                            <div>
                              <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                                Arguments ({numArgs} required){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                {Array.from({ length: numArgs }).map(
                                  (_, argIndex) => (
                                    <AutoResizeTextarea
                                      rows={1}
                                      key={argIndex}
                                      type="text"
                                      value={args[caseIndex]?.[argIndex] || ""}
                                      onChange={(e) =>
                                        onArgumentChange(
                                          caseIndex,
                                          argIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Arg ${argIndex + 1}`}
                                      className="w-full px-3 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                              Expected Output{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <AutoResizeTextarea
                              type="text"
                              rows={1}
                              value={testCase.expected_output || ""}
                              onChange={(e) =>
                                onTestCaseOutputChange(
                                  caseIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Expected output"
                              className="w-full px-3 py-2 text-sm text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
              onClick={onSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? submittingButtonText : submitButtonText}
            </button>
          </div>
        </div>

        {/* Error Toast */}
        {error && onErrorClose && (
          <Toast type="error" message={error} onClose={onErrorClose} />
        )}
      </div>
    </main>
  );
};

export default CodeQuestionForm;
