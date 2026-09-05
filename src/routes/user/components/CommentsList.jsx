import { MessageCircle } from "lucide-react";
import Loading from "../../../components/Loading";
import CommentCard from "./CommentCard";

const CommentsList = ({
  commentsData,
  isCommentsLoading,
  commentCountRef,
  commentsCount,
  activeReplyId,
  setActiveReplyId,
  handleReplySubmit,
  community,
  itemId,
  itemType,
  onEditComment,
  onDeleteComment,
  onReportComment,
  onError,
}) => {
  return (
    <>
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 text-base">
        <MessageCircle className="text-neutral-600 dark:text-neutral-400" />
        <span>
          Comments (
          <span ref={commentCountRef}>{commentsCount || 0}</span>)
        </span>
      </h4>

      {/* Render all root comments */}
      {isCommentsLoading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {commentsData?.data && commentsData.data.length > 0 ? (
            commentsData.data.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                handleReplySubmit={handleReplySubmit}
                community={community}
                itemId={itemId}
                itemType={itemType}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
                onReportComment={onReportComment}
                onError={onError}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-neutral-500 dark:text-neutral-400">
              <MessageCircle className="text-3xl opacity-50" />
              <p className="text-sm">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CommentsList;


