import React, { useState, useEffect } from "react";
import { useCreateQuestionMutation } from "../../../services/questionsApi";
import { useCreateSignatureMutation } from "../../../services/dsaSignaturesApi";
import { useCreateDatasetMutation } from "../../../services/dsaDatasetsApi";
import { useCreateArgumentMutation } from "../../../services/dsaArgumentsApi";
import Toast from "../../../components/Toast";
import AutoResizeTextarea from "./AutoResizeTextarea";

const CreateTestCodeType = ({
  currentQuestion,
  setCurrentQuestion,
  onCreateSuccess,
  onCancel,
  testId,
  questionTypeId = 1, 
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createQuestion] = useCreateQuestionMutation();
  const [createSignature] = useCreateSignatureMutation();
  const [createDataset] = useCreateDatasetMutation();
  const [createArgument] = useCreateArgumentMutation();

  // Initialize currentQuestion if null
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion({
        type: "code",
        body: "",
        signature: { signature: "", numberOfArguments: 0 },
        test_cases: [{ expected_output: "" }],
        arguments: [[]],
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

  const { body, signature, test_cases, arguments: args } = currentQuestion;
  const numArgs = signature?.numberOfArguments || 0;

  // Update question body
  const handleBodyChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      body: e.target.value,
    });
  };

  // Update signature value
  const handleSignatureValueChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      signature: {
        ...currentQuestion.signature,
        value: e.target.value,
      },
    });
  };

  // Update number of arguments
  const handleNumberOfArgumentsChange = (e) => {
    const newNumArgs = Math.max(0, parseInt(e.target.value) || 0);
    setCurrentQuestion({
      ...currentQuestion,
      signature: {
        ...currentQuestion.signature,
        numberOfArguments: newNumArgs,
      },
      // Update arguments array to match new number
      arguments: test_cases.map(() => new Array(newNumArgs).fill("")),
    });
  };

  // Add test case
  const handleAddTestCase = () => {
    setCurrentQuestion({
      ...currentQuestion,
      test_cases: [...test_cases, { expected_output: "" }],
      arguments: [...args, new Array(numArgs).fill("")],
    });
  };

  // Remove test case
  const handleRemoveTestCase = (index) => {
    if (test_cases.length <= 1) return; // Minimum 1 case required
    setCurrentQuestion({
      ...currentQuestion,
      test_cases: test_cases.filter((_, i) => i !== index),
      arguments: args.filter((_, i) => i !== index),
    });
  };

  // Update test case expected output
  const handleTestCaseOutputChange = (index, value) => {
    const newTestCases = [...test_cases];
    newTestCases[index] = { ...newTestCases[index], expected_output: value };
    setCurrentQuestion({
      ...currentQuestion,
      test_cases: newTestCases,
    });
  };

  // Update argument value
  const handleArgumentChange = (testCaseIndex, argIndex, value) => {
    const newArgs = [...args];
    newArgs[testCaseIndex] = [...newArgs[testCaseIndex]];
    newArgs[testCaseIndex][argIndex] = value;
    setCurrentQuestion({
      ...currentQuestion,
      arguments: newArgs,
    });
  };

  // Validate form
  const isFormValid = () => {
    if (!body?.trim()) return false;
    if (!signature?.value?.trim()) return false;
    if (!signature?.numberOfArguments || signature.numberOfArguments < 1)
      return false;

    // Check all test cases have expected output
    if (!test_cases.every((tc) => tc.expected_output?.trim())) return false;

    // Check all arguments are filled
    for (let i = 0; i < test_cases.length; i++) {
      for (let j = 0; j < numArgs; j++) {
        if (!args[i]?.[j]?.trim()) return false;
      }
    }

    return true;
  };

  // Handle create
  const handleCreateCodeQuestion = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!testId) {
      setError("Test ID is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create question
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

      // Step 2: Create signature
      const signatureResult = await createSignature({
        test: testId,
        question: questionId,
        bodyData: {
          signature: signature.value.trim(),
          arg_nums: signature.numberOfArguments,
        },
      }).unwrap();

      const signatureId = signatureResult.id || signatureResult.data?.id;

      // Step 3: Create test cases (testcases) and arguments
      const createdTestCases = [];
      const createdArguments = [];

      for (let i = 0; i < test_cases.length; i++) {
        // Create testcase (test case)
        const testcaseResult = await createDataset({
          test: testId,
          question: questionId,
          bodyData: {
            expected_output: test_cases[i].expected_output.trim(),
          },
        }).unwrap();

        const testcaseId = testcaseResult.id || testcaseResult.data?.id;
        createdTestCases.push({
          id: testcaseId,
          expected_output: test_cases[i].expected_output.trim(),
        });

        // Create arguments for this test case
        const caseArguments = [];
        for (let j = 0; j < numArgs; j++) {
          const argResult = await createArgument({
            test: testId,
            question: questionId,
            testcase: testcaseId,
            bodyData: {
              body: args[i][j].trim(),
              arg_order: j + 1, // 1-indexed order
            },
          }).unwrap();

          const argId = argResult.id || argResult.data?.id;
          caseArguments.push({
            id: argId,
            value: args[i][j].trim(),
            order: j + 1,
            test_case_id: testcaseId,
          });
        }
        createdArguments.push(...caseArguments);
      }

      // Build final hydrated object
      const finalQuestion = {
        id: questionId,
        type: "code",
        body: body.trim(),
        signature: {
          id: signatureId,
          value: signature.value.trim(),
          numberOfArguments: signature.numberOfArguments,
        },
        test_cases: createdTestCases,
        arguments: createdArguments,
      };

      // Call success callback
      onCreateSuccess(finalQuestion);

      // Reset state
      setCurrentQuestion(null);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to create code question. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 flex items-start md:items-center justify-center bg-black/30 backdrop-blur-sm z-50 overflow-auto ">
      <div className="w-full flex flex-col items-center justify-between min-h-full md:min-h-0 md:max-w-4xl md:max-h-[90vh] p-4 md:p-6 md:border md:border-neutral-200 md:rounded-lg bg-neutral-50 md:my-4 md:overflow-hidden">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-1 min-h-0 w-full">
          {/* Header */}
          <p className="text-base md:text-sm font-medium text-neutral-700">
            New Code Question
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
                onChange={handleBodyChange}
                placeholder="Enter the question description..."
                className="w-full md:hidden h-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none min-h-[150px]"
              />
              <textarea
                value={body || ""}
                onChange={handleBodyChange}
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
                      onChange={handleSignatureValueChange}
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
                        onChange={handleNumberOfArgumentsChange}
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
                      onClick={handleAddTestCase}
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
                              onClick={() => handleRemoveTestCase(caseIndex)}
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
                                        handleArgumentChange(
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
                                handleTestCaseOutputChange(
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
              onClick={handleCreateCodeQuestion}
              disabled={!isFormValid() || isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? "Creating..." : "Create Question"}
            </button>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}
      </div>
    </main>
  );
};

export default CreateTestCodeType;
