import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PostCard from "./components/PostCard";
import BoardHeader from "../../components/BoardHeader";
import { useDispatch, useSelector } from "react-redux";
import { addRecentCommunity } from "../../app/recentCommunitiesSlice";
import {
  useCreatePostMutation,
  useGetPostsForBoardQuery,
} from "../../services/postsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import { useGetBoardQuery } from "../../services/boardsApi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoMdAttach } from "react-icons/io";
import useSortBy from "../../hooks/useSortBy";
import CreatePost from "./components/CreatePost";

// Helper function to extract error message from API error response
const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  if (typeof error === "string") return error;
  return (
    error.data?.message ??
    error.data?.error ??
    error.message ??
    error.error ??
    error.response?.data?.message ??
    "An unexpected error occurred. Please try again."
  );
};

const BoardPage = () => {
  const { boardId } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get current user from Redux
  const { profileData } = useSelector((state) => state.myProfile);
  const username = useMemo(() => profileData?.username || null, [profileData]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Create Post State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [toast, setToast] = useState(null);

  // Use custom hook for sorting
  const { sortBy, SortByComponent, emptyStateMessages } = useSortBy(
    isAuthenticated,
    username
  );
  const {
    data: boardData,
    error: boardError,
    isLoading: isBoardLoading,
    isError: isBoardError,
  } = useGetBoardQuery(boardId);
  const {
    data: postData,
    error: postError,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useGetPostsForBoardQuery({ board: boardId, queryParams: sortBy });
  const [createPost] = useCreatePostMutation();
  
  useEffect(() => {
    if (!boardId || !pathname || boardData === undefined) return;
    dispatch(
      addRecentCommunity({
        id: `b/${boardId}`,
        title: `b/${boardId}`,
        to: pathname,
      })
    );
  }, [boardId, pathname, boardData, dispatch]);

  const onShowCreatePost = () => {
    if (!isAuthenticated){
      navigate("/login");
      return;
    };
    setShowCreatePost(true);
  };

  if (isPostLoading || isBoardLoading) return <Loading />;

  if (isPostError || isBoardError) {
    const statusBoard = boardError?.status;
    const statusPost = postError?.status;
    if (statusBoard === 404 || statusPost === 404) return <NotFound />;
    return <ErrorDisplay error={boardError || postError} />;
  }

  if (!boardData || !postData) return null;
  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Board Header */}
        <BoardHeader board={boardData.data} />

        {/* Create Post Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          {!showCreatePost ? (
            <div className="flex items-center gap-3 p-4">
              {/* Avatar */}
              <div
                onClick={onShowCreatePost}
                className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white flex-shrink-0"
              >
                <p className="w-11 h-11 flex items-center justify-center rounded-full">
                  {getInitials(isAuthenticated ? profileData?.name : "User")}
                </p>
              </div>

              {/* Placeholder Text */}
              <div
                onClick={onShowCreatePost}
                className="flex-1 px-4 py-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
              >
                What is on your mind, {profileData?.username || "User"}?
              </div>

              {/* Attachment Icon */}
              <button
                onClick={onShowCreatePost}
                className="p-2 text-neutral-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Attach file"
              >
                <IoMdAttach className="w-5 h-5" />
              </button>
            </div>
          ) : isAuthenticated ? (
            <CreatePost
              boardId={boardId}
              onCancel={()=>setShowCreatePost(false)}
              onError={(errorMessage) => {
                setToast({
                  message: errorMessage,
                  type: "error",
                });
              }}
            />
          ) : null}
        </div>

        {/* Sorting/Filtering Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Posts</h2>
          <SortByComponent />
        </div>

        {/* Posts Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {postData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <FaRegFileAlt className="text-4xl text-neutral-700" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {emptyStateMessages.title}
              </h3>
              <p className="text-neutral-600 text-sm text-center max-w-sm">
                {emptyStateMessages.message}
              </p>
            </div>
          ) : (
            <div>
              {postData.data.map((post, i) => {
                const isFirst = i === 0;
                const isLast = i === postData.data.length - 1;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    isFirst={isFirst}
                    isLast={isLast}
                    postType="post"
                  />
                );
              })}
            </div>
          )}
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

export default BoardPage;
