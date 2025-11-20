import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaImage, FaCamera } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { getFileUrl, getImage } from "../utils/helpers";

/**
 * Reusable component for managing avatar and banner image uploads
 * Handles upload states, error states, mobile menus, and all UI interactions
 */
const ImageUploadManager = ({
  // Current image data from backend
  currentAvatarData,
  currentBannerData,
  // Upload functions that return promises with { hash } or { hash } in .data
  uploadAvatar,
  uploadBanner,
  // Update functions that finalize the upload
  updateAvatar,
  updateBanner,
  // Delete functions
  deleteAvatar,
  deleteBanner,
  // Alt text for images
  avatarAlt = "Avatar",
  bannerAlt = "Banner",
  // Error callback
  onError,
  // Callback to notify parent about uploading state
  onUploadingChange,
}) => {
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const uploadingIds = useRef(new Set());

  const [avatarImage, setAvatarImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(null);

  // Compute current URLs from either local state or backend data
  const currentAvatarUrl = useMemo(
    () =>
      avatarImage?.url ||
      (currentAvatarData?.file_hash
        ? getFileUrl(currentAvatarData.file_hash)
        : null),
    [avatarImage, currentAvatarData]
  );

  const currentBannerUrl = useMemo(
    () =>
      bannerImage?.url ||
      (currentBannerData?.file_hash
        ? getFileUrl(currentBannerData.file_hash)
        : null),
    [bannerImage, currentBannerData]
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

  // Notify parent about uploading state changes
  useEffect(() => {
    const isUploading = avatarImage?.isUploading || bannerImage?.isUploading;
    if (onUploadingChange) {
      onUploadingChange(isUploading);
    }
  }, [avatarImage?.isUploading, bannerImage?.isUploading, onUploadingChange]);

  const handleImageUpload = async (item, uploadType, setImage) => {
    if (item.isUploading && !uploadingIds.current.has(item.id)) {
      uploadingIds.current.add(item.id);
      try {
        const uploadFn = uploadType === "avatar" ? uploadAvatar : uploadBanner;
        const res = await uploadFn(item.file);
        // Handle both direct hash and nested data responses
        const hash = res.hash || res.data?.hash;
        await onImageUpdate(hash, uploadType, setImage);
      } catch (err) {
        console.error("Upload error:", err);
        setImage((prev) =>
          prev ? { ...prev, isUploading: false, error: true } : null
        );
      } finally {
        uploadingIds.current.delete(item.id);
      }
    }
  };

  const handleImageReUpload = async (item, uploadType, setImage) => {
    if (!item) return;
    try {
      const uploadFn = uploadType === "avatar" ? uploadAvatar : uploadBanner;
      const res = await uploadFn(item.file);
      const hash = res.hash || res.data?.hash;
      await onImageUpdate(hash, uploadType, setImage);
    } catch (err) {
      console.error("Re-upload error:", err);
      setImage((prev) =>
        prev ? { ...prev, isUploading: false, error: true } : null
      );
    }
  };

  const onImageUpdate = async (hash, updateType, setImage) => {
    try {
      if (!hash || !setImage) throw new Error("Something went wrong");
      const updateFn = updateType === "avatar" ? updateAvatar : updateBanner;
      await updateFn(hash);
      
      // Cleanup local state
      if (updateType === "avatar" && avatarImage?.url) {
        URL.revokeObjectURL(avatarImage.url);
      } else if (updateType === "banner" && bannerImage?.url) {
        URL.revokeObjectURL(bannerImage.url);
      }
      setImage(null);
    } catch (err) {
      console.error("Update error:", err);
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
      await deleteAvatar();
    } catch (err) {
      console.error("Delete avatar error:", err);
      if (onError) {
        onError(err?.data?.message || "Failed to remove avatar");
      }
    }
  };

  const removeBanner = async () => {
    try {
      await deleteBanner();
    } catch (err) {
      console.error("Delete banner error:", err);
      if (onError) {
        onError(err?.data?.message || "Failed to remove banner");
      }
    }
  };

  return (
    <>
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
                alt={bannerAlt}
                className="w-full h-full object-cover"
              />
              {bannerImage?.error ? (
                <button
                  type="button"
                  onClick={() =>
                    handleImageReUpload(bannerImage, "banner", setBannerImage)
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
                      <span className="text-sm font-medium">Change Banner</span>
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
                  <span className="text-xs font-medium">Upload Banner</span>
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
                    <span className="text-sm font-medium">Upload Banner</span>
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
                    alt={avatarAlt}
                    className="w-full h-full object-cover"
                  />
                  {avatarImage?.error ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleImageReUpload(avatarImage, "avatar", setAvatarImage)
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
                      <span className="text-white text-xs">Uploading...</span>
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
                    alt={avatarAlt}
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
                      <span className="text-white text-xs">Uploading...</span>
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
                  handleImageReUpload(avatarImage, "avatar", setAvatarImage)
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
    </>
  );
};
export default ImageUploadManager;

