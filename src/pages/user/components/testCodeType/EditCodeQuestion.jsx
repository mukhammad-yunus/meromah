import React, { useState, useEffect } from "react";
import CodeQuestionForm from "./CodeQuestionForm";
import { useUpdateQuestionMutation } from "../../../../services/questionsApi";
import { useCreateSignatureMutation, useUpdateSignatureMutation } from "../../../../services/dsaSignaturesApi";
import { useCreateDatasetMutation, useDeleteDatasetMutation } from "../../../../services/dsaDatasetsApi";
import { useCreateArgumentMutation } from "../../../../services/dsaArgumentsApi";

const EditCodeQuestion = ({
  currentQuestion,
  setCurrentQuestion,
  onUpdateSuccess,
  onCancel,
  testId,
  questionTypeId = 1,
  setIsEditMode,
}) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateQuestion] = useUpdateQuestionMutation();
  const [createSignature] = useCreateSignatureMutation();
  const [updateSignature] = useUpdateSignatureMutation();
  const [createDataset] = useCreateDatasetMutation();
  const [deleteDataset] = useDeleteDatasetMutation();
  const [createArgument] = useCreateArgumentMutation();

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
    const new_args = args.map((arg)=> newNumArgs > numArgs? [...arg, ""] : arg.slice(0, newNumArgs));
    setCurrentQuestion({
      ...currentQuestion,
      signature: {
        ...currentQuestion.signature,
        numberOfArguments: newNumArgs,
      },
      arguments: new_args,
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

  const handleUpdateCodeQuestion = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!testId || !currentQuestion?.id) {
      setError("Question ID is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateQuestion({
        test: testId,
        question: currentQuestion.id,
        bodyData: {
          body: body.trim(),
          question_type_id: questionTypeId,
        },
      }).unwrap();

      let signatureId = currentQuestion.signature?.id;
      if (signatureId) {
        await updateSignature({
          test: testId,
          question: currentQuestion.id,
          signature: signatureId,
          bodyData: {
            signature: signature.value.trim(),
            arg_nums: numArgs,
          },
        }).unwrap();
      } else {
        const signatureResult = await createSignature({
          test: testId,
          question: currentQuestion.id,
          bodyData: {
            signature: signature.value.trim(),
            arg_nums: numArgs,
          },
        }).unwrap();
        signatureId = signatureResult.id || signatureResult.data?.id;
      }

      const originalTestCaseIds = currentQuestion.originalTestCaseIds || [];
      for (const testcaseId of originalTestCaseIds) {
        if (!testcaseId) continue;
        await deleteDataset({
          test: testId,
          question: currentQuestion.id,
          testcase: testcaseId,
        }).unwrap();
      }

      const createdTestCases = [];
      const createdArguments = [];

      for (let i = 0; i < test_cases.length; i++) {
        const testcaseResult = await createDataset({
          test: testId,
          question: currentQuestion.id,
          bodyData: {
            expected_output: test_cases[i].expected_output.trim(),
          },
        }).unwrap();

        const testcaseId = testcaseResult.id || testcaseResult.data?.id;
        createdTestCases.push({
          id: testcaseId,
          expected_output: test_cases[i].expected_output.trim(),
        });

        const argsForCase = Array.isArray(args[i]) ? args[i] : [];
        for (let j = 0; j < numArgs; j++) {
          const argValue = (argsForCase[j] || "").trim();
          const argResult = await createArgument({
            test: testId,
            question: currentQuestion.id,
            testcase: testcaseId,
            bodyData: {
              body: argValue,
              arg_order: j + 1,
            },
          }).unwrap();

          const argId = argResult.id || argResult.data?.id;
          createdArguments.push({
            id: argId,
            value: argValue,
            order: j + 1,
            test_case_id: testcaseId,
          });
        }
      }

      const finalQuestion = {
        id: currentQuestion.id,
        type: "code",
        body: body.trim(),
        signature: {
          id: signatureId,
          value: signature.value.trim(),
          numberOfArguments: numArgs,
        },
        test_cases: createdTestCases,
        arguments: createdArguments,
      };

      if (setIsEditMode) {
        setIsEditMode(false);
      }

      if (onUpdateSuccess) {
        onUpdateSuccess(finalQuestion);
      }

      setCurrentQuestion(null);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to update code question. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (setIsEditMode) {
      setIsEditMode(false);
    }
    onCancel();
  };

  return (
    <CodeQuestionForm
      question={currentQuestion}
      error={error}
      isSubmitting={isSubmitting}
      title="Edit Code Question"
      submitButtonText="Update Question"
      submittingButtonText="Updating..."
      onBodyChange={handleBodyChange}
      onSignatureValueChange={handleSignatureValueChange}
      onNumberOfArgumentsChange={handleNumberOfArgumentsChange}
      onAddTestCase={handleAddTestCase}
      onRemoveTestCase={handleRemoveTestCase}
      onArgumentChange={handleArgumentChange}
      onTestCaseOutputChange={handleTestCaseOutputChange}
      onSubmit={handleUpdateCodeQuestion}
      onCancel={handleCancel}
      onErrorClose={() => setError(null)}
      isFormValid={isFormValid()}
    />
  );
};

export default EditCodeQuestion;
