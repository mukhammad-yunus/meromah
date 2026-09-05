import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";

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

import useHandlePostPage from "../../hooks/useHandlePostPage";
import { useMemo } from "react";
const getType = {
  post: { url: "b/", community: "board" },
  test: { url: "d/", community: "desc" },
};
const Post = ({ itemType = "post" }) => {
  const { community, itemId } = useParams();
  const { url: communityUrl, community: communityType } = useMemo(
    () => getType[itemType],
    [itemType]
  );

  const {
    // main data
    itemData,
    commentsData,
    images,
    files,

    // statuses
    isItemLoading,
    isCommentsLoading,
    isItemError,
    isCommentsError,
    itemError,
    commentsError,

    // likes
    isPostLiked,
    postLikesCountRef,
    onTogglePostLike,

    // comment submit
    handleCommentSubmit,
    isLoading,
    commentCountRef,

    // UI state
    activeReplyId,
    setActiveReplyId,

    isShareModalOpen,
    setIsShareModalOpen,

    isEditModalOpen,
    setIsEditModalOpen,

    isReportModalOpen,
    setIsReportModalOpen,

    isDeleteModalOpen,
    setIsDeleteModalOpen,

    isCommentReportModalOpen,
    setIsCommentReportModalOpen,

    isCommentDeleteModalOpen,
    setIsCommentDeleteModalOpen,

    selectedComment,
    selectedCommentId,

    // handlers
    handleEdit,
    handleDelete,
    handleReport,
    handleCommentEdit,
    handleCommentDelete,
    handleCommentReport,
    handleCommentError,
    handleCommentDeleteSuccess,

    // toast
    toast,
    setToast,
  } = useHandlePostPage({ community, itemId, itemType });

  // ---- Loading / Error Conditions ----
  if (isItemLoading || isCommentsLoading) return <Loading />;

  if (isItemError) {
    if (itemError?.status === 404) return <NotFound />;
    return <ErrorDisplay error={itemError} />;
  }
  if (!itemData) return null;
  return (
    <div className="min-h-screen bg-primary-bg dark:bg-neutral-950">
      <div className="w-full md:max-w-4xl md:mx-auto sm:px-4 md:px-8 md:py-8">
        <div className="bg-white dark:bg-neutral-900 md:rounded-lg md:border md:border-gray-200 dark:md:border-neutral-700 overflow-hidden">
          <PostHeader
            itemData={itemData}
            community={communityType}
            communityUrl={communityUrl}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={handleReport}
          />

          <div className="p-4 sm:px-6 md:px-8">
            <PostContent
              item={itemData}
              itemType={itemType}
              images={images}
              files={files}
            />
          </div>

          <PostActions
            isPostLiked={isPostLiked}
            likesCount={itemData.data.likes_count}
            postLikesCountRef={postLikesCountRef}
            onTogglePostLike={onTogglePostLike}
            onShare={() => setIsShareModalOpen(true)}
          />

          <div className="border-t border-gray-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8 flex flex-col gap-6">
            <CommentForm onSubmit={handleCommentSubmit} isLoading={isLoading} />

            {isCommentsError && commentsError?.status === 404 ? (
              <NotFound />
            ) : isCommentsError ? (
              <ErrorDisplay error={commentsError} />
            ) : (
              <CommentsList
                commentsData={commentsData}
                isCommentsLoading={isCommentsLoading}
                commentCountRef={commentCountRef}
                commentsCount={itemData?.data.comments_count || 0}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                handleReplySubmit={handleCommentSubmit}
                community={community}
                itemId={itemId}
                itemType={itemType}
                onEditComment={handleCommentEdit}
                onDeleteComment={handleCommentDelete}
                onReportComment={handleCommentReport}
                onError={handleCommentError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemUrl={`${window.location.origin}/${communityUrl}${community}/${itemType}/${itemData.data.id}`}
        itemTitle={itemData.data.title}
      />

      {/* Edit */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={itemData.data}
        community={community}
        itemType={itemType}
      />

      {/* Report Post */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        item={itemData.data}
        itemType={itemType}
      />

      {/* Report Comment */}
      {selectedComment && (
        <ReportModal
          isOpen={isCommentReportModalOpen}
          onClose={() => {
            setIsCommentReportModalOpen(false);
          }}
          item={selectedComment}
          itemType="comment"
        />
      )}

      {/* Delete Comment */}
      <DeleteCommentModal
        isOpen={isCommentDeleteModalOpen}
        onClose={() => {
          setIsCommentDeleteModalOpen(false);
        }}
        community={community}
        itemId={itemId}
        commentId={selectedCommentId}
        onSuccess={handleCommentDeleteSuccess}
      />

      {/* Delete Post */}
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        communityName={community}
        itemId={itemId}
        communityType={communityType}
      />

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
