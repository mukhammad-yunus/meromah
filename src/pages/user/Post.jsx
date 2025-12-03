import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPostFromBoardByPostIdQuery,
  useTogglePostLikeMutation,
} from "../../services/postsApi";
import {
  useCreateCommentByBoardPostMutation,
  useGetCommentsByBoardPostQuery,
} from "../../services/commentsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import { useSelector } from "react-redux";
import { extractErrorMessage } from "../../utils";
import PostHeader from "./components/PostHeader";
import PostContent from "./components/PostContent";
import PostActions from "./components/PostActions";
import CommentForm from "./components/CommentForm";
import CommentsList from "./components/CommentsList";
import ShareModal from "./components/ShareModal";
import EditPostModal from "./components/EditPostModal";
import ReportModal from "./components/ReportModal";
import DeletePostModal from "./components/DeletePostModal";
import DeleteCommentModal from "./components/DeleteCommentModal";

const Post = ({ postType }) => {
  const { board, postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
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
  const [postComment, { error: postCommentError, isLoading }] =
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
      <div className="w-full md:max-w-4xl md:mx-auto sm:px-4 md:px-8 md:py-8">
        {/* Main Post Card */}
        <div className="bg-white md:rounded-lg md:border md:border-gray-200 overflow-hidden">
          {/* Post Header */}
          <PostHeader
            postData={postData}
            postType={postType}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={handleReport}
          />

          {/* Post Content */}
          <div className="p-4 sm:px-6 md:px-8">
            <PostContent
              item={postData}
              itemType={postType}
              images={images}
              files={files}
            />
          </div>

          {/* Post Actions */}
          <PostActions
            isPostLiked={isPostLiked}
            likesCount={postData.data.likes_count}
            postLikesCountRef={postLikesCountRef}
            onTogglePostLike={onTogglePostLike}
            onShare={() => setIsShareModalOpen(true)}
          />

          {/* Comments Section */}
          <div className="border-t border-gray-200 p-4 sm:p-6 md:p-8 flex flex-col gap-6">
            {/* Add Comment Form */}
            <CommentForm onSubmit={handleCommentSubmit} isLoading={isLoading} />

            {/* Comments List */}
            <CommentsList
              commentsData={commentsData}
              isCommentsLoading={isCommentsLoading}
              commentCountRef={commentCountRef}
              commentsCount={postData?.data.comments_count || 0}
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
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {postData?.data && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          postUrl={`${window.location.origin}/b/${postData.data.board.name}/post/${postData.data.id}`}
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
