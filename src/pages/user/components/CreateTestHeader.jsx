import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import CommunitySelection from "./CommunitySelection";
import { useCreateTestMutation, useUpdateTestMutation } from "../../../services/testsApi";
import { HiPencil } from "react-icons/hi";

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
      localStorage.setItem(
        "unfinished-test",
        JSON.stringify({ ...testDetails, questions: [] })
      );
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
      localStorage.setItem(
        "unfinished-test",
        JSON.stringify(updatedTestDetails)
      );
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
          <label className="text-sm font-medium text-neutral-800">
            Test Title *
          </label>
          <input
            ref={testTitleRef}
            disabled={isFormDisabled}
            type="text"
            placeholder="Test title"
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors disabled:text-neutral-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Description *
          </label>
          <textarea
            ref={testDescriptionRef}
            disabled={isFormDisabled}
            placeholder="Describe your test..."
            rows={4}
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors resize-y disabled:text-neutral-500"
          />
        </div>
      </div>

      {/* Test Details Display */}
      {testId !== null && !isEditMode && draftTest && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-1 text-xs font-medium text-primary-blue bg-primary-blue/10 border border-primary-blue/20 rounded-md">
                d/{draftTest.desc || selectedDescNameRef.current}
              </span>
            </div>
            <button
              type="button"
              onClick={handleEnterEditMode}
              className="flex-shrink-0 p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
              aria-label="Edit test details"
            >
              <HiPencil className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {draftTest.title}
              </h3>
            </div>
            
            <div className="pt-2 border-t border-neutral-100">
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {draftTest.description}
              </p>
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
              className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormValidForTestInit}
              onClick={handleInitializeTest}
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              Initialize Test
            </button>
          </>
        ) : isEditMode ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormValidForTestInit}
              onClick={handleUpdateTest}
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
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