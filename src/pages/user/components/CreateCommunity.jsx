import React, { useMemo, useState } from "react";
import { FiArrowLeft, FiSend } from "react-icons/fi";

import {
  useCheckDescNameIsAvailableQuery,
  useCreateDescMutation,
} from "../../../services/descsApi.js";
import {
  useCheckBoardNameIsAvailableQuery,
  useCreateBoardMutation,
} from "../../../services/boardsApi.js";
import SuccessModal from "../../main/components/SuccessModal.jsx";
import Toast from "../.../../../../components/Toast.jsx";
const communityTypes = {
  board: { name: "Board", path: "b" },
  desc: { name: "Desc", path: "d" },
};
const CreateCommunity = () => {
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityType, setCommunityType] = useState("board");
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createBoard, { isLoading: isBoardLoading }] = useCreateBoardMutation();
  const [createDesc, { isLoading: isDescLoading }] = useCreateDescMutation();

  // Shared skip logic for name availability checks
  const shouldSkipNameCheck = useMemo(() => {
    const trimmedName = communityName.trim();
    return !trimmedName || trimmedName.length < 3 || trimmedName.length > 20;
  }, [communityName]);

  const { data: isBoardNameAvailable, isFetching: isFetchingBoard } =
    useCheckBoardNameIsAvailableQuery(
      { name: communityName },
      {
        skip: shouldSkipNameCheck || communityType !== "board",
      }
    );

  const { data: isDescNameAvailable, isFetching: isFetchingDesc } =
    useCheckDescNameIsAvailableQuery(
      { name: communityName },
      {
        skip: shouldSkipNameCheck || communityType !== "desc",
      }
    );

  const isNameAvailable = useMemo(() => {
    if (!communityName.trim()) return true;

    if (communityType === "board") {
      return isBoardNameAvailable?.isAvailable ?? false; // Default to false while loading
    }
    return isDescNameAvailable?.isAvailable ?? false;
  }, [communityName, communityType, isBoardNameAvailable, isDescNameAvailable]);

  const isChecking =
    communityType === "board" ? isFetchingBoard : isFetchingDesc;

  // Validation error messages
  const nameError = useMemo(() => {
    const trimmedName = communityName.trim();
    if (!trimmedName) return null;

    if (trimmedName.length < 3) {
      return "Name must be at least 3 characters long";
    }
    if (trimmedName.length > 20) {
      return "Name must be 20 characters or less";
    }
    if (!isNameAvailable && !isChecking) {
      return "This name is already taken, please choose another";
    }
    return null;
  }, [communityName, isNameAvailable, isChecking]);

  const isCreateDisabled =
    !communityName.trim() ||
    !communityDescription.trim() ||
    !isNameAvailable ||
    isChecking ||
    isBoardLoading ||
    isDescLoading ||
    !!nameError;

  const handleCommunityNameChange = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setHasSpecialChar(false);
      setCommunityName("");
      return;
    }

    const isValid = /^[A-Za-z0-9 _-]+$/.test(value);
    setHasSpecialChar(!isValid);

    if (isValid) {
      setCommunityName(value.replace(/\s+/g, "-"));
    }
  };

  const finalSubmission = async () => {
    if (isCreateDisabled) return; // Guard clause

    const createFn = communityType === "board" ? createBoard : createDesc;
    try {
      const result = await createFn({
        name: communityName,
        description: communityDescription,
      }).unwrap();

      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error creating community:", err);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="relative min-h-screen bg-primary/50">
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="text-center p-2 md:p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Create a new community
          </h1>
          <p className="text-slate-600">
            Organize posts and ideas or tests under a shared theme
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex gap-4 p-4 border-b border-slate-100">
            <label
              htmlFor="board"
              className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-md hover:bg-slate-50"
            >
              <input
                id="board"
                name="board-type"
                type="radio"
                value="board"
                checked={communityType === "board"}
                onChange={() => setCommunityType("board")}
                className="h-4 w-4 text-blue-600 accent-blue-600"
              />
              <div className="flex flex-col">
                <span className="font-medium text-neutral-800">Board</span>
                <span className="text-xs text-slate-500">
                  Create a new board to collect posts
                </span>
              </div>
            </label>
            <label
              htmlFor="desc"
              className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-md hover:bg-slate-50"
            >
              <input
                id="desc"
                name="board-type"
                type="radio"
                value="desc"
                checked={communityType === "desc"}
                onChange={() => setCommunityType("desc")}
                className="h-4 w-4 text-blue-600 accent-blue-600"
              />
              <div className="flex flex-col">
                <span className="font-medium text-neutral-800">Desc</span>
                <span className="text-xs text-slate-500">
                  Create a new desc to collect tests
                </span>
              </div>
            </label>
          </div>
          <div className="p-6 border-b border-slate-100">
            <div className="grid gap-5">
              <div className="">
                <label className="flex flex-col gap-2">
                  <span className="font-medium text-neutral-800">
                    {communityTypes[communityType].name} name
                  </span>
                  <input
                    type="text"
                    value={communityName}
                    onChange={handleCommunityNameChange}
                    placeholder="e.g., Study-Resources, Design-Inspirations"
                    className={`input w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                      nameError
                        ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-slate-200 focus:ring-blue-500/30 focus:border-blue-500"
                    } placeholder-slate-400`}
                  />
                </label>
                <div
                  className={`text-xs text-slate-500 transition-all duration-300 ease-in-out ${
                    communityName && !nameError
                      ? "mt-1.5 max-h-10 opacity-100 translate-y-0"
                      : "mt-0 max-h-0 opacity-0 -translate-y-1 overflow-hidden"
                  }`}
                >
                  {communityTypes[communityType].path}/{communityName}
                </div>
                <div
                  className={`text-xs text-red-500 font-medium transition-all duration-300 ease-in-out ${
                    nameError
                      ? "mt-1.5 max-h-10 opacity-100 translate-y-0"
                      : "mt-0 max-h-0 opacity-0 -translate-y-1 overflow-hidden"
                  }`}
                >
                  {nameError}
                </div>
              </div>
              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800">
                  Description
                </span>
                <textarea
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  placeholder={`What is this ${communityTypes[communityType].name} about? Who is it for?`}
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-slate-400 resize-y"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
          <button
            type="button"
            // onClick={onResetCommunityForm}
            className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isCreateDisabled}
            onClick={finalSubmission}
            className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </div>
      {isSuccessModalOpen && (
        <SuccessModal
          header={`${communityTypes[communityType].name} created successfully.`}
          message={`Now navigating to ${communityTypes[communityType].path}/${communityName}`}
          onClose={() => setIsSuccessModalOpen(false)}
          path={`/${communityTypes[communityType].path}/${communityName}`}
        />
      )}
      {hasSpecialChar && (
        <Toast
          type="error"
          message={
            <span>
              <strong>Oops!</strong> Some special characters aren't allowed.
              Please use only{" "}
              <strong>letters, numbers, dashes (-), or underscores (_).</strong>
            </span>
          }
          onClose={()=> setHasSpecialChar(false)}
        />
      )}
    </div>
  );
};

export default CreateCommunity;
