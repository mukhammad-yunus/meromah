import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaCamera } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { getFileUrl, extractErrorMessage, getImage } from "../../utils/helpers";
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

const EditBoard = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { profileData } = useSelector((state) => state.myProfile);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const boardNameRef = useRef(null);
  const boardDescriptionRef = useRef(null);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [avatarImage, setAvatarImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(null);
  const uploadingIds = useRef(new Set());

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

  const currentAvatarUrl = useMemo(
    () =>
      avatarImage?.url ||
      (boardData?.data?.avatar
        ? getFileUrl(boardData?.data?.avatar?.file_hash)
        : null),
    [avatarImage, boardData]
  );
  const currentBannerUrl = useMemo(
    () =>
      bannerImage?.url ||
      (boardData?.data?.banner
        ? getFileUrl(boardData?.data?.banner?.file_hash)
        : null),
    [bannerImage, boardData]
  );
  // Initialize board name when data loads
  useEffect(() => {
    if (boardData?.data) {
      setBoardName(boardData.data.name);
      checkFormValidity();
    }
  }, [boardData]);

  // Upload avatar when selected
  useEffect(() => {
    if (avatarImage) {
      handleImageUpload(avatarImage, "avatar", setAvatarImage);
    }
  }, [avatarImage]);

  // Upload banner when selected
  useEffect(() => {
    if (bannerImage) {
      handleImageUpload(bannerImage, "banner", setBannerImage);
    }
  }, [bannerImage]);

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

  const handleImageUpload = async (item, uploadType = undefined, setImage) => {
    if (item.isUploading && !uploadingIds.current.has(item.id)) {
      uploadingIds.current.add(item.id);
      try {
        const allowed = ["avatar", "banner"];
        if (!allowed.includes(uploadType)) {
          throw new Error("upload type must be either avatar or banner");
        }
        const uploadApiCall =
          uploadType === "avatar" ? uploadBoardAvatar : uploadBoardBanner;
        const res = await uploadApiCall({
          files: [item.file],
          board: boardId,
        }).unwrap();
        console.log(res);
        onBoardImgUpdate(res.hash, uploadType, setImage);
      } catch (err) {
        setImage((prev) =>
          prev ? { ...prev, isUploading: false, error: true } : null
        );
      } finally {
        uploadingIds.current.delete(item.id);
      }
    }
  };
  const handleImageReUpload = async (
    item,
    uploadType = undefined,
    setImage
  ) => {
    if (!item) return;
    try {
      const allowed = ["avatar", "banner"];
      if (!allowed.includes(uploadType)) {
        throw new Error("upload type must be either avatar or banner");
      }
      const apiCall =
        uploadType === "avatar" ? uploadBoardAvatar : uploadBoardBanner;
      const res = await apiCall({
        files: [item.file],
        board: boardId,
      }).unwrap();
      onBoardImgUpdate(res.hash, uploadType, setImage);
    } catch (err) {
      setImage((prev) =>
        prev ? { ...prev, isUploading: false, error: true } : null
      );
    }
  };
  const onBoardImgUpdate = async (hash, updateType = undefined, setImage) => {
    try {
      if (!hash || !setImage) throw new Error("Something went wrong");
      const allowed = ["avatar", "banner"];
      if (!allowed.includes(updateType)) {
        throw new Error("upload type must be either avatar or banner");
      }
      const updateApiCall =
        updateType === "avatar" ? updateBoardAvatar : updateBoardBanner;
      const res = await updateApiCall({
        board: boardId,
        boardData: { file_hashes: [hash] },
      }).unwrap();
      if (updateType === "avatar") {
        URL.revokeObjectURL(avatarImage.url);
      } else {
        URL.revokeObjectURL(bannerImage.url);
      }
      setImage(null);
    } catch (err) {
      console.error(err);
      setImage((prev) =>
        prev ? { ...prev, isUploading: false, error: true } : null
      );
    }
  };
  const onAvatarUpload = (e) => {
    const newAvatar = getImage(e)[0];
    if (newAvatar) {
      setAvatarImage(newAvatar);
    }
  };

  const onBannerUpload = (e) => {
    const newBanner = getImage(e)[0];
    if (newBanner) {
      setBannerImage(newBanner);
    }
  };

  const removeAvatar = async () => {
    try {
      await deleteBoardAvatar(boardId).unwrap();
    } catch (err) {
      console.error(err);
      setToast({
        message: err.data.message,
        type: "error",
      });
    }
  };
  const removeBanner = async () => {
    try {
      await deleteBoardBanner(boardId).unwrap();
    } catch (err) {
      console.error(err);
      setToast({
        message: err.data.message,
        type: "error",
      });
    }
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
            <div className="flex flex-col">
              {/* Banner Section */}
              <div
                className={`relative w-full h-20 md:h-32 rounded-lg overflow-hidden border transition-colors group ${
                  bannerImage?.error
                    ? "border-red-500"
                    : "border-neutral-300 hover:border-primary-blue"
                } ${bannerImage?.isUploading && "animate-pulse"}`}
              >
                {currentBannerUrl ? (
                  <>
                    <img
                      src={currentBannerUrl}
                      alt="Board banner"
                      className="w-full h-full object-cover"
                    />
                    {bannerImage?.error ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleImageReUpload(
                            bannerImage,
                            "banner",
                            setBannerImage
                          )
                        }
                        className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <IoReload className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        {/* Mobile: Click to open menu */}
                        <button
                          type="button"
                          onClick={() => setMobileMenu("banner")}
                          className="md:hidden absolute inset-0 bg-black/20 active:bg-black/30 transition-colors"
                        />
                        {/* Desktop: Remove button on hover */}
                        <button
                          type="button"
                          onClick={removeBanner}
                          className="hidden md:block absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {!bannerImage?.isUploading && (
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="hidden md:block absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center justify-center h-full">
                          <div className="flex items-center gap-2 text-white">
                            <FaImage className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              Change Banner
                            </span>
                          </div>
                        </div>
                        <p className="absolute bottom-2 right-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                          3:1 ratio recommended
                        </p>
                      </button>
                    )}
                    {bannerImage?.isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs md:text-sm">
                          Uploading...
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileMenu("banner")}
                      className="md:hidden absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center active:brightness-90 transition-all"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <FaImage className="w-5 h-5" />
                        <span className="text-xs font-medium">
                          Upload Banner
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="hidden md:block absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:brightness-110 transition-all"
                    >
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-2 text-white">
                          <FaImage className="w-6 h-6" />
                          <span className="text-sm font-medium">
                            Upload Banner
                          </span>
                        </div>
                      </div>
                      <p className="absolute bottom-2 right-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                        3:1 ratio recommended
                      </p>
                    </button>
                  </>
                )}
              </div>

              {/* Avatar Section - Mobile */}
              <div className="md:hidden relative">
                <div className="absolute -top-8 left-4 w-20 h-20">
                  <div
                    className={`relative w-full h-full rounded-full overflow-hidden border-4 bg-white ${
                      avatarImage?.error ? "border-red-500" : "border-white"
                    } ${avatarImage?.isUploading && "animate-pulse"}`}
                  >
                    {currentAvatarUrl ? (
                      <>
                        <img
                          src={currentAvatarUrl}
                          alt="Board avatar"
                          className="w-full h-full object-cover"
                        />
                        {avatarImage?.error ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleImageReUpload(
                                avatarImage,
                                "avatar",
                                setAvatarImage
                              )
                            }
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-50"
                          >
                            <IoReload className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMobileMenu("avatar")}
                            className="absolute inset-0 bg-black/20 active:bg-black/30 transition-colors"
                          />
                        )}
                        {avatarImage?.isUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xs">
                              Uploading...
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMobileMenu("avatar")}
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 active:brightness-90 transition-all"
                      >
                        <FaCamera className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-12" />
              </div>

              {/* Avatar Section - Desktop */}
              <div className="hidden md:block relative">
                <div className="absolute -top-14 left-4 w-28 h-28 group">
                  <div
                    className={`relative w-full h-full rounded-full overflow-hidden border-4 bg-white ${
                      avatarImage?.error ? "border-red-500" : "border-white"
                    } ${avatarImage?.isUploading && "animate-pulse"}`}
                  >
                    {currentAvatarUrl ? (
                      <>
                        <img
                          src={currentAvatarUrl}
                          alt="Board avatar"
                          className="w-full h-full object-cover"
                        />

                        {!avatarImage?.isUploading && (
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <FaCamera className="w-5 h-5 text-white" />
                          </button>
                        )}

                        {avatarImage?.isUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xs">
                              Uploading...
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <FaCamera className="w-6 h-6 text-white" />
                      </button>
                    )}
                  </div>
                  {currentAvatarUrl && avatarImage?.error && (
                    <button
                      type="button"
                      onClick={() =>
                        handleImageReUpload(
                          avatarImage,
                          "avatar",
                          setAvatarImage
                        )
                      }
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-50"
                    >
                      <IoReload className="w-4 h-4" />
                    </button>
                  )}
                  {currentAvatarUrl && !avatarImage?.error && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-50 opacity-0 group-hover:opacity-100"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="h-14" />
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarUpload}
                className="hidden"
              />
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={onBannerUpload}
                className="hidden"
              />
            </div>

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
                avatarImage?.isUploading ||
                bannerImage?.isUploading
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
                avatarImage?.isUploading ||
                bannerImage?.isUploading
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

      {/* Mobile Bottom Menu */}
      {mobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenu(null)}
          />

          {/* Menu */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 animate-slide-up">
            <div className="p-4 space-y-2">
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {mobileMenu === "banner" ? "Banner Image" : "Avatar Image"}
              </h3>

              {/* Change/Upload Image Button */}
              <button
                type="button"
                onClick={() => {
                  if (mobileMenu === "banner") {
                    bannerInputRef.current?.click();
                  } else {
                    avatarInputRef.current?.click();
                  }
                  setMobileMenu(null);
                }}
                className="w-full px-4 py-3 text-left text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <FaImage className="w-5 h-5 text-primary-blue" />
                <span className="font-medium">
                  {(mobileMenu === "banner" && currentBannerUrl) ||
                  (mobileMenu === "avatar" && currentAvatarUrl)
                    ? "Change image"
                    : "Upload image"}
                </span>
              </button>

              {/* Remove Image Button - Only show if image exists */}
              {((mobileMenu === "banner" && currentBannerUrl) ||
                (mobileMenu === "avatar" && currentAvatarUrl)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (mobileMenu === "banner") {
                      removeBanner();
                    } else {
                      removeAvatar();
                    }
                    setMobileMenu(null);
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <FiX className="w-5 h-5" />
                  <span className="font-medium">Remove image</span>
                </button>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setMobileMenu(null)}
                className="w-full px-4 py-3 text-center text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors font-medium border border-neutral-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditBoard;
