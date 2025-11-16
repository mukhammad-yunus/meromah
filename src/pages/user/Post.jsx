import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiShare2,
  FiSend,
  FiPlus,
  FiMinus,
  FiChevronLeft,
} from "react-icons/fi";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import {
  useGetPostFromBoardByPostIdQuery,
  useTogglePostLikeMutation,
} from "../../services/postsApi";
import {
  useCreateCommentByBoardPostMutation,
  useGetCommentsByBoardPostQuery,
  useToggleCommentLikeByCommentIdMutation,
} from "../../services/commentsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import { useSelector } from "react-redux";
import RelativeTime from "../../components/RelativeTime";
import { getInitials } from "../../utils";
import PostImages from "./components/PostImages";
import PostFiles from "./components/PostFiles";
import ShareModal from "./components/ShareModal";
import PostMenu from "./components/PostMenu";
import EditPostModal from "./components/EditPostModal";
import ReportModal from "./components/ReportModal";
import DeletePostModal from "./components/DeletePostModal";
import CommentMenu from "./components/CommentMenu";
import DeleteCommentModal from "./components/DeleteCommentModal";
import {
  useUpdateCommentByBoardPostMutation,
} from "../../services/commentsApi";

const getType = {
  post: ["b", "board"],
  quiz: ["d", "desc"],
  library: ["b", "board"],
};

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

