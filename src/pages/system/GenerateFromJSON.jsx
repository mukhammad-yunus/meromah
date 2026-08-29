import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  X,
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react";
import AutoResizeTextarea from "../user/components/AutoResizeTextarea";
import QuestionPreviewItem from "../user/components/QuestionPreviewItem";
import { useGetQuestionTypesQuery } from "../../services/questionTypesApi";
import { useCreateTestMutation, useUpdateTestMutation } from "../../services/testsApi";
import { useCreateQuestionMutation } from "../../services/questionsApi";
import { useCreateOptionMutation } from "../../services/questionOptionsApi";
import { useCreateSignatureMutation } from "../../services/dsaSignaturesApi";
import { useCreateDatasetMutation } from "../../services/dsaDatasetsApi";
import { useCreateArgumentMutation } from "../../services/dsaArgumentsApi";
import CommunitySelection from "../user/components/CommunitySelection";

const GenerateFromJSON = ({ onSuccess, onCancel }) => {
  const [jsonInput, setJsonInput] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [creationError, setCreationError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [createdTestId, setCreatedTestId] = useState(null);
  const [createdTestData, setCreatedTestData] = useState(null);
  const [createdQuestions, setCreatedQuestions] = useState([]);
  const fileInputRef = useRef(null);
  const progressRefs = useRef({});
  const selectedDescNameRef = useRef(null);
  const descSelectionResetRef = useRef(null);

  const { data: questionTypes } = useGetQuestionTypesQuery();
  const [createTest] = useCreateTestMutation();
  const [updateTest] = useUpdateTestMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [createOption] = useCreateOptionMutation();
  const [createSignature] = useCreateSignatureMutation();
  const [createDataset] = useCreateDatasetMutation();
  const [createArgument] = useCreateArgumentMutation();

  // Initialize progress steps
  useEffect(() => {
    if (parsedData && parsedData.questions) {
      const steps = [];
      steps.push({ id: "create-test", label: "Create test", status: "pending" });
      
      parsedData.questions.forEach((q, qIndex) => {
        steps.push({
          id: `question-${qIndex}`,
          label: `Create question ${qIndex + 1}`,
          status: "pending",
        });
        
        if (q.type === "code") {
          steps.push({
            id: `signature-${qIndex}`,
            label: `Create signature for question ${qIndex + 1}`,
            status: "pending",
          });
          
          q.test_cases?.forEach((tc, tcIndex) => {
            steps.push({
              id: `testcase-${qIndex}-${tcIndex}`,
              label: `Create test case ${tcIndex + 1}`,
              status: "pending",
            });
            
            q.arguments?.[tcIndex]?.forEach((arg, argIndex) => {
              steps.push({
                id: `argument-${qIndex}-${tcIndex}-${argIndex}`,
                label: `Create argument ${argIndex + 1}`,
                status: "pending",
              });
            });
          });
        } else if (q.type === "mcq") {
          q.options?.forEach((opt, optIndex) => {
            steps.push({
              id: `option-${qIndex}-${optIndex}`,
              label: `Create option ${optIndex + 1}`,
              status: "pending",
            });
          });
        }
      });
      
      setProgressSteps(steps);
    }
  }, [parsedData]);

  // Scroll to current step
  useEffect(() => {
    if (currentStepIndex >= 0 && progressRefs.current[currentStepIndex]) {
      progressRefs.current[currentStepIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentStepIndex]);

  const updateStepStatus = (stepId, status) => {
    setProgressSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const findStepIndex = (stepId) => {
    return progressSteps.findIndex((s) => s.id === stepId);
  };

  // Mark all question-related steps as error
  const markQuestionStepsAsError = (qIndex) => {
    // Mark question step
    updateStepStatus(`question-${qIndex}`, "error");
    
    // Mark all related steps for this question
    progressSteps.forEach((step) => {
      if (step.id.startsWith(`signature-${qIndex}`) ||
          step.id.startsWith(`testcase-${qIndex}`) ||
          step.id.startsWith(`argument-${qIndex}`) ||
          step.id.startsWith(`option-${qIndex}`)) {
        updateStepStatus(step.id, "error");
      }
    });
  };

  // Extract function name from signature value
  const extractFunctionName = (signatureValue) => {
    if (!signatureValue || typeof signatureValue !== "string") return "";
    
    // Remove "def " prefix if present
    let funcName = signatureValue.trim();
    if (funcName.startsWith("def ")) {
      funcName = funcName.substring(4);
    }
    
    // Extract just the function name (before opening parenthesis)
    const match = funcName.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (match) {
      return match[1];
    }
    
    // If no match, try to get first word (for cases like "add" without parentheses)
    const firstWord = funcName.split(/\s*[\(:]/)[0].trim();
    return firstWord || signatureValue.trim();
  };

  // Validate JSON structure
  const validateJSON = (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      errors.push({ field: "title", message: "Test title is required" });
    }

    if (!data.description || typeof data.description !== "string" || !data.description.trim()) {
      errors.push({ field: "description", message: "Test description is required" });
    }

    if (!data.desc || typeof data.desc !== "string" || !data.desc.trim()) {
      if (!selectedDescNameRef.current) {
        errors.push({ field: "desc", message: "Desc (community) is required" });
      }
    }

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      errors.push({ field: "questions", message: "At least one question is required" });
      return errors;
    }

    if (!questionTypes) {
      errors.push({ field: "questionTypes", message: "Question types not loaded" });
      return errors;
    }

    data.questions.forEach((question, qIndex) => {
      if (!question.type || (question.type !== "code" && question.type !== "mcq")) {
        errors.push({
          field: `questions[${qIndex}].type`,
          message: `Question ${qIndex + 1}: type must be "code" or "mcq"`,
        });
      }

      if (!question.body || typeof question.body !== "string" || !question.body.trim()) {
        errors.push({
          field: `questions[${qIndex}].body`,
          message: `Question ${qIndex + 1}: body is required`,
        });
      }

      if (question.type === "code") {
        if (!question.signature || typeof question.signature !== "object") {
          errors.push({
            field: `questions[${qIndex}].signature`,
            message: `Question ${qIndex + 1}: signature object is required`,
          });
        } else {
          if (!question.signature.value || typeof question.signature.value !== "string" || !question.signature.value.trim()) {
            errors.push({
              field: `questions[${qIndex}].signature.value`,
              message: `Question ${qIndex + 1}: signature.value is required`,
            });
          }
          if (typeof question.signature.numberOfArguments !== "number" || question.signature.numberOfArguments < 0) {
            errors.push({
              field: `questions[${qIndex}].signature.numberOfArguments`,
              message: `Question ${qIndex + 1}: signature.numberOfArguments must be >= 0`,
            });
          }
        }

        if (!Array.isArray(question.test_cases) || question.test_cases.length === 0) {
          errors.push({
            field: `questions[${qIndex}].test_cases`,
            message: `Question ${qIndex + 1}: at least one test case is required`,
          });
        } else {
          question.test_cases.forEach((tc, tcIndex) => {
            if (!tc.expected_output || typeof tc.expected_output !== "string" || !tc.expected_output.trim()) {
              errors.push({
                field: `questions[${qIndex}].test_cases[${tcIndex}].expected_output`,
                message: `Question ${qIndex + 1}, test case ${tcIndex + 1}: expected_output is required`,
              });
            }
          });
        }

        if (!Array.isArray(question.arguments)) {
          errors.push({
            field: `questions[${qIndex}].arguments`,
            message: `Question ${qIndex + 1}: arguments must be an array`,
          });
        } else {
          const numArgs = question.signature?.numberOfArguments || 0;
          if (question.arguments.length !== question.test_cases.length) {
            errors.push({
              field: `questions[${qIndex}].arguments`,
              message: `Question ${qIndex + 1}: arguments array length must match test_cases length`,
            });
          } else {
            question.arguments.forEach((argArray, tcIndex) => {
              if (!Array.isArray(argArray) || argArray.length !== numArgs) {
                errors.push({
                  field: `questions[${qIndex}].arguments[${tcIndex}]`,
                  message: `Question ${qIndex + 1}, test case ${tcIndex + 1}: arguments array must have ${numArgs} elements`,
                });
              } else {
                argArray.forEach((arg, argIndex) => {
                  if (typeof arg !== "string" || !arg.trim()) {
                    errors.push({
                      field: `questions[${qIndex}].arguments[${tcIndex}][${argIndex}]`,
                      message: `Question ${qIndex + 1}, test case ${tcIndex + 1}, argument ${argIndex + 1}: must be a non-empty string`,
                    });
                  }
                });
              }
            });
          }
        }
      } else if (question.type === "mcq") {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push({
            field: `questions[${qIndex}].options`,
            message: `Question ${qIndex + 1}: at least 2 options are required`,
          });
        } else {
          question.options.forEach((opt, optIndex) => {
            if (!opt.body || typeof opt.body !== "string" || !opt.body.trim()) {
              errors.push({
                field: `questions[${qIndex}].options[${optIndex}].body`,
                message: `Question ${qIndex + 1}, option ${optIndex + 1}: body is required`,
              });
            }
            if (typeof opt.is_correct !== "boolean") {
              errors.push({
                field: `questions[${qIndex}].options[${optIndex}].is_correct`,
                message: `Question ${qIndex + 1}, option ${optIndex + 1}: is_correct must be a boolean`,
              });
            }
          });

          const hasCorrect = question.options.some((opt) => opt.is_correct);
          if (!hasCorrect) {
            errors.push({
              field: `questions[${qIndex}].options`,
              message: `Question ${qIndex + 1}: at least one option must be correct`,
            });
          }
        }
      }
    });

    return errors;
  };

  const handleFileSelect = (file) => {
    if (file.type !== "application/json") {
      setValidationErrors([{ field: "file", message: "Please select a JSON file" }]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setJsonInput(e.target.result);
        setValidationErrors([]);
      } catch (err) {
        setValidationErrors([{ field: "file", message: "Failed to read file" }]);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleValidateAndPreview = () => {
    setValidationErrors([]);
    setParsedData(null);
    setShowPreview(false);

    try {
      const parsed = JSON.parse(jsonInput);
      const errors = validateJSON(parsed);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      if (!parsed.desc && selectedDescNameRef.current) {
        parsed.desc = selectedDescNameRef.current;
      }

      setParsedData(parsed);
      setShowPreview(true);
    } catch (err) {
      setValidationErrors([
        { field: "json", message: `Invalid JSON: ${err.message}` },
      ]);
    }
  };

  const handleSelectDesc = (desc) => {
    selectedDescNameRef.current = desc.name;
  };

  const handleClearDescSelection = () => {
    selectedDescNameRef.current = null;
  };

  // Create test from JSON - exact same order as CreateTest.jsx
  const handleCreateFromJSON = async () => {
    if (!parsedData || isCreating) return;

    setIsCreating(true);
    setCreationError(null);
    setCurrentStepIndex(0);
    setCreatedQuestions([]);
    setCreatedTestData(null);

    try {
      const desc = parsedData.desc || selectedDescNameRef.current;
      if (!desc) {
        throw new Error("Desc (community) is required");
      }

      // Step 1: Create test (same as CreateTestHeader handleInitializeTest)
      const stepId = "create-test";
      const stepIdx = findStepIndex(stepId);
      if (stepIdx >= 0) {
        setCurrentStepIndex(stepIdx);
        updateStepStatus(stepId, "in_progress");
      }

      let testId;
      try {
        const testResult = await createTest({
          desc,
          bodyData: {
            title: parsedData.title.trim(),
            description: parsedData.description.trim(),
          },
        }).unwrap();

        testId = testResult.data?.id || testResult.id;
        if (!testId) {
          throw new Error("Failed to get test ID from response");
        }

        setCreatedTestId(testId);
        setCreatedTestData({
          title: parsedData.title.trim(),
          description: parsedData.description.trim(),
          desc,
          id: testId,
        });

        if (stepIdx >= 0) {
          updateStepStatus(stepId, "done");
        }
      } catch (err) {
        // Test initialization failed - mark all steps as error and stop
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          "Failed to create test";
        setCreationError(errorMessage);
        
        if (stepIdx >= 0) {
          updateStepStatus(stepId, "error");
        }
        
        // Mark all remaining steps as error
        progressSteps.forEach((step) => {
          if (step.status === "pending") {
            updateStepStatus(step.id, "error");
          }
        });
        
        setIsCreating(false);
        return;
      }

      // Step 2: Create questions (same as CreateCodeQuestion/CreateMcqQuestion)
      for (let qIndex = 0; qIndex < parsedData.questions.length; qIndex++) {
        const question = parsedData.questions[qIndex];
        const questionTypeId =
          question.type === "code"
            ? questionTypes.code.id
            : questionTypes.mcq.id;

        // Wrap entire question creation in try-catch to skip on error
        try {
          // Create question (same as CreateCodeQuestion handleCreateCodeQuestion Step 1)
          const questionStepId = `question-${qIndex}`;
          const questionStepIdx = findStepIndex(questionStepId);
          if (questionStepIdx >= 0) {
            setCurrentStepIndex(questionStepIdx);
            updateStepStatus(questionStepId, "in_progress");
          }

          let questionId;
          try {
            const questionResult = await createQuestion({
              test: testId,
              bodyData: {
                body: question.body.trim(),
                question_type_id: questionTypeId,
              },
            }).unwrap();

            questionId = questionResult.id || questionResult.data?.id;
            if (!questionId) {
              throw new Error("Failed to get question ID from response");
            }

            if (questionStepIdx >= 0) {
              updateStepStatus(questionStepId, "done");
            }
          } catch (err) {
            const errorMessage =
              err?.data?.message ||
              err?.message ||
              `Failed to create question ${qIndex + 1}`;
            setCreationError(errorMessage);
            markQuestionStepsAsError(qIndex);
            continue; // Skip this question
          }

          if (question.type === "code") {
            // Create signature (same as CreateCodeQuestion Step 2)
            const signatureStepId = `signature-${qIndex}`;
            const signatureStepIdx = findStepIndex(signatureStepId);
            if (signatureStepIdx >= 0) {
              setCurrentStepIndex(signatureStepIdx);
              updateStepStatus(signatureStepId, "in_progress");
            }

            let signatureId;
            try {
              // Extract function name from signature value
              const functionName = extractFunctionName(question.signature.value);
              
              const signatureResult = await createSignature({
                test: testId,
                question: questionId,
                bodyData: {
                  signature: functionName,
                  arg_nums: question.signature.numberOfArguments,
                },
              }).unwrap();

              signatureId = signatureResult.id || signatureResult.data?.id;
              if (signatureStepIdx >= 0) {
                updateStepStatus(signatureStepId, "done");
              }
            } catch (err) {
              const errorMessage =
                err?.data?.message ||
                err?.message ||
                `Failed to create signature for question ${qIndex + 1}`;
              setCreationError(errorMessage);
              markQuestionStepsAsError(qIndex);
              continue; // Skip this question
            }

            // Create test cases and arguments (same as CreateCodeQuestion Step 3)
            const createdTestCases = [];
            const createdArguments = [];

            for (let tcIndex = 0; tcIndex < question.test_cases.length; tcIndex++) {
              const testCase = question.test_cases[tcIndex];

              const testcaseStepId = `testcase-${qIndex}-${tcIndex}`;
              const testcaseStepIdx = findStepIndex(testcaseStepId);
              if (testcaseStepIdx >= 0) {
                setCurrentStepIndex(testcaseStepIdx);
                updateStepStatus(testcaseStepId, "in_progress");
              }

              let testcaseId;
              try {
                const testcaseResult = await createDataset({
                  test: testId,
                  question: questionId,
                  bodyData: {
                    expected_output: testCase.expected_output.trim(),
                  },
                }).unwrap();

                testcaseId = testcaseResult.id || testcaseResult.data?.id;
                if (!testcaseId) {
                  throw new Error("Failed to get test case ID from response");
                }

                createdTestCases.push({
                  id: testcaseId,
                  expected_output: testCase.expected_output.trim(),
                });

                if (testcaseStepIdx >= 0) {
                  updateStepStatus(testcaseStepId, "done");
                }
              } catch (err) {
                const errorMessage =
                  err?.data?.message ||
                  err?.message ||
                  `Failed to create test case ${tcIndex + 1} for question ${qIndex + 1}`;
                setCreationError(errorMessage);
                if (testcaseStepIdx >= 0) {
                  updateStepStatus(testcaseStepId, "error");
                }
                // Mark all arguments for this test case as error
                question.arguments[tcIndex]?.forEach((_, argIndex) => {
                  updateStepStatus(`argument-${qIndex}-${tcIndex}-${argIndex}`, "error");
                });
                continue; // Skip this test case
              }

              // Create arguments for this test case
              const argArray = question.arguments[tcIndex] || [];
              for (let argIndex = 0; argIndex < argArray.length; argIndex++) {
                const argValue = argArray[argIndex];

                const argumentStepId = `argument-${qIndex}-${tcIndex}-${argIndex}`;
                const argumentStepIdx = findStepIndex(argumentStepId);
                if (argumentStepIdx >= 0) {
                  setCurrentStepIndex(argumentStepIdx);
                  updateStepStatus(argumentStepId, "in_progress");
                }

                try {
                  const argResult = await createArgument({
                    test: testId,
                    question: questionId,
                    testcase: testcaseId,
                    bodyData: {
                      body: argValue.trim(),
                      arg_order: argIndex + 1,
                    },
                  }).unwrap();

                  const argId = argResult.id || argResult.data?.id;
                  createdArguments.push({
                    id: argId,
                    value: argValue.trim(),
                    order: argIndex + 1,
                    test_case_id: testcaseId,
                  });

                  if (argumentStepIdx >= 0) {
                    updateStepStatus(argumentStepId, "done");
                  }
                } catch (err) {
                  const errorMessage =
                    err?.data?.message ||
                    err?.message ||
                    `Failed to create argument ${argIndex + 1} for test case ${tcIndex + 1}`;
                  setCreationError(errorMessage);
                  if (argumentStepIdx >= 0) {
                    updateStepStatus(argumentStepId, "error");
                  }
                }
              }
            }

            // Build final question object (same structure as CreateCodeQuestion)
            const finalQuestion = {
              id: questionId,
              type: "code",
              body: question.body.trim(),
              signature: {
                id: signatureId,
                value: extractFunctionName(question.signature.value),
                numberOfArguments: question.signature.numberOfArguments,
              },
              test_cases: createdTestCases,
              arguments: createdArguments,
            };

            setCreatedQuestions((prev) => [...prev, finalQuestion]);
          } else if (question.type === "mcq") {
            // Create options (same as CreateMcqQuestion)
            const createdOptions = [];
            for (let optIndex = 0; optIndex < question.options.length; optIndex++) {
              const option = question.options[optIndex];

              const optionStepId = `option-${qIndex}-${optIndex}`;
              const optionStepIdx = findStepIndex(optionStepId);
              if (optionStepIdx >= 0) {
                setCurrentStepIndex(optionStepIdx);
                updateStepStatus(optionStepId, "in_progress");
              }

              try {
                const optionResult = await createOption({
                  test: testId,
                  question: questionId,
                  bodyData: {
                    body: option.body.trim(),
                    is_correct: option.is_correct,
                  },
                }).unwrap();

                const optionId = optionResult.id || optionResult.data?.id;
                createdOptions.push({
                  id: optionId,
                  body: option.body.trim(),
                  is_correct: option.is_correct,
                });

                if (optionStepIdx >= 0) {
                  updateStepStatus(optionStepId, "done");
                }
              } catch (err) {
                const errorMessage =
                  err?.data?.message ||
                  err?.message ||
                  `Failed to create option ${optIndex + 1} for question ${qIndex + 1}`;
                setCreationError(errorMessage);
                if (optionStepIdx >= 0) {
                  updateStepStatus(optionStepId, "error");
                }
              }
            }

            // Build final question object (same structure as CreateMcqQuestion)
            const finalQuestion = {
              id: questionId,
              type: "mcq",
              body: question.body.trim(),
              options: createdOptions,
            };

            setCreatedQuestions((prev) => [...prev, finalQuestion]);
          }
        } catch (err) {
          // Catch any unexpected errors for this question
          const errorMessage =
            err?.data?.message ||
            err?.message ||
            `Failed to create question ${qIndex + 1}`;
          setCreationError(errorMessage);
          markQuestionStepsAsError(qIndex);
          continue; // Skip this question
        }
      }

      // All questions processed, show publish confirmation
      setShowPublishConfirm(true);
      setIsCreating(false);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to create test from JSON";
      setCreationError(errorMessage);
      setIsCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!createdTestId) return;

    setIsCreating(true);
    setCreationError(null);

    try {
      const desc = parsedData.desc || selectedDescNameRef.current;
      
      // Publish test (same as CreateTest handleTestSubmit)
      await updateTest({
        desc,
        test: createdTestId,
        testData: {
          status: "published",
        },
      }).unwrap();

      setShowPublishConfirm(false);
      if (onSuccess) {
        onSuccess({ desc, testId: createdTestId });
      }
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to publish test";
      setCreationError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const renderHowToSection = () => {
    if (!questionTypes) return null;

    return (
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setShowHowTo(!showHowTo)}
          className="w-full flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            How to format JSON
          </span>
          {showHowTo ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {showHowTo && (
          <div className="mt-4 space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
            <div>
              <p className="font-medium mb-2 text-neutral-900 dark:text-neutral-100">Base structure:</p>
              <pre className="bg-neutral-900 dark:bg-neutral-950 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "title": "Test Title",
  "description": "Description",
  "desc": "desc name",
  "questions": [
    // Add question templates below
  ]
}`}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2 text-neutral-900 dark:text-neutral-100">MCQ question template (minimum 2 options, can have multiple correct):</p>
              <pre className="bg-neutral-900 dark:bg-neutral-950 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "type": "mcq",
  "body": "What is 2 + 2?",
  "options": [
    { "body": "3", "is_correct": false },
    { "body": "4", "is_correct": true },
    { "body": "5", "is_correct": false }
  ]
}`}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2 text-neutral-900 dark:text-neutral-100">Code question template (multiple test cases with multiple arguments):</p>
              <pre className="bg-neutral-900 dark:bg-neutral-950 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "type": "code",
  "body": "Write a function that adds two numbers.",
  "signature": {
    "value": "add",
    "numberOfArguments": 2
  },
  "test_cases": [
    { "expected_output": "3" },
    { "expected_output": "10" },
    { "expected_output": "-5" }
  ],
  "arguments": [
    ["1", "2"],
    ["5", "5"],
    ["-10", "5"]
  ]
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Test Information Card - matching CreateTestHeader */}
      {createdTestData && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-1 text-xs font-medium text-primary-blue dark:text-blue-400 bg-primary-blue/10 dark:bg-blue-400/20 border border-primary-blue/20 dark:border-blue-400/30 rounded-md">
                d/{createdTestData.desc}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {createdTestData.title}
              </h3>
            </div>
            
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {createdTestData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desc Selection */}
      {!parsedData?.desc && (
        <CommunitySelection
          communityType="desc"
          onSelectCommunity={handleSelectDesc}
          onClearSelection={handleClearDescSelection}
          resetRef={descSelectionResetRef}
          disabled={isCreating}
        />
      )}

      {/* How to Section */}
      {renderHowToSection()}

      {/* File Upload / JSON Input */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          JSON Input
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? "border-primary-blue bg-primary-blue/5 dark:bg-primary-blue/10"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Drag and drop a JSON file here, or
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary-blue dark:text-blue-400 hover:underline"
          >
            browse files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>

        <AutoResizeTextarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setValidationErrors([]);
            setParsedData(null);
            setShowPreview(false);
          }}
          placeholder='Paste or type JSON here...'
          className="w-full min-h-[200px] px-3 py-2 text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
          disabled={isCreating}
        />

        {validationErrors.length > 0 && (
          <div className="border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Validation Errors
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>
                    <code className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">
                      {error.field}
                    </code>
                    : {error.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={handleValidateAndPreview}
          disabled={!jsonInput.trim() || isCreating}
          className="w-full px-4 py-2 text-sm font-medium bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
        >
          Validate & Preview
        </button>
      </div>

      {/* Preview Section - using QuestionPreviewItem */}
      {showPreview && parsedData && (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Preview
          </h3>
          <div className="space-y-4 mb-4">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Title:
              </p>
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                {parsedData.title}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description:
              </p>
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                {parsedData.description}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Questions ({parsedData.questions.length}):
              </p>
              <div className="flex flex-col gap-3">
                {parsedData.questions.map((q, idx) => {
                  // Transform to match QuestionPreviewItem expected format
                  const previewQuestion = {
                    ...q,
                    id: `preview-${idx}`,
                    signature: q.type === "code" && q.signature ? {
                      ...q.signature,
                      value: extractFunctionName(q.signature.value),
                    } : q.signature,
                  };
                  return (
                    <QuestionPreviewItem
                      key={idx}
                      question={previewQuestion}
                      questionTypes={questionTypes}
                      index={idx}
                      onRemove={() => {}}
                      onEdit={() => {}}
                      testId={null}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {isCreating && progressSteps.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Creating Test...
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {progressSteps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const getStatusIcon = () => {
                if (step.status === "done") {
                  return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
                }
                if (step.status === "in_progress") {
                  return <Loader2 className="w-5 h-5 text-primary-blue dark:text-blue-400 animate-spin" />;
                }
                if (step.status === "error") {
                  return <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
                }
                return <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 rounded-full" />;
              };

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    if (isActive) progressRefs.current[idx] = el;
                  }}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isActive ? "bg-primary-blue/10 dark:bg-primary-blue/20" : ""
                  }`}
                >
                  {getStatusIcon()}
                  <span
                    className={`text-sm ${
                      step.status === "done"
                        ? "text-green-700 dark:text-green-300"
                        : step.status === "error"
                        ? "text-red-700 dark:text-red-300"
                        : step.status === "in_progress"
                        ? "text-primary-blue dark:text-blue-400 font-medium"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Publish Confirmation */}
      {showPublishConfirm && (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Test Created Successfully
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {createdQuestions.length} question(s) created. Publish the test?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? "Publishing..." : "Publish Test"}
            </button>
            <button
              type="button"
              onClick={() => setShowPublishConfirm(false)}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Creation Error */}
      {creationError && (
        <div className="border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {creationError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreationError(null)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {showPreview && parsedData && !showPublishConfirm && (
          <button
            type="button"
            onClick={handleCreateFromJSON}
            disabled={isCreating || (!parsedData.desc && !selectedDescNameRef.current)}
            className="px-6 py-2 text-sm font-medium bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? "Creating..." : "Confirm & Create"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GenerateFromJSON;
