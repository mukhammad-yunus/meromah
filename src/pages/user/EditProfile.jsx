import React, { useState, useEffect, useMemo } from "react";
import { extractErrorMessage } from "../../utils/helpers";
import {
  useUploadUserBannerFilesMutation,
  useUploadUserAvatarFilesMutation,
} from "../../services/fileApi";
import {
  useGetMeQuery,
  useGetMyProfileQuery,
  useUpdateMeMutation,
  useUpdateMyProfileMutation,
  useUpdateMyAvatarMutation,
  useDeleteMyAvatarMutation,
  useUpdateMyBannerMutation,
  useDeleteMyBannerMutation,
} from "../../services/userApi";
import { useGetAllEnrollmentYearsPrivilegedQuery } from "../../services/enrollmentYearsPrivilegedApi";
import Loading from "../../components/Loading";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import ImageUploadManager from "../../components/ImageUploadManager";
import NameAvailabilityInput from "../../components/NameAvailabilityInput";
import { SUCCESS_MESSAGES_FOR_UPDATES as message} from "../../utils";
import { useCheckIsUsernameAvailableQuery } from "../../services/authApi";
const MyProfile = () => {
  // Field states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [biography, setBiography] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [enrollmentYearId, setEnrollmentYearId] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  // Memoized input data object for updates
  const inputData = useMemo(
    () => ({
      name,
      username,
      biography,
      birth_date: birthDate,
      sex,
      enrollment_year_id: enrollmentYearId,
    }),
    [name, username, biography, birthDate, sex, enrollmentYearId]
  );
  // Original values for comparison
  const [originalValues, setOriginalValues] = useState({});

  // Loading states for each field
  const [savingField, setSavingField] = useState(null);

  const [toast, setToast] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetMeQuery();
  const {
    data: profileData,
    error: profileError,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetMyProfileQuery();
  const { data: enrollmentYearsData, isLoading: isEnrollmentYearsLoading } =
    useGetAllEnrollmentYearsPrivilegedQuery();

  const [uploadUserBanner] = useUploadUserBannerFilesMutation();
  const [uploadUserAvatar] = useUploadUserAvatarFilesMutation();
  const [updateMe] = useUpdateMeMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const [updateMyBanner] = useUpdateMyBannerMutation();
  const [updateMyAvatar] = useUpdateMyAvatarMutation();
  const [deleteMyBanner] = useDeleteMyBannerMutation();
  const [deleteMyAvatar] = useDeleteMyAvatarMutation();

  // Initialize field values when data loads
  useEffect(() => {
    if (userData?.data && profileData?.data) {
      const initial = {
        name: userData.data.name || "",
        username: userData.data.username || "",
        biography: profileData.data.biography || "",
        birthDate: profileData.data.birth_date || "",
        sex: profileData.data.sex || "",
        enrollmentYearId: profileData.data.enrollment_year_id || "",
      };

      setName(initial.name);
      setUsername(initial.username);
      setBiography(initial.biography);
      setBirthDate(initial.birthDate);
      setSex(initial.sex);
      setEnrollmentYearId(initial.enrollmentYearId);
      setOriginalValues(initial);
    }
  }, [userData, profileData]);

  // Wrapper functions for ImageUploadManager
  const handleUploadAvatar = async (file) => {
    const res = await uploadUserAvatar([file]).unwrap();
    return res;
  };

  const handleUploadBanner = async (file) => {
    const res = await uploadUserBanner([file]).unwrap();
    return res;
  };

  const handleUpdateAvatar = async (hash) => {
    await updateMyAvatar({
      bodyData: { file_hashes: [hash] },
    }).unwrap();
  };

  const handleUpdateBanner = async (hash) => {
    await updateMyBanner({
      bodyData: { file_hashes: [hash] },
    }).unwrap();
  };

  const handleDeleteAvatar = async () => {
    await deleteMyAvatar().unwrap();
  };

  const handleDeleteBanner = async () => {
    await deleteMyBanner().unwrap();
  };

  const handleImageError = (message) => {
    setToast({
      message,
      type: "error",
    });
  };

  // Individual save handlers
  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingField("name");
    try {
      await updateMe({
        bodyData: { name: name.trim(), username },
      }).unwrap();

      setOriginalValues((prev) => ({ ...prev, name: name.trim() }));
      setToast({
        message: "Name updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSavingField("username");
    try {
      await updateMe({
        bodyData: { name, username: username.trim() },
      }).unwrap();

      setOriginalValues((prev) => ({ ...prev, username: username.trim() }));
      setToast({
        message: "Username updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveInput = async (inputType = undefined) => {
    if (!inputType) return;
    setSavingField(inputType);
    try {
      const inputTypesSet = new Set([
        "name",
        "username",
        "biography",
        "birth_date",
        "sex",
        "enrollment_year_id",
      ]);
      if(!inputTypesSet.has(inputType)){
        throw new Error("Invalid input type");
      }

      const updateFn = inputType === "name" || inputType === "username" ? updateMe : updateMyProfile;
      await updateFn({
        bodyData: {
          [inputType]: inputData[inputType],
        },
      }).unwrap();

      setOriginalValues((prev) => ({
        ...prev,
        [inputType]: inputData[inputType],
      }));
      setToast({
        message: message[inputType],
        type: "success",
      });
    } catch (error) {
      setToast({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setSavingField(null);
    }
  };

  // Cancel handlers
  const handleCancelField = (field) => {
    switch (field) {
      case "name":
        setName(originalValues.name);
        break;
      case "username":
        setUsername(originalValues.username);
        break;
      case "biography":
        setBiography(originalValues.biography);
        break;
      case "birthDate":
        setBirthDate(originalValues.birthDate);
        break;
      case "sex":
        setSex(originalValues.sex);
        break;
      case "enrollmentYearId":
        setEnrollmentYearId(originalValues.enrollmentYearId);
        break;
      default:
        break;
    }
  };

  // Check if field is modified
  const isFieldModified = (field) => {
    switch (field) {
      case "name":
        return name.trim() !== originalValues.name;
      case "username":
        return username.trim() !== originalValues.username;
      case "biography":
        return biography.trim() !== originalValues.biography;
      case "birthDate":
        return birthDate !== originalValues.birthDate;
      case "sex":
        return sex !== originalValues.sex;
      case "enrollmentYearId":
        return enrollmentYearId !== originalValues.enrollmentYearId;
      default:
        return false;
    }
  };

  // Loading state
  if (isUserLoading || isProfileLoading || isEnrollmentYearsLoading) {
    return <Loading />;
  }

  // Error handling
  if (isUserError) {
    return <ErrorDisplay error={userError} />;
  }

  if (isProfileError) {
    return <ErrorDisplay error={profileError} />;
  }

  // Data validation
  if (!userData?.data || !profileData?.data) {
    return <ErrorDisplay error={{ message: "Profile data not available" }} />;
  }

  return (
    <div className="relative min-h-screen bg-primary-bg p-2">
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 space-y-6">
          <ImageUploadManager
            currentAvatarData={userData?.data?.avatar}
            currentBannerData={profileData?.data?.user?.banner}
            uploadAvatar={handleUploadAvatar}
            uploadBanner={handleUploadBanner}
            updateAvatar={handleUpdateAvatar}
            updateBanner={handleUpdateBanner}
            deleteAvatar={handleDeleteAvatar}
            deleteBanner={handleDeleteBanner}
            avatarAlt="Profile avatar"
            bannerAlt="Profile banner"
            onError={handleImageError}
            onUploadingChange={setIsImageUploading}
          />

          {/* Name Field */}
          <div className="flex flex-col">
            <label className="font-medium text-neutral-800">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-3 py-2 mt-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-slate-400 transition-all duration-200"
              required
            />
            {isFieldModified("name") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleCancelField("name")}
                  disabled={savingField === "name"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInput("name")}
                  disabled={savingField === "name" || !name.trim()}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "name" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Username Field */}
          <div className="flex flex-col">
            <NameAvailabilityInput
              value={username}
              onChange={setUsername}
              useCheckAvailabilityQuery={useCheckIsUsernameAvailableQuery}
              label="Username"
              placeholder="e.g., johndoe_123"
              urlPrefix="u/"
              originalName={originalValues?.username}
              onAvailabilityChange={setIsUsernameAvailable}
              required
            />
            {isFieldModified("username") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleSaveInput("username")}
                  disabled={savingField === "username"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  disabled={!isUsernameAvailable||savingField === "username" || !username.trim()}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "username" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Biography Field */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-neutral-800">Biography</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-slate-400 resize-y"
              rows={4}
            />
            {isFieldModified("biography") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleCancelField("biography")}
                  disabled={savingField === "biography"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInput("biography")}
                  disabled={savingField === "biography"}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "biography" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Birth Date Field */}
          <div className="flex flex-col">
            <label className="font-medium text-neutral-800">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 mt-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
            />
            {isFieldModified("birthDate") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleCancelField("birthDate")}
                  disabled={savingField === "birthDate"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInput("birth_date")}
                  disabled={savingField === "birthDate"}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "birthDate" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Sex Field */}
          <div className="flex flex-col">
            <label className="font-medium text-neutral-800">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3 py-2 mt-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {isFieldModified("sex") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleCancelField("sex")}
                  disabled={savingField === "sex"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInput("sex")}
                  disabled={savingField === "sex"}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "sex" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Enrollment Year Field */}
          <div className="flex flex-col">
            <label className="font-medium text-neutral-800">
              Enrollment Year
            </label>
            <select
              value={enrollmentYearId}
              onChange={(e) => setEnrollmentYearId(e.target.value)}
              className="w-full px-3 py-2 mt-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Select year...</option>
              {enrollmentYearsData?.data?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </select>
            {isFieldModified("enrollmentYearId") && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleCancelField("enrollmentYearId")}
                  disabled={savingField === "enrollmentYearId"}
                  className="px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInput("enrollment_year_id")}
                  disabled={savingField === "enrollmentYearId"}
                  className="px-3 py-1.5 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {savingField === "enrollmentYearId" ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MyProfile;
