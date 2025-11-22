import React, { useState, useRef } from "react";
import CommunitySelection from "./CommunitySelection";

const CreateTest = ({ descId, onCancel = undefined, onError }) => {
  const testTitleRef = useRef(null);
  const testDescriptionRef = useRef(null);
  const selectedDescNameRef = useRef(null);
  const descSelectionResetRef = useRef(null);

  const [isFormValid, setIsFormValid] = useState(false);


  const checkFormValidity = () => {
    const testTitle = testTitleRef.current?.value?.trim() || "";
    const testDescription = testDescriptionRef.current?.value?.trim() || "";
    const hasDesc = descId || selectedDescNameRef.current;
    setIsFormValid(
      testTitle.length > 0 && testDescription.length > 0 && hasDesc
    );
  };

  const handleSelectDesc = (desc) => {
    selectedDescNameRef.current = desc.name;
    checkFormValidity();
  };

  const handleClearDescSelection = () => {
    selectedDescNameRef.current = null;
    checkFormValidity();
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    // TODO: Gather test data, questions, files, and submit
  };

  const onResetTestForm = () => {
    // TODO: Clear test data, questions, files, and Cancel
  };

  return (
    <form
      onSubmit={handleTestSubmit}
      className={`p-4 flex flex-col justify-between h-screen ${
        !descId &&
        "max-h-5/6 bg-white rounded-lg shadow-sm border border-neutral-200 m-6"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Desc Selection - only show when descId is not provided */}
        {!descId && (
          <CommunitySelection
            communityType={"desc"}
            onSelectBoard={handleSelectDesc}
            onClearSelection={handleClearDescSelection}
            resetRef={descSelectionResetRef}
          />
        )}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Title *
          </label>
          <input
            ref={testTitleRef}
            type="text"
            placeholder="Test title"
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Test Description *
          </label>
          <textarea
            ref={testDescriptionRef}
            placeholder="Describe your test..."
            rows={4}
            onChange={checkFormValidity}
            className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors resize-y"
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
        <button
          type="button"
          onClick={onResetTestForm}
          className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Create Test
        </button>
      </div>
    </form>
  );
};

export default CreateTest;
