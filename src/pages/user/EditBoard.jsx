import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { extractErrorMessage } from "../../utils/helpers";
import {
  useUploadBoardBannerFilesMutation,
  useUploadBoardAvatarFilesMutation,
} from "../../services/fileApi";
import {
  useDeleteBoardAvatarMutation,
  useDeleteBoardBannerMutation,
  useGetBoardQuery,
  useUpdateBoardAvatarMutation,
  useUpdateBoardBannerMutation,
  useUpdateBoardMutation,
  useCheckBoardNameIsAvailableQuery,
} from "../../services/boardsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import { useSelector } from "react-redux";
import ImageUploadManager from "../../components/ImageUploadManager";

const EditBoard = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { profileData } = useSelector((state) => state.myProfile);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const boardNameRef = useRef(null);
  const boardDescriptionRef = useRef(null);

  const [boardName, setBoardName] = useState("");
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [toast, setToast] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    data: boardData,
    error: boardError,
    isLoading: isBoardLoading,
    isError: isBoardError,
  } = useGetBoardQuery(boardId);

  const [uploadBoardBanner] = useUploadBoardBannerFilesMutation();
  const [uploadBoardAvatar] = useUploadBoardAvatarFilesMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const [updateBoardBanner] = useUpdateBoardBannerMutation();
  const [updateBoardAvatar] = useUpdateBoardAvatarMutation();
  const [deleteBoardBanner] = useDeleteBoardBannerMutation();
  const [deleteBoardAvatar] = useDeleteBoardAvatarMutation();

  // Name availability check - skip if name hasn't changed or is invalid
  const shouldSkipNameCheck = useMemo(() => {
    const trimmedName = boardName.trim();
    const originalName = boardData?.data?.name || "";
    return (
      !trimmedName ||
      trimmedName === originalName ||
      trimmedName.length < 3 ||
      trimmedName.length > 20
    );
  }, [boardName, boardData]);

  const { data: isBoardNameAvailable, isFetching: isCheckingName } =
    useCheckBoardNameIsAvailableQuery(
      { name: boardName },
      {
        skip: shouldSkipNameCheck,
      }
    );

  // Check if name is available
  const isNameAvailable = useMemo(() => {
    const trimmedName = boardName.trim();
    const originalName = boardData?.data?.name || "";

    // If name hasn't changed, it's valid
    if (trimmedName === originalName) return true;
    if (!trimmedName) return true;

    return isBoardNameAvailable?.isAvailable ?? false;
  }, [boardName, boardData, isBoardNameAvailable]);

  // Validation error messages
  const nameError = useMemo(() => {
    const trimmedName = boardName.trim();
    const originalName = boardData?.data?.name || "";

    // If name hasn't changed, no error
    if (trimmedName === originalName) return null;
    if (!trimmedName) return null;

    if (trimmedName.length < 3) {
      return "Name must be at least 3 characters long";
    }
    if (trimmedName.length > 20) {
      return "Name must be 20 characters or less";
    }
    if (!isNameAvailable && !isCheckingName) {
      return "This name is already taken, please choose another";
    }
    return null;
  }, [boardName, boardData, isNameAvailable, isCheckingName]);

  // Initialize board name when data loads
  useEffect(() => {
    if (boardData?.data) {
      setBoardName(boardData.data.name);
      checkFormValidity();
    }
  }, [boardData]);

  const checkFormValidity = () => {
    const name = boardNameRef.current?.value?.trim() || "";
    const boardDescription = boardDescriptionRef.current?.value?.trim() || "";
    const isValid =
      name.length > 0 &&
      boardDescription.length > 0 &&
      !nameError &&
      isNameAvailable &&
      !isCheckingName;
    setIsFormValid(isValid);
  };

  // Revalidate form when name validation changes
  useEffect(() => {
    checkFormValidity();
  }, [nameError, isNameAvailable, isCheckingName]);

  const handleBoardNameChange = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setHasSpecialChar(false);
      setBoardName("");
      checkFormValidity();
      return;
    }

    const isValid = /^[A-Za-z0-9 _-]+$/.test(value);
    setHasSpecialChar(!isValid);

    if (isValid) {
      setBoardName(value.replace(/\s+/g, "-"));
      checkFormValidity();
    }
  };

  // Wrapper functions for ImageUploadManager
  const handleUploadAvatar = async (file) => {
    const res = await uploadBoardAvatar({
      files: [file],
      board: boardId,
    }).unwrap();
    return res;
  };

  const handleUploadBanner = async (file) => {
    const res = await uploadBoardBanner({
      files: [file],
      board: boardId,
    }).unwrap();
    return res;
  };

  const handleUpdateAvatar = async (hash) => {
    await updateBoardAvatar({
      board: boardId,
      boardData: { file_hashes: [hash] },
    }).unwrap();
  };

  const handleUpdateBanner = async (hash) => {
    await updateBoardBanner({
      board: boardId,
      boardData: { file_hashes: [hash] },
    }).unwrap();
  };

  const handleDeleteAvatar = async () => {
    await deleteBoardAvatar(boardId).unwrap();
  };

  const handleDeleteBanner = async () => {
    await deleteBoardBanner(boardId).unwrap();
  };

  const handleImageError = (message) => {
    setToast({
      message,
      type: "error",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const boardName = boardNameRef.current?.value?.trim();
    const boardDescription = boardDescriptionRef.current?.value?.trim();
    if (!boardName || !boardDescription) return;
    try {
      // Update board data with hashes
      const updateData = {
        name: boardName,
        description: boardDescription,
      };
      await updateBoard({ board: boardId, boardData: updateData }).unwrap();
      setToast({
        message: "Board updated successfully!",
        type: "success",
      });
      // Navigate back to board page after a short delay
      setTimeout(() => {
        navigate(`/b/${boardId}`);
      }, 1500);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    navigate(`/b/${boardId}`);
  };
  // Early authentication check - most critical
  if (isAuthenticated === false) {
    navigate("/login");
    return;
  }
  // Loading state
  if (isBoardLoading) return <Loading />;

  // Error handling
  if (isBoardError) {
    const status = boardError?.status;
    // Handle specific error cases
    if (status === 404 || status === 403) {
      return <NotFound />;
    }
    return <ErrorDisplay error={boardError} />;
  }

  // Data validation
  if (!boardData?.data) {
    return <ErrorDisplay error={{ message: "Board data not available" }} />;
  }

  // Authorization check - verify ownership
  if (profileData?.username !== boardData.data.author?.username) {
    return <NotFound />; // Later I can create <Unauthorized /> component and return it, but for now this is enough
  }

  return (
    <div className="relative min-h-screen bg-primary-bg">
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="text-center p-2 md:p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Edit Board
          </h1>
          <p className="text-slate-600">Update board information and images</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-slate-200"
        >
          <div className="p-6 space-y-6">
            <ImageUploadManager
              currentAvatarData={boardData?.data?.avatar}
              currentBannerData={boardData?.data?.banner}
              uploadAvatar={handleUploadAvatar}
              uploadBanner={handleUploadBanner}
              updateAvatar={handleUpdateAvatar}
              updateBanner={handleUpdateBanner}
              deleteAvatar={handleDeleteAvatar}
              deleteBanner={handleDeleteBanner}
              avatarAlt="Board avatar"
              bannerAlt="Board banner"
              onError={handleImageError}
              onUploadingChange={setIsImageUploading}
            />

            {/* Board Name Field */}
            <div className="flex flex-col">
              <label className="font-medium text-neutral-800">
                Board Name *
              </label>
              <input
                ref={boardNameRef}
                type="text"
                value={boardName}
                onChange={handleBoardNameChange}
                placeholder="e.g., Study-Resources, Design-Inspirations"
                className={`w-full px-3 py-2 mt-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                  nameError
                    ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                    : "border-slate-200 focus:ring-blue-500/30 focus:border-blue-500"
                } placeholder-slate-400`}
                required
              />
              {/* Show preview URL when valid */}
              <div
                className={`text-xs text-slate-500 transition-all duration-300 ease-in-out ${
                  boardName && !nameError && boardName !== boardData.data.name
                    ? "mt-1.5 max-h-10 opacity-100 translate-y-0"
                    : "mt-0 max-h-0 opacity-0 -translate-y-1 overflow-hidden"
                }`}
              >
                b/{boardName}
              </div>
              {/* Show error message when invalid */}
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

            {/* Board Description Field */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-neutral-800">
                Description *
              </label>
              <textarea
                ref={boardDescriptionRef}
                defaultValue={boardData.data.description}
                onChange={checkFormValidity}
                placeholder="What is this board about?"
                className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-slate-400 resize-y"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={
                isUpdating ||
                isImageUploading
              }
              className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !isFormValid ||
                isUpdating ||
                isImageUploading
              }
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Special Character Warning Toast */}
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
          onClose={() => setHasSpecialChar(false)}
        />
      )}
    </div>
  );
};

export default EditBoard;
