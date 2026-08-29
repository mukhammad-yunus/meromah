import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Edit, MessageCircle, HelpCircle } from "lucide-react";
import Loading from "../../components/Loading.jsx";
import ErrorDisplay from "../../components/ErrorDisplay.jsx";
import NotFound from "../../components/NotFound.jsx";
import ReportModal from "./components/ReportModal.jsx";
import { DEFAULT_PLACEHOLDERS, getFileUrl } from "../../utils/index.js";
import UserAvatar from "../../components/UserAvatar.jsx";
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
import { useGetTestsByFilterQuery } from "../../services/testsApi.js";

const Profile = ({ isMyProfile = false }) => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
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
    { queryParams: {author: currentUsername, latest: 1}},
    { skip: !currentUsername }
  );
  // Fetch posts
  const {
    data: testsData,
    isLoading: isTestsLoading,
  } = useGetTestsByFilterQuery(
    { queryParams: {author: currentUsername, latest: 1} },
    { skip: !currentUsername }
  );

  // Fetch comments
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetUserCommentQuery(
      { author: currentUsername },
      { skip: !currentUsername }
    );

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: User },
      { id: "posts", label: "Posts", icon: Edit },
      { id: "tests", label: "Tests", icon: HelpCircle },
      { id: "comments", label: "Comments", icon: MessageCircle },
    ],
    []
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
        return <ProfileTests isLoading={isTestsLoading} tests={testsData?.data} />;
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
    <div className="bg-primary-bg dark:bg-neutral-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto min-h-screen bg-white dark:bg-neutral-900 flex flex-col gap-6 rounded-lg">
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
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-neutral-900 bg-white dark:bg-neutral-900 overflow-hidden flex-shrink-0">
                  <UserAvatar
                    hash={user?.avatar?.file_hash}
                    alt={user?.username || "user-avatar"}
                  />
                </div>

                {/* User info */}
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {user?.name || user?.username || "User"}
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary-blue dark:text-neutral-200 border-b-2 border-primary-blue dark:border-neutral-200 bg-blue-50 dark:bg-neutral-800"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-primary-blue dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
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
