import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setSubmission } from "../../../app/testSessionSlice";
import { useCheckOldDsaQuestionApiMutation } from "../../../services/solutionsApi";

const AllInOneCodeQuestion = ({ question, currentSubmission, onError }) => {
  const dispatch = useDispatch();
  const [pythonCode, setPythonCode] = useState(currentSubmission || "");
  const [pythonOutput, setPythonOutput] = useState([]);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [playPython] = useCheckOldDsaQuestionApiMutation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (currentSubmission) {
      setPythonCode(currentSubmission);
    }
  }, [currentSubmission]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      dispatch(
        setSubmission({
          question_id: question.id,
          question_type: "code",
          code: pythonCode,
        })
      );
    }, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [pythonCode, dispatch, question.id]);

  useEffect(() => {
    setPythonOutput([]);
  }, [question]);

  const handleRunCode = async () => {
    if (!pythonCode.trim()) return;
    setIsRunningCode(true);
    setPythonOutput([]);
    dispatch(
      setSubmission({
        question_id: question.id,
        question_type: "code",
        code: pythonCode,
      })
    );
    try {
      const { data } = await playPython({
        bodyData: { user_solution: pythonCode, question_id: question.id },
      }).unwrap();
      let temp = [];
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        temp.push({
          stdout: element.stdout,
          stderr: element.stderr,
          cmpinfo: element.cmpinfo,
          testcase: question.testcases[i],
        });
      }
      setPythonOutput(temp);
    } catch (err) {
      onError({
        hasError: true,
        message: err.message || "Error running code",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

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
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + TAB.length;
      }, 0);
    }
  };

  return (
    <div className="mt-2 space-y-4">
      {/* Function Signature */}
      {question.signature && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Function Signature
          </h4>
          <code className="block px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-sm text-neutral-900 dark:text-neutral-100 font-mono">
            def {question.signature.signature}(
            {Array.from({
              length: question.signature.arg_nums,
            })
              .map((_, i) => `arg${i + 1}`)
              .join(", ")}
            ):
          </code>
        </div>
      )}
      {/* Test Cases */}
      {question.testcases && question.testcases.length > 0 && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Test Cases
          </h4>
          <div className="flex flex-col gap-2">
            {question.testcases.map((testCase, tcIndex) => {
              const args = testCase.arguments || [];
              return (
                <div
                  key={testCase.id || tcIndex}
                  className="p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-xs"
                >
                  <div className="font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                    Test Case {tcIndex + 1}
                  </div>
                  {args.length > 0 && (
                    <div className="mb-1">
                      <span className="text-neutral-600 dark:text-neutral-400">Input: </span>
                      <code className="text-neutral-900 dark:text-neutral-100 font-mono">
                        {args.map((a) => a.body).join(", ")}
                      </code>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Expected Output:{" "}
                    </span>
                    <code className="text-neutral-900 dark:text-neutral-100 font-mono">
                      {testCase.expected_output || "N/A"}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Python Playground */}
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Python Playground
        </h4>
        <textarea
          value={pythonCode}
          onChange={(e) => setPythonCode(e.target.value)}
          placeholder="# Write your Python code here"
          className="w-full p-3 rounded-lg font-mono text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-blue/40 resize-none"
          style={{ minHeight: "200px" }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunningCode || !pythonCode.trim()}
          className="mt-3 px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
        >
          {isRunningCode ? "Running..." : "Run Code"}
        </button>
      </div>
      {pythonOutput.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-neutral-800 dark:text-neutral-100 text-sm">
            Output
          </h4>
          {pythonOutput.map((item, i) => {
            const { stdout, stderr, cmpinfo, testcase } = item;
            const hasSyntaxError = cmpinfo && cmpinfo.trim() !== "";
            const success = stdout?.success ?? false;
            const hasRuntimeError = stdout?.error;

            const formatOutput = (output) => {
              if (Array.isArray(output)) {
                return `(${output.join(", ")})`;
              }
              return output?.toString() || "";
            };

            return (
              <div
                key={testcase?.id || i}
                className={`flex flex-col gap-2 p-3 border rounded-lg text-sm ${
                  success
                    ? "bg-green-100 dark:bg-green-800/20 border-green-300 dark:border-green-600 text-green-600 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-800/20 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400"
                }`}
              >
                <div className="font-semibold">Test Case {i + 1}</div>
                {hasSyntaxError ? (
                  <code className="text-xs font-mono">{cmpinfo}</code>
                ) : hasRuntimeError ? (
                  <code className="text-xs font-mono">{stdout.error}</code>
                ) : success ? (
                  <span>Correct</span>
                ) : (
                  <>
                    <div>
                      Your Output:{" "}
                      <code className="font-mono">
                        {formatOutput(stdout?.output)}
                      </code>
                    </div>
                    <div>
                      Expected:{" "}
                      <code className="font-mono">
                        {formatOutput(stdout?.expected)}
                      </code>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllInOneCodeQuestion;

