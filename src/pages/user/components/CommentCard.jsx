import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus, Minus, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import RelativeTime from "../../../components/RelativeTime";
import { extractErrorMessage } from "../../../utils";
import CommentMenu from "./CommentMenu";
import UserAvatar from "../../../components/UserAvatar";
import {
  useToggleCommentLikeByCommentIdMutation,
  useToggleTestCommentLikeByCommentIdMutation,
  useUpdateCommentByBoardPostMutation,
  useUpdateCommentByDescTestMutation
} from "../../../services/commentsApi";

const CommentCard = ({
  comment,
  depth = 0,
  activeReplyId,
  setActiveReplyId,
  handleReplySubmit,
  community,
  itemId,
  itemType = "post",
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
  const [toggleTestCommentLike, { error: toggleTestCommentLikeError }] =
    useToggleTestCommentLikeByCommentIdMutation();
  const [updateComment, { isLoading: isUpdating, error: updateCommentError }] =
    useUpdateCommentByBoardPostMutation();
  const [updateTestComment, {isLoading: testCommentIsUpdating, error: testCommentUpdateError}] = useUpdateCommentByDescTestMutation();
  const isReplying = activeReplyId === comment.id;

  // Handle comment mutation errors
  useEffect(() => {
    if (toggleCommentLikeError && onError) {
      onError(extractErrorMessage(toggleCommentLikeError));
    }
  }, [toggleCommentLikeError, onError]);

  useEffect(() => {
    if (toggleTestCommentLikeError && onError) {
      onError(extractErrorMessage(toggleTestCommentLikeError));
    }
  }, [toggleTestCommentLikeError, onError]);

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
      const toggleLike = itemType === "test" ? toggleTestCommentLike : toggleCommentLike;
      const res = await toggleLike({ comment: comment.id }).unwrap();
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
      if (itemType == "test") {
        await updateTestComment({
          desc: community,
          test: itemId,
          comment: comment.id,
          bodyData: { body: editText.trim() },
        }).unwrap();
      }
      else {
        await updateComment({
          board: community,
          post: itemId,
          comment: comment.id,
          bodyData: { body: editText.trim() },
        }).unwrap();
      }
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
          <button
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <UserAvatar
              hash={comment?.author?.avatar?.file_hash}
              alt={`${comment?.author?.username}'s profile picture`}
              loading="lazy"
            />
          </button>

          {/* Vertical Line for nested comments */}
          {comment.direct_children_count > 0 && (
            <div className="w-0.5 bg-neutral-300 dark:bg-neutral-700 flex-1 min-h-[20px]" />
          )}
        </div>

        {/* Content Column */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {/* Username and metadata */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
                  u/{comment.author.username}
                </span>
                <RelativeTime
                  date={comment.created_at}
                  className="flex items-center text-[12px] text-neutral-600 dark:text-neutral-400"
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 resize-none"
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
                    className="px-4 py-1.5 bg-blue-500 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-neutral-900 dark:border dark:border-neutral-100 dark:hover:text-neutral-100 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 dark:disabled:hover:text-neutral-900 dark:disabled:border-neutral-700 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={isUpdating}
                    className="px-4 py-1.5 text-neutral-700 dark:text-neutral-200 text-sm rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
                {comment.body}
              </div>
            )}
            {/* Action buttons */}
            {!isEditing && (
              <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                <button
                  onClick={onToggleCommentLike}
                  className="flex items-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-1 py-0.5 rounded transition-colors"
                >
                  <Heart
                    className={isLiked ? "text-red-500 fill-red-500" : ""}
                  />
                  <span
                    ref={commentLikeCountRef}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    {comment.likes_count}
                  </span>
                </button>
                <button
                  onClick={handleReplyClick}
                  className="hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-0.5 rounded transition-colors"
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
                className="flex-1 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-none overflow-hidden"
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
                className="px-4 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Render nested comments */}
          {isRepliesShown &&
            comment.direct_children &&
            comment.direct_children.length > 0 && (
              <div className="space-y-4">
                {comment.direct_children.map((child) => (
                  <CommentCard
                    key={child.id}
                    comment={child}
                    depth={depth + 1}
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
                ))}
              </div>
            )}

          {/* Show more replies indicator */}
          {comment.direct_children_count > 0 &&
            comment.direct_children.length > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="border border-neutral-300 dark:border-neutral-700 rounded-full p-0.5 text-xs cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 text-neutral-500 dark:text-neutral-400"
                  onClick={() => setIsRepliesShown((prev) => !prev)}
                >
                  {isRepliesShown ? <Minus /> : <Plus />}
                </div>
                {!isRepliesShown && (
                  <p className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline">
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

export default CommentCard;