const Comment = ({
  comment,
  getInitials,
  depth = 0,
  activeReplyId,
  setActiveReplyId,
  handleReplySubmit,
  board,
  postId,
  onEditComment,
  onDeleteComment,
  onReportComment,
  onError,
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState("");
  const [isRepliesShown, setIsRepliesShown] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.youLiked);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);

  // Reset edit state when comment changes
  useEffect(() => {
    setIsEditing(false);
    setEditText(comment.body);
  }, [comment.id, comment.body]);
  const commentLikeCountRef = useRef(null);
  const [toggleCommentLike, { error: toggleCommentLikeError }] =
    useToggleCommentLikeByCommentIdMutation();
  const [updateComment, { isLoading: isUpdating, error: updateCommentError }] =
    useUpdateCommentByBoardPostMutation();
  const isReplying = activeReplyId === comment.id;

  // Handle comment mutation errors
  useEffect(() => {
    if (toggleCommentLikeError && onError) {
      onError(extractErrorMessage(toggleCommentLikeError));
    }
  }, [toggleCommentLikeError, onError]);

  useEffect(() => {
    if (updateCommentError && onError) {
      onError(extractErrorMessage(updateCommentError));
    }
  }, [updateCommentError, onError]);

  const handleReplyClick = () => {
    if (isReplying) {
      setActiveReplyId(null);
      setReplyText("");
    } else {
      setActiveReplyId(comment.id);
      setReplyText("");
    }
  };

  const onReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      handleReplySubmit(e, comment.id, replyText, setReplyText);
      setReplyText("");
      setActiveReplyId(null);
    }
  };
  const onToggleCommentLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await toggleCommentLike({ comment: comment.id }).unwrap();
      setIsLiked(res.toggle);
      if (res.toggle) {
        commentLikeCountRef.current.textContent =
          Number(commentLikeCountRef.current.textContent) + 1;
      } else {
        commentLikeCountRef.current.textContent =
          Number(commentLikeCountRef.current.textContent) - 1;
      }
    } catch (error) {
      // Error will be handled by useEffect below
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(comment.body);
    if (onEditComment) {
      onEditComment(comment.id);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(comment.body);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editText.trim() || editText === comment.body) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment({
        board,
        post: postId,
        comment: comment.id,
        bodyData: { body: editText.trim() },
      }).unwrap();
      setIsEditing(false);
      // The API will refresh the comments list via invalidatesTags
    } catch (err) {
      // Error will be handled by useEffect below
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDeleteComment) {
      onDeleteComment(comment.id);
    }
  };

  const handleReportClick = (e) => {
    e.stopPropagation();
    if (onReportComment) {
      onReportComment(comment);
    }
  };
  return (
    <div>
      <div className="flex gap-3">
        {/* Avatar and Thread Line Column */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(comment.author.username)}
          </div>

          {/* Vertical Line for nested comments */}
          {comment.direct_children_count > 0 && (
            <div className="w-0.5 bg-gray-300 flex-1 min-h-[20px]" />
          )}
        </div>

        {/* Content Column */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {/* Username and metadata */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 hover:underline cursor-pointer">
                  u/{comment.author.username}
                </span>
                <RelativeTime
                  date={comment.created_at}
                  className="flex items-center text-[12px] text-gray-600"
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <CommentMenu
                  comment={comment}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onReport={handleReportClick}
                />
              </div>
            </div>
            {/* Comment body or Edit form */}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleEditCancel();
                    }
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleEditSave(e);
                    }
                  }}
                  autoFocus
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                  style={{
                    minHeight: "60px",
                    maxHeight: "200px",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditSave}
                    disabled={!editText.trim() || isUpdating}
                    className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={isUpdating}
                    className="px-4 py-1.5 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-900 leading-relaxed">
                {comment.body}
              </div>
            )}
            {/* Action buttons */}
            {!isEditing && (
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <button
                  onClick={onToggleCommentLike}
                  className="flex items-center gap-1 hover:bg-gray-100 px-1 py-0.5 rounded transition-colors"
                >
                  {isLiked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                  <span
                    ref={commentLikeCountRef}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    {comment.likes_count}
                  </span>
                </button>
                <button
                  onClick={handleReplyClick}
                  className="hover:bg-gray-100 px-2 py-0.5 rounded transition-colors"
                >
                  {isReplying ? "✕ Cancel" : "Reply"}
                </button>
              </div>
            )}
          </div>

          {/* Reply Input */}
          {isAuthenticated && isReplying && (
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (replyText.trim()) {
                      onReplySubmit(e);
                    }
                  }
                }}
                placeholder={`Reply to u/${comment.author.username}...`}
                autoFocus
                rows={1}
                className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-neutral-400 resize-none overflow-hidden"
                style={{
                  minHeight: "40px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={onReplySubmit}
                disabled={!replyText.trim()}
                className="px-4 h-10 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm flex-shrink-0"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Render nested comments */}
          {isRepliesShown &&
            comment.direct_children &&
            comment.direct_children.length > 0 && (
              <div className="space-y-4">
                {comment.direct_children.map((child) => (
                  <Comment
                    key={child.id}
                    comment={child}
                    getInitials={getInitials}
                    depth={depth + 1}
                    activeReplyId={activeReplyId}
                    setActiveReplyId={setActiveReplyId}
                    handleReplySubmit={handleReplySubmit}
                    board={board}
                    postId={postId}
                    onEditComment={onEditComment}
                    onDeleteComment={onDeleteComment}
                    onReportComment={onReportComment}
                    onError={onError}
                  />
                ))}
              </div>
            )}

          {/* Show more replies indicator */}
          {comment.direct_children_count > 0 &&
            comment.direct_children.length > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="border rounded-full p-0.5 text-xs cursor-pointer hover:text-neutral-600"
                  onClick={() => setIsRepliesShown((prev) => !prev)}
                >
                  {isRepliesShown ? <FiMinus /> : <FiPlus />}
                </div>
                {!isRepliesShown && (
                  <p className="flex items-center gap-1 text-xs text-blue-600 font-bold cursor-pointer hover:underline">
                    <span>{comment.direct_children_count}</span>
                    <span>
                      {comment.direct_children_count === 1
                        ? "reply"
                        : "replies"}
                    </span>
                  </p>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const Post = ({ postType }) => {
  const { board, postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCommentReportModalOpen, setIsCommentReportModalOpen] =
    useState(false);
  const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] =
    useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [toast, setToast] = useState(null);
  const commentCountRef = useRef(null);
  const postLikesCountRef = useRef(null);
  const [postComment, { error: postCommentError, isLoading, isError }] =
    useCreateCommentByBoardPostMutation();
  const [togglePostLike, { error: togglePostLikeError }] =
    useTogglePostLikeMutation();
  const {
    data: postData,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useGetPostFromBoardByPostIdQuery({
    board,
    postId,
  });
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
  } = useGetCommentsByBoardPostQuery({
    board,
    postId,
    queryParams: undefined,
  });
  // Separate images and files based on mimetype
  const { images, files } = useMemo(() => {
    if (!postData?.data?.files || postData.data.files.length === 0) {
      return { images: [], files: [] };
    }
    const imageFiles = postData.data.files.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    const nonImageFiles = postData.data.files.filter(
      (file) => !file.mimetype.startsWith("image/")
    );
    return { images: imageFiles, files: nonImageFiles };
  }, [postData?.data?.files]);
  useEffect(() => {
    if (postData === undefined) return;
    if (isPostError) return;
    setIsPostLiked(postData.data.youLiked);
  }, [postData]);

  // Handle mutation errors with Toast
  useEffect(() => {
    if (postCommentError) {
      setToast({
        message: extractErrorMessage(postCommentError),
        type: "error",
      });
    }
  }, [postCommentError]);

  useEffect(() => {
    if (togglePostLikeError) {
      setToast({
        message: extractErrorMessage(togglePostLikeError),
        type: "error",
      });
    }
  }, [togglePostLikeError]);

  if (isPostLoading) return <Loading />;
  if (isPostError) {
    if (postError.status === 404) return <NotFound />;
    return <ErrorDisplay error={postError} />;
  }
  if (isCommentsLoading) return <Loading />;
  if (isCommentsError) {
    if (commentsError.status === 404) return <NotFound />;
    return <ErrorDisplay error={commentsError} />;
  }
  if (!postData || !commentsData) return null;
  const handleCommentSubmit = async (e, parent_id, body = "", setEmpty) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (body.trim()) {
      try {
        await postComment({
          board,
          post: postId,
          bodyData: { parent_id, body },
        }).unwrap();
        //It gets the textContent of the comment count and adds 1 when the comment submission is OK
        commentCountRef.current.textContent =
          Number(commentCountRef.current.textContent) + 1;
        setEmpty("");
        setActiveReplyId(null);
      } catch (error) {
        // Error will be handled by useEffect above
      }
    }
  };

  const handleAuthorClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
  };

  const handleBoardClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
  };
  const onTogglePostLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await togglePostLike({ board, post: postId }).unwrap();
      setIsPostLiked(res.toggle);
      if (res.toggle) {
        postLikesCountRef.current.textContent =
          Number(postLikesCountRef.current.textContent) + 1;
      } else {
        postLikesCountRef.current.textContent =
          Number(postLikesCountRef.current.textContent) - 1;
      }
    } catch (error) {
      // Error will be handled by useEffect above
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setIsReportModalOpen(true);
  };

  const handleCommentEdit = (commentId) => {
    setSelectedCommentId(commentId);
  };

  const handleCommentDelete = (commentId) => {
    setSelectedCommentId(commentId);
    setIsCommentDeleteModalOpen(true);
  };

  const handleCommentReport = (comment) => {
    setSelectedComment(comment);
    setIsCommentReportModalOpen(true);
  };

  const handleCommentDeleteSuccess = () => {
    // Update comment count when comment is deleted
    if (commentCountRef.current) {
      commentCountRef.current.textContent =
        Math.max(0, Number(commentCountRef.current.textContent) - 1);
    }
    setIsCommentDeleteModalOpen(false);
    setSelectedCommentId(null);
  };

  const handleCommentError = (errorMessage) => {
    setToast({
      message: errorMessage,
      type: "error",
    });
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Post Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Post Header */}
          <div className="px-4 border-b border-gray-200">
            <div className="flex items-center justify-between gap-2 py-4">
              <div className="flex items-center gap-2">
                {/* Back button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors font-medium cursor-pointer"
                >
                  <FiChevronLeft className="text-2xl" />
                </button>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white"
                    onClick={(e) =>
                      handleAuthorClick(
                        e,
                        `/user/${postData.data.author.username}`
                      )
                    }
                  >
                    <p className="w-11 h-11 flex items-center justify-center rounded-full">
                      {getInitials(postData.data.author.username)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="max-w-5/6 w-full text-primary-blue text-base cursor-pointer hover:underline truncate font-medium"
                      role="button"
                      tabIndex={0}
                      onClick={(e) =>
                        handleBoardClick(
                          e,
                          `/${getType[postType][0]}/${postData.data.board.name}`
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleBoardClick(
                          e,
                          `/${getType[postType][0]}/${postData.data.board.name}`
                        )
                      }
                    >
                      {getType[postType][0]}/{postData.data.board.name}
                    </p>
                    <p className="text-[12px] flex items-center gap-1">
                      <span
                        onClick={(e) =>
                          handleAuthorClick(
                            e,
                            `/user/${postData.data.author.username}`
                          )
                        }
                        className="cursor-pointer hover:underline"
                        role="link"
                        tabIndex={0}
                      >
                        u/{postData.data.author.username}
                      </span>
                      <RelativeTime
                        date={postData.data.created_at}
                        className="flex items-center text-gray-700 ml-1 "
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <PostMenu
                  post={postData.data}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReport={handleReport}
                />
              </div>
            </div>

            {/* Content based on post type */}
            <div className="pb-4">
              {postType === "test" ? (
                <div className="group flex justify-between items-center border-l-4 border-blue-500 bg-blue-50 p-4 rounded hover:bg-blue-100 transition-colors duration-200">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{postData.data.title}</p>
                    <p className="text-sm text-neutral-600">
                      {postData.data.body}
                    </p>
                  </div>
                  <button
                    className="ml-auto px-4 py-2 rounded bg-primary-blue text-white text-sm hover:bg-primary-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Start
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <h1 className="font-bold text-2xl">{postData.data.title}</h1>
                  <p className="text-gray-700">{postData.data.body}</p>
                  {/* Display images if available */}
                  {images.length > 0 && <PostImages images={images} />}
                  {/* Display files if available */}
                  {files.length > 0 && <PostFiles files={files} />}
                </div>
              )}
            </div>
          </div>
          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-neutral-600 text-sm">
              <button
                onClick={onTogglePostLike}
                className="flex items-center gap-2 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none"
                title={isPostLiked ? "Unlike" : "Like"}
                aria-label={`${postData.data.likes_count} likes`}
              >
                {isPostLiked ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
                <span
                  ref={postLikesCountRef}
                  className={isPostLiked ? "text-red-500" : ""}
                >
                  {postData.data.likes_count}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
                title="Share"
              >
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 p-6 flex flex-col gap-6">
            {/* Add Comment Form */}
            {isAuthenticated && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                    U
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (newComment.trim()) {
                          handleCommentSubmit(
                            e,
                            null,
                            newComment,
                            setNewComment
                          );
                        }
                      }
                    }}
                    placeholder="Add a comment..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue placeholder-neutral-400 resize-none overflow-hidden"
                    style={{
                      minHeight: "40px",
                      maxHeight: "120px",
                    }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    onClick={(e) =>
                      handleCommentSubmit(e, null, newComment, setNewComment)
                    }
                    disabled={!newComment.trim()}
                    className="px-4 h-10 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <h4 className="font-semibold text-neutral-900 flex items-center gap-2 text-base">
              <FaRegComment className="text-neutral-600" />
              <span>
                Comments (
                <span ref={commentCountRef}>
                  {postData?.data.comments_count || 0}
                </span>
                )
              </span>
            </h4>

            {/* Render all root comments */}
            {isCommentsLoading ? (
              <Loading />
            ) : (
              <div className="space-y-4">
                {commentsData?.data && commentsData.data.length > 0 ? (
                  commentsData.data.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      getInitials={getInitials}
                      depth={0}
                      activeReplyId={activeReplyId}
                      setActiveReplyId={setActiveReplyId}
                      handleReplySubmit={handleCommentSubmit}
                      board={board}
                      postId={postId}
                      onEditComment={handleCommentEdit}
                      onDeleteComment={handleCommentDelete}
                      onReportComment={handleCommentReport}
                      onError={handleCommentError}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-neutral-500">
                    <FaRegComment className="text-3xl opacity-50" />
                    <p className="text-sm">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {postData?.data && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          postUrl={`${window.location.origin}/board/${postData.data.board.name}/post/${postData.data.id}`}
          postTitle={postData.data.title}
        />
      )}

      {/* Edit Post Modal */}
      {postData?.data && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={postData.data}
          boardName={board}
        />
      )}

      {/* Report Post Modal */}
      {postData?.data && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          item={postData.data}
          itemType="post"
        />
      )}

      {/* Report Comment Modal */}
      {selectedComment && (
        <ReportModal
          isOpen={isCommentReportModalOpen}
          onClose={() => {
            setIsCommentReportModalOpen(false);
            setSelectedComment(null);
          }}
          item={selectedComment}
          itemType="comment"
        />
      )}

      {/* Delete Comment Modal */}
      <DeleteCommentModal
        isOpen={isCommentDeleteModalOpen}
        onClose={() => {
          setIsCommentDeleteModalOpen(false);
          setSelectedCommentId(null);
        }}
        board={board}
        postId={postId}
        commentId={selectedCommentId}
        onSuccess={handleCommentDeleteSuccess}
      />

      {/* Delete Post Modal */}
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        board={board}
        postId={postId}
      />

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

export default Post;
