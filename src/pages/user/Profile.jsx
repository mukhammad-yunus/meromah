import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUser, FaEdit, FaComment, FaQuestionCircle } from "react-icons/fa";
import Loading from "../../components/Loading.jsx";
import ErrorDisplay from "../../components/ErrorDisplay.jsx";
import NotFound from "../../components/NotFound.jsx";
import ReportModal from "./components/ReportModal.jsx";
import { DEFAULT_PLACEHOLDERS, getFileUrl, getInitials } from "../../utils/index.js";
import {
  useGetMeQuery,
  useGetMyProfileQuery,
  useGetUserByUsernameQuery,
} from "../../services/userApi.js";
import { useGetPostsByFilterQuery } from "../../services/postsApi.js";
import { useGetUserCommentQuery } from "../../services/commentsApi.js";
import ProfileMenu from "./components/profile/ProfileMenu.jsx";
import ProfilePosts from "./components/profile/ProfilePosts.jsx";
import ProfileOverview from "./components/profile/ProfileOverview.jsx";
import ProfileComments from "./components/profile/ProfileComments.jsx";
import ProfileTests from "./components/profile/ProfileTests.jsx";

const Profile = ({ isMyProfile = false }) => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [imageError, setImageError] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch data based on isMyProfile
  const {
    data: myUserData,
    isLoading: isMyUserLoading,
    isError: isMyUserError,
    error: myUserError,
  } = useGetMeQuery(undefined, { skip: !isMyProfile });

  const {
    data: myProfileData,
    isLoading: isMyProfileLoading,
    isError: isMyProfileError,
    error: myProfileError,
  } = useGetMyProfileQuery(undefined, { skip: !isMyProfile });

  const {
    data: otherUserData,
    isLoading: isOtherUserLoading,
    isError: isOtherUserError,
    error: otherUserError,
  } = useGetUserByUsernameQuery(username, { skip: isMyProfile || !username });

  // Determine which data to use
  const user = isMyProfile ? myUserData?.data : otherUserData?.user;
  const profile = isMyProfile ? myProfileData?.data : otherUserData?.profile;
  const currentUsername = isMyProfile ? user?.username : username;

  // Fetch posts
  const {
    data: postsData,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
  } = useGetPostsByFilterQuery(
    { queryParams: `author=${currentUsername}` },
    { skip: !currentUsername }
  );

  // Fetch comments
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetUserCommentQuery(
      { username: currentUsername },
      { skip: !currentUsername }
    );

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: FaUser },
      { id: "posts", label: "Posts", icon: FaEdit },
      { id: "tests", label: "Tests", icon: FaQuestionCircle },
      { id: "comments", label: "Comments", icon: FaComment },
    ],
    []
  );

  const avatarUrl = useMemo(
    () => (user?.avatar?.file_hash ? getFileUrl(user.avatar.file_hash) : null),
    [user]
  );

  const bannerUrl = useMemo(
    () =>
      profile?.banner?.file_hash ? getFileUrl(profile.banner.file_hash) : null,
    [profile]
  );

  const formatJoinDate = (dateString) => {
    if (!dateString || dateString === "Unknown")
      return DEFAULT_PLACEHOLDERS.joinDate;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return DEFAULT_PLACEHOLDERS.joinDate;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ProfileOverview
            profile={profile}
            user={user}
            formatJoinDate={formatJoinDate}
          />
        );
      case "posts":
        return (
          <ProfilePosts
            isPostsLoading={isPostsLoading}
            isPostsSuccess={isPostsSuccess}
            posts={postsData}
          />
        );
      case "tests":
        return <ProfileTests isLoading={false} tests={[]} />;
      case "comments":
        return (
          <ProfileComments
            isLoading={isCommentsLoading}
            comments={commentsData}
          />
        );
      default:
        return (
          <Overview
            profile={profile}
            user={user}
            formatJoinDate={formatJoinDate}
          />
        );
    }
  };

  // Loading states
  const isLoading = isMyProfile
    ? isMyUserLoading || isMyProfileLoading
    : isOtherUserLoading;

  if (isLoading) return <Loading />;

  // Error handling
  if (isMyProfile && (isMyUserError || isMyProfileError)) {
    return <ErrorDisplay error={myUserError || myProfileError} />;
  }

  if (!isMyProfile && isOtherUserError) {
    if (otherUserError?.status === 404) return <NotFound />;
    return <ErrorDisplay error={otherUserError} />;
  }

  // Data validation
  if (!user) {
    return <ErrorDisplay error={{ message: "User data not available" }} />;
  }

  return (
    <div className="min-h-screen bg-primary-bg py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-screen bg-white flex flex-col gap-6 rounded-lg overflow-hidden">
        {/* Banner and Avatar Section - Mobile First */}
        <div>
          {/* Banner Section */}
          <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 overflow-hidden">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : null}

            {/* Three-dot menu */}
            <ProfileMenu
              isMyProfile={isMyProfile}
              onReport={() => setShowReportModal(true)}
            />
          </div>

          <div className=" relative">
            <div className="px-4 pb-4">
              <div className="flex flex-col items-start sm:flex-row sm:items-end gap-4 -mt-14">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden flex-shrink-0">
                  {!imageError && avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.username || "user-avatar"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(user?.name || user?.username || "User")}
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-lg md:text-xl font-bold text-neutral-900">
                    {user?.name || user?.username || "User"}
                  </h1>
                  <p className="text-sm text-neutral-600">
                    u/{user?.username || "user"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs and Content */}
        <div>
          {/* Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary-blue border-b-2 border-primary-blue bg-blue-50"
                      : "text-neutral-600 hover:text-primary-blue hover:bg-neutral-50"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          item={user}
          itemType="user"
        />
      )}
    </div>
  );
};

export default Profile;
