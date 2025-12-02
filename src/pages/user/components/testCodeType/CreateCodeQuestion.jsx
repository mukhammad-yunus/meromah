import React, { useState, useEffect } from "react";
import { useCreateQuestionMutation } from "../../../../services/questionsApi";
import { useCreateSignatureMutation } from "../../../../services/dsaSignaturesApi";
import { useCreateDatasetMutation } from "../../../../services/dsaDatasetsApi";
import { useCreateArgumentMutation } from "../../../../services/dsaArgumentsApi";
import CodeQuestionForm from "./CodeQuestionForm";

const CreateCodeQuestion = ({
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
        signature: { value: "", numberOfArguments: 0 },
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
    if (signature.numberOfArguments < 0)
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
    <CodeQuestionForm
      question={currentQuestion}
      error={error}
      isSubmitting={isSubmitting}
      title="New Code Question"
      submitButtonText="Create Question"
      submittingButtonText="Creating..."
      onBodyChange={handleBodyChange}
      onSignatureValueChange={handleSignatureValueChange}
      onNumberOfArgumentsChange={handleNumberOfArgumentsChange}
      onAddTestCase={handleAddTestCase}
      onRemoveTestCase={handleRemoveTestCase}
      onArgumentChange={handleArgumentChange}
      onTestCaseOutputChange={handleTestCaseOutputChange}
      onSubmit={handleCreateCodeQuestion}
      onCancel={onCancel}
      onErrorClose={() => setError(null)}
      isFormValid={isFormValid()}
    />
  );
};

export default CreateCodeQuestion;
