import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import CommunitySelection from "./CommunitySelection";
import { useCreateTestMutation, useUpdateTestMutation } from "../../../services/testsApi";
import { Pencil } from "lucide-react";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";

const CreateTestHeader = ({
  descId,
  draftTest,
  setDraftTest,
  setQuestions,
  onCancel,
}) => {
  const testTitleRef = useRef(null);
  const testDescriptionRef = useRef(null);
  const selectedDescNameRef = useRef(null);
  const descSelectionResetRef = useRef(null);

  const [isFormValidForTestInit, setIsFormValidForTestInit] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [createTest] = useCreateTestMutation();
  const [updateTest] = useUpdateTestMutation();

  const testId = useMemo(
    () => (draftTest === null ? null : draftTest.id),
    [draftTest]
  );

  const checkFormValidity = useCallback(() => {
    const testTitle = testTitleRef.current?.value?.trim() || "";
    const testDescription = testDescriptionRef.current?.value?.trim() || "";
    const hasDesc = descId || selectedDescNameRef.current;
    setIsFormValidForTestInit(
      testTitle.length > 0 && testDescription.length > 0 && hasDesc
    );
  }, [descId]);

  useEffect(() => {
    if (draftTest === null) {
      // Reset form when draftTest is null
      if (testTitleRef.current) testTitleRef.current.value = "";
      if (testDescriptionRef.current) testDescriptionRef.current.value = "";
      selectedDescNameRef.current = null;
      setIsEditMode(false);
      setIsFormValidForTestInit(false);
      return;
    }
    // Only update form fields if not in edit mode (to avoid overwriting user input)
    if (!isEditMode) {
      testTitleRef.current.value = draftTest.title || "";
      testDescriptionRef.current.value = draftTest.description || "";
      selectedDescNameRef.current = draftTest.desc;
    }
    setQuestions(draftTest?.questions || []);
    checkFormValidity();
  }, [draftTest, setQuestions, isEditMode, checkFormValidity]);

  const handleSelectDesc = (desc) => {
    selectedDescNameRef.current = desc.name;
    checkFormValidity();
  };

  const handleClearDescSelection = () => {
    selectedDescNameRef.current = null;
    checkFormValidity();
  };

  const handleInitializeTest = async () => {
    try {
      const bodyData = {
        title: testTitleRef.current.value.trim(),
        description: testDescriptionRef.current.value.trim(),
      };
      const res = await createTest({
        desc: descId? descId: selectedDescNameRef.current,
        bodyData,
      }).unwrap();
      const testDetails = {
        ...bodyData,
        desc: descId? descId: selectedDescNameRef.current,
        id: res.data.id,
        date: new Date().toISOString(),
      };
      setDraftTest(testDetails);
    } catch (err) {
      //TODO: Handle error
    }
  };

  const handleUpdateTest = async () => {
    if (!testId || !draftTest) return;
    try {
      const bodyData = {
        title: testTitleRef.current.value.trim(),
        description: testDescriptionRef.current.value.trim(),
      };
      const desc = selectedDescNameRef.current || draftTest.desc;
      
      await updateTest({
        desc: desc,
        test: testId,
        bodyData,
      }).unwrap();

      const updatedTestDetails = {
        ...bodyData,
        desc: desc,
        id: testId,
        date: draftTest.date || new Date().toISOString(),
        questions: draftTest.questions || [],
      };
      
      setDraftTest(updatedTestDetails);
      setIsEditMode(false);
    } catch (err) {
      //TODO: Handle error
    }
  };

  const handleCancel = () => {
    if (isEditMode && draftTest) {
      testTitleRef.current.value = draftTest.title || "";
      testDescriptionRef.current.value = draftTest.description || "";
      selectedDescNameRef.current = draftTest.desc;
      setIsEditMode(false);
      checkFormValidity();
    } else {
      if (testTitleRef.current) testTitleRef.current.value = "";
      if (testDescriptionRef.current) testDescriptionRef.current.value = "";
      selectedDescNameRef.current = null;
      setIsFormValidForTestInit(false);
      if (descSelectionResetRef.current) {
        descSelectionResetRef.current();
      }
      if (onCancel) {
        onCancel();
      }
    }
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const isFormDisabled = testId !== null && !isEditMode;

  return (
    <>
      <div className={isEditMode || testId === null ? "flex flex-col gap-4" : "hidden"}>
        {/* Desc Selection - only show when descId is not provided */}
        {!descId && (
          <CommunitySelection
            communityName={draftTest ? draftTest.desc : undefined}
            communityType={"desc"}
            onSelectCommunity={handleSelectDesc}
            onClearSelection={handleClearDescSelection}
            resetRef={descSelectionResetRef}
            disabled={isFormDisabled}
          />
        )}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Test Title *
          </label>
          <input
            ref={testTitleRef}
            disabled={isFormDisabled}
            type="text"
            placeholder="Test title"
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition disabled:text-neutral-500 dark:disabled:text-neutral-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Test Description * <small className="text-xs text-neutral-400">(Markdown supported)</small>
          </label>
          <textarea
            ref={testDescriptionRef}
            disabled={isFormDisabled}
            placeholder="Describe your test..."
            rows={4}
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-y disabled:text-neutral-500 dark:disabled:text-neutral-500"
          />
        </div>
      </div>

      {/* Test Details Display */}
      {testId !== null && !isEditMode && draftTest && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-1 text-xs font-medium text-primary-blue dark:text-blue-400 bg-primary-blue/10 dark:bg-blue-400/20 border border-primary-blue/20 dark:border-blue-400/30 rounded-md">
                d/{draftTest.desc || selectedDescNameRef.current}
              </span>
            </div>
            <button
              type="button"
              onClick={handleEnterEditMode}
              className="flex-shrink-0 p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-blue/30"
              aria-label="Edit test details"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {draftTest.title}
              </h3>
            </div>
            
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <MarkdownViewer>{draftTest.description}</MarkdownViewer>
              {/* <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              </p> */}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 pt-2">
        {testId === null ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormValidForTestInit}
              onClick={handleInitializeTest}
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              Initialize Test
            </button>
          </>
        ) : isEditMode ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormValidForTestInit}
              onClick={handleUpdateTest}
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              Update Test
            </button>
          </>
        ) : null}
      </div>
    </>
  );
};

export default CreateTestHeader;