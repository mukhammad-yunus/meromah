import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../../../../utils/helpers";
import Loading from "../../../../components/Loading";
import NotFound from "../../../../components/NotFound";
import ErrorDisplay from "../../../../components/ErrorDisplay";
import Toast from "../../../../components/Toast";
import { useSelector } from "react-redux";
import ImageUploadManager from "../../../../components/ImageUploadManager";
import NameAvailabilityInput from "../../../../components/NameAvailabilityInput";

const EditCommunity = ({
  communityId,
  communityType = "board",
  isAuthenticated,
  useGetCommunityQuery,
  useUpdateCommunityMutation,
  useUploadCommunityBannerFilesMutation,
  useUploadCommunityAvatarFilesMutation,
  useUpdateCommunityAvatarMutation,
  useUpdateCommunityBannerMutation,
  useDeleteCommunityAvatarMutation,
  useDeleteCommunityBannerMutation,
  useCheckCommunityNameIsAvailableQuery,
  communityTypeLabel = "Community",
  urlPrefix = "b/",
  successMessage = "Community updated successfully!",
  getCancelPath = (id) => `/${urlPrefix.replace(/\/$/, "")}/${id}`,
  getEditPath = (name) => `/${urlPrefix.replace(/\/$/, "")}/${name}/edit`,
  getViewPath = (name) => `/${urlPrefix.replace(/\/$/, "")}/${name}`,
}) => {
  const navigate = useNavigate();
  const { profileData } = useSelector((state) => state.myProfile);

  const communityNameRef = useRef(null);
  const communityDescriptionRef = useRef(null);

  const [communityName, setCommunityName] = useState("");
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [toast, setToast] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    data: communityData,
    error: communityError,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
  } = useGetCommunityQuery(communityId);

  const [uploadCommunityBanner] = useUploadCommunityBannerFilesMutation();
  const [uploadCommunityAvatar] = useUploadCommunityAvatarFilesMutation();
  const [updateCommunity, { isLoading: isUpdating }] =
    useUpdateCommunityMutation();
  const [updateCommunityBanner] = useUpdateCommunityBannerMutation();
  const [updateCommunityAvatar] = useUpdateCommunityAvatarMutation();
  const [deleteCommunityBanner] = useDeleteCommunityBannerMutation();
  const [deleteCommunityAvatar] = useDeleteCommunityAvatarMutation();

  // Initialize community name when data loads
  useEffect(() => {
    if (communityData?.data) {
      setCommunityName(communityData.data.name);
    }
  }, [communityData]);

  const checkFormValidity = () => {
    const communityDescription =
      communityDescriptionRef.current?.value?.trim() || "";
    const isValid = isNameValid && communityDescription.length > 0;
    setIsFormValid(isValid);
  };

  // Revalidate form when name validation or description changes
  useEffect(() => {
    checkFormValidity();
  }, [isNameValid]);

  // Wrapper functions for ImageUploadManager
  const handleUploadAvatar = async (file) => {
    const params =
      communityType === "board"
        ? { files: [file], board: communityId }
        : { files: [file], desc: communityId };
    const res = await uploadCommunityAvatar(params).unwrap();
    return res;
  };

  const handleUploadBanner = async (file) => {
    const params =
      communityType === "board"
        ? { files: [file], board: communityId }
        : { files: [file], desc: communityId };
    const res = await uploadCommunityBanner(params).unwrap();
    return res;
  };

  const handleUpdateAvatar = async (hash) => {
    const params =
      communityType === "board"
        ? { board: communityId, boardData: { file_hashes: [hash] } }
        : { desc: communityId, descData: { file_hashes: [hash] } };
    await updateCommunityAvatar(params).unwrap();
  };

  const handleUpdateBanner = async (hash) => {
    const params =
      communityType === "board"
        ? { board: communityId, boardData: { file_hashes: [hash] } }
        : { desc: communityId, descData: { file_hashes: [hash] } };
    await updateCommunityBanner(params).unwrap();
  };

  const handleDeleteAvatar = async () => {
    await deleteCommunityAvatar(communityId).unwrap();
  };

  const handleDeleteBanner = async () => {
    await deleteCommunityBanner(communityId).unwrap();
  };

  const handleImageError = (message) => {
    setToast({
      message,
      type: "error",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const communityName = communityNameRef.current?.value?.trim();
    const communityDescription =
      communityDescriptionRef.current?.value?.trim();
    if (!communityName || !communityDescription) return;
    try {
      // Update community data
      const updateData = {
        name: communityName,
        description: communityDescription,
      };
      const params =
        communityType === "board"
          ? { board: communityId, boardData: updateData }
          : { desc: communityId, bodyData: updateData };
      await updateCommunity(params).unwrap();
      setToast({
        message: successMessage,
        type: "success",
      });
      navigate(getEditPath(communityName), { replace: true });
      // Navigate back to community page after a short delay
      setTimeout(() => {
        navigate(getViewPath(communityName), { replace: true });
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
    navigate(getCancelPath(communityId));
  };

  // Early authentication check - most critical
  if (isAuthenticated === false) {
    navigate("/login");
    return;
  }

  // Loading state
  if (isCommunityLoading) return <Loading />;

  // Error handling
  if (isCommunityError) {
    const status = communityError?.status;
    // Handle specific error cases
    if (status === 404 || status === 403) {
      return <NotFound />;
    }
    return <ErrorDisplay error={communityError} />;
  }

  // Data validation
  if (!communityData?.data) {
    return (
      <ErrorDisplay error={{ message: `${communityTypeLabel} data not available` }} />
    );
  }

  // Authorization check - verify ownership
  if (profileData?.username !== communityData.data.author?.username) {
    return <NotFound />; // Later I can create <Unauthorized /> component and return it, but for now this is enough
  }

  return (
    <div className="relative min-h-screen bg-primary-bg dark:bg-neutral-950">
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="text-center p-2 md:p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
            Edit {communityTypeLabel}
          </h1>
          <p className="text-slate-600 dark:text-neutral-300">
            Update {communityTypeLabel.toLowerCase()} information and images
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-700"
        >
          <div className="p-6 space-y-6">
            <ImageUploadManager
              currentAvatarData={communityData?.data?.avatar}
              currentBannerData={communityData?.data?.banner}
              uploadAvatar={handleUploadAvatar}
              uploadBanner={handleUploadBanner}
              updateAvatar={handleUpdateAvatar}
              updateBanner={handleUpdateBanner}
              deleteAvatar={handleDeleteAvatar}
              deleteBanner={handleDeleteBanner}
              avatarAlt={`${communityTypeLabel} avatar`}
              bannerAlt={`${communityTypeLabel} banner`}
              onError={handleImageError}
              onUploadingChange={setIsImageUploading}
            />

            {/* Community Name Field */}
            <NameAvailabilityInput
              inputRef={communityNameRef}
              value={communityName}
              onChange={setCommunityName}
              useCheckAvailabilityQuery={useCheckCommunityNameIsAvailableQuery}
              label={`${communityTypeLabel} Name`}
              placeholder={
                communityType === "board"
                  ? "e.g., Study-Resources, Design-Inspirations"
                  : "e.g., Math-Quiz, Science-Test"
              }
              urlPrefix={urlPrefix}
              originalName={communityData?.data?.name}
              onValidationChange={(isValid) => setIsNameValid(isValid)}
              onSpecialCharDetected={setHasSpecialChar}
              allowUppercase={true}
              required
            />

            {/* Community Description Field */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-neutral-800 dark:text-neutral-100">
                Description *
              </label>
              <textarea
                ref={communityDescriptionRef}
                defaultValue={communityData.data.description}
                onChange={checkFormValidity}
                placeholder={
                  communityType === "board"
                    ? "What is this board about?"
                    : "What is this desc about?"
                }
                className="w-full min-h-[120px] px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-y"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating || isImageUploading}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isUpdating || isImageUploading}
              className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium"
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

export default EditCommunity;

