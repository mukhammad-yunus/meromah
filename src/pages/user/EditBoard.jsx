import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaCamera } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { getFileUrl, getImage } from "../../utils/helpers";
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
} from "../../services/boardsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";

const EditBoard = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [avatarImage, setAvatarImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(null); // 'banner', 'avatar', or null
  const uploadingIds = useRef(new Set());

  const {
    data: boardData,
    error: boardError,
    isLoading: isBoardLoading,
    isError: isBoardError,
  } = useGetBoardQuery(boardId);

  const [uploadBoardBanner] = useUploadBoardBannerFilesMutation();
  const [uploadBoardAvatar] = useUploadBoardAvatarFilesMutation();
  const [updateBoardBanner] = useUpdateBoardBannerMutation();
  const [updateBoardAvatar] = useUpdateBoardAvatarMutation();
  const [deleteBoardBanner] = useDeleteBoardBannerMutation();
  const [deleteBoardAvatar] = useDeleteBoardAvatarMutation();
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
      } else{
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

  const removeAvatar = async() => {
    try {
      await deleteBoardAvatar(boardId).unwrap();
    } catch (err) {
      console.error(err)
       setToast({
        message: err.data.message,
        type: "error",
      })
    }
  };
  const removeBanner = async() => {
    try {
      await deleteBoardBanner(boardId).unwrap();
    } catch (err) {
      console.error(err)
       setToast({
        message: err.data.message,
        type: "error",
      })
    }
  };

  //TODO: implementing a subs quermit logic
  const handleSubmit = async (e) => {};

  const handleCancel = () => {
    navigate(`/b/${boardId}`);
  };

  if (isBoardLoading) return <Loading />;

  if (isBoardError) {
    const status = boardError?.status;
    if (status === 404) return <NotFound />;
    return <ErrorDisplay error={boardError} />;
  }

  if (!boardData?.data) return null;
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
