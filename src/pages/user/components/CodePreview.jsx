import React, { useEffect, useState } from "react";
import { useCheckOldDsaQuestionApiMutation } from "../../../services/solutionsApi";
import { FiX } from "react-icons/fi";
import PreviewActionsMenu from "./PreviewActionsMenu";
import Toast from "../../../components/Toast";

const CodePreview = ({
  question,
  onRemove,
  questionNum,
  questionTypeLabel,
  onEdit,
}) => {
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [pythonCode, setPythonCode] = useState("");
  const [pythonOutput, setPythonOutput] = useState([]);
  const [error, setError] = useState({ hasError: false, message: null });
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [playPython] = useCheckOldDsaQuestionApiMutation();

  useEffect(() => {
    if (!showCodePreview) {
      setPythonCode("");
      setPythonOutput("");
    } else {
      setPythonCode(
        `def ${question.signature.value}(${Array.from({
          length: question.signature.numberOfArguments,
        })
          .map((_, i) => `arg${i + 1}`)
          .join(", ")}):\n\t# Write your solution here`
      );
    }
  }, [showCodePreview]);
  useEffect(() => {
    if (showCodePreview) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCodePreview]);
  const handleRunCode = async () => {
    if (!pythonCode.trim()) return;
    setIsRunningCode(true);
    setPythonOutput("");
    try {
      const { result } = await playPython({
        bodyData: { user_solution: pythonCode, question_id: question.id },
      }).unwrap();
      for (const element of result) {
        if (element.stderr.length > 0) {
          throw new Error(element.stderr);
        }
      }
      setPythonOutput(result || "No output");
    } catch (err) {
      setError({
        hasError: true,
        message: err.message || "Error running code",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Group arguments by test_case_id
  const groupedArguments = {};
  if (question.arguments) {
    question.arguments.forEach((arg) => {
      const testCaseId = arg.test_case_id;
      if (!groupedArguments[testCaseId]) {
        groupedArguments[testCaseId] = [];
      }
      groupedArguments[testCaseId].push(arg);
    });
    // Sort arguments by order
    Object.keys(groupedArguments).forEach((key) => {
      groupedArguments[key].sort((a, b) => a.order - b.order);
    });
  }
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;

      const TAB = "\t";

      const newValue =
        pythonCode.substring(0, start) + TAB + pythonCode.substring(end);

      setPythonCode(newValue);

      // Move cursor after inserted tab
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + TAB.length;
      }, 0);
    }
  };
  return (
    <>
      <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span>Question {questionNum}</span>
          <span className="text-sm text-neutral-500">{questionTypeLabel}</span>
        </div>
        <PreviewActionsMenu
          onEdit={() => onEdit && onEdit(question)}
          onPreview={() => setShowCodePreview(true)}
          onRemove={() => onRemove && onRemove(question)}
        />
      </div>
      {showCodePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full min-h-[80vh] max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Code Question Preview
              </h2>
              <button
                type="button"
                onClick={() => setShowCodePreview(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {/* Content - Two Pane Layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left Pane - Question Details */}
              <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto border-r border-neutral-200">
                <div className="flex flex-col gap-4">
                  {/* Question Body */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                      Problem Description
                    </h3>
                    <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                      {question.body || "No description provided"}
                    </p>
                  </div>
                  {/* Function Signature */}
                  {question.signature && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                        Function Signature
                      </h3>
                      <code className="block px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm text-neutral-900 font-mono">
                        def {question.signature.value}(
                        {Array.from({
                          length: question.signature.numberOfArguments,
                        })
                          .map((_, i) => `arg${i + 1}`)
                          .join(", ")}
                        ):
                      </code>
                    </div>
                  )}
                  {/* Test Cases */}
                  {question.test_cases && question.test_cases.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                        Test Cases
                      </h3>
                      <div className="flex flex-col gap-3">
                        {question.test_cases.map((testCase, tcIndex) => {
                          const args = groupedArguments[testCase.id] || [];
                          return (
                            <div
                              key={testCase.id || tcIndex}
                              className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                            >
                              <div className="text-xs font-medium text-neutral-600 mb-2">
                                Test Case {tcIndex + 1}
                              </div>
                              {args.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs text-neutral-600">
                                    Input:{" "}
                                  </span>
                                  <code className="text-xs text-neutral-900 font-mono">
                                    {args.map((a) => a.value).join(", ")}
                                  </code>
                                </div>
                              )}
                              <div>
                                <span className="text-xs text-neutral-600">
                                  Expected Output:{" "}
                                </span>
                                <code className="text-xs text-neutral-900 font-mono">
                                  {testCase.expected_output || "N/A"}
                                </code>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Right Pane - Python Playground */}
              <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto bg-neutral-50">
                <div className="flex flex-col gap-4 h-full">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Python Playground
                  </h3>
                  <textarea
                    value={pythonCode}
                    onChange={(e) => setPythonCode(e.target.value)}
                    placeholder="# Write your Python code here"
                    className="flex-1 w-full p-4 rounded-lg font-mono text-sm bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue resize-none"
                    style={{ minHeight: "200px" }}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunningCode || !pythonCode.trim()}
                    className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isRunningCode ? "Running..." : "Run Code"}
                  </button>
                  {pythonOutput.length > 0 && (
                    <div className="p-3 bg-white border border-neutral-200 rounded-lg">
                      <div className="text-xs font-medium text-neutral-600 mb-1">
                        Output:
                      </div>
                      {pythonOutput.map((test_case, i) => (
                        <pre className="text-xs text-neutral-900 font-mono whitespace-pre-wrap">
                          {test_case.stdout}
                        </pre>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {error.hasError && (
        <Toast
          type="error"
          message={error.message}
          onClose={() => setError({ hasError: false, message: null })}
        />
      )}
    </>
  );
};

export default CodePreview;
