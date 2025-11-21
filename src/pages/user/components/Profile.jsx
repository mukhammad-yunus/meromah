import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaCalendarAlt,
  FaComment,
  FaQuestionCircle,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useSelector } from "react-redux";
import PostCard from "./PostCard.jsx";
import CommentCard from "./CommentCard.jsx";
import Loading from "../../../components/Loading.jsx";
import ErrorDisplay from "../../../components/ErrorDisplay.jsx";
import NotFound from "../../../components/NotFound.jsx";
import ReportModal from "./ReportModal.jsx";
import { getFileUrl, getInitials } from "../../../utils";
import {
  useGetMeQuery,
  useGetMyProfileQuery,
  useGetUserByUsernameQuery,
} from "../../../services/userApi.js";
import { useGlobalPostSearchQuery } from "../../../services/postsApi.js";
import { useGetUserCommentQuery } from "../../../services/commentsApi.js";

// Default placeholders for missing data
const DEFAULT_PLACEHOLDERS = {
  bio: "No bio available",
  joinDate: "Unknown",
  noPosts: "No posts yet",
  noQuizzes: "No quizzes created yet",
  noComments: "No comments yet",
};

// Posts Component
const Posts = React.memo(({ isPostsLoading, posts, isPostsSuccess }) => {
  if (isPostsLoading) return <Loading />;

  if (isPostsSuccess && posts?.data?.length > 0) {
    return (
      <>
        {posts.data.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            isFirst={index === 0}
            isLast={index === posts.data.length - 1}
            postType={post.files?.length > 0 ? "library" : "post"}
          />
        ))}
      </>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
      <FaEdit className="mx-auto text-4xl text-neutral-400 mb-4" />
      <p className="text-neutral-600">{DEFAULT_PLACEHOLDERS.noPosts}</p>
    </div>
  );
});

// Overview Component
const Overview = ({ profile, user, formatJoinDate }) => (
  <div className="space-y-6">
    <div className="rounded-lg py-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <FaUser className="text-primary-blue" />
        About
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-600">Bio</label>
          <p className="text-neutral-900 mt-1">
            {profile?.biography || profile?.bio || DEFAULT_PLACEHOLDERS.bio}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-600 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-blue" />
            Member Since
          </label>
          <p className="text-neutral-900 mt-1">
            {formatJoinDate(
              user?.created_at || user?.createdAt || DEFAULT_PLACEHOLDERS.joinDate
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Comments Component
const Comments = ({ isLoading, comments }) => {
  if (isLoading) return <Loading />;

  if (comments?.length > 0) {
    return (
      <div>
        {comments.map((comment, i) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isFirst={i === 0}
            isLast={i === comments.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
      <FaComment className="mx-auto text-4xl text-neutral-400 mb-4" />
      <p className="text-neutral-600">{DEFAULT_PLACEHOLDERS.noComments}</p>
    </div>
  );
};

// Quizzes Component
const Quizzes = ({ isLoading, tests }) => {
  if (isLoading) return <Loading />;

  if (tests?.length > 0) {
    return (
      <div>
        {tests.map((quiz, i) => (
          <PostCard
            key={quiz.id}
            post={quiz}
            isFirst={i === 0}
            isLast={i === tests.length - 1}
            postType="quiz"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
      <FaQuestionCircle className="mx-auto text-4xl text-neutral-400 mb-4" />
      <p className="text-neutral-600">{DEFAULT_PLACEHOLDERS.noQuizzes}</p>
    </div>
  );
};

// Three-dot menu component
const ProfileMenu = ({ isMyProfile, onReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    navigate("/profile/edit");
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onReport();
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label="Profile options"
        aria-expanded={isOpen}
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isMyProfile ? (
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              Report user
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
  } = useGlobalPostSearchQuery(
    { queryParams: `author=${currentUsername}` },
    { skip: !currentUsername }
  );

  // Fetch comments
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetUserCommentQuery({ username: currentUsername }, { skip: !currentUsername });

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: FaUser },
      { id: "posts", label: "Posts", icon: FaEdit },
      { id: "quizzes", label: "Quizzes", icon: FaQuestionCircle },
      { id: "comments", label: "Comments", icon: FaComment },
    ],
    []
  );

  const avatarUrl = useMemo(
    () => (user?.avatar?.file_hash ? getFileUrl(user.avatar.file_hash) : null),
    [user]
  );

  const bannerUrl = useMemo(
    () => (profile?.banner?.file_hash ? getFileUrl(profile.banner.file_hash) : null),
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
          <Overview
            profile={profile}
            user={user}
            formatJoinDate={formatJoinDate}
          />
        );
      case "posts":
        return (
          <Posts
            isPostsLoading={isPostsLoading}
            isPostsSuccess={isPostsSuccess}
            posts={postsData}
          />
        );
      case "quizzes":
        return <Quizzes isLoading={false} tests={[]} />;
      case "comments":
        return <Comments isLoading={isCommentsLoading} comments={commentsData} />;
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
