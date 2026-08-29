import React from "react";
import { useDeleteCommentByBoardPostMutation, useDeleteCommentByDescTestMutation } from "../../../services/commentsApi";
import DeleteModal from "./DeleteModal";

const DeleteCommentModal = ({
  isOpen,
  onClose,
  community,
  itemId,
  commentId,
  onSuccess,
}) => {

  const [deleteTestComment, { isLoading: isDeletingTestComment }] = useDeleteCommentByDescTestMutation();
  const [deletePostComment, { isLoading: isDeletingPostComment }] = useDeleteCommentByBoardPostMutation();


  const handleConfirm = community == 'board' ? async () => {
      await deletePostComment({
        board: community,
        post: itemId,
        comment: commentId,
      }).unwrap();
    } : async () => {
      await deleteTestComment({
        desc: community,
        test: itemId,
        comment: commentId,
      }).unwrap();
    };


  
  if (community == 'board') {
    return (
      <DeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isDeleting={isDeletingPostComment}
        itemType="comment"
        onSuccess={onSuccess}
      />
    );
  } else {
    return (
      <DeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isDeleting={isDeletingTestComment}
        itemType="comment"
        onSuccess={onSuccess}
      />
    );
  }
};

export default DeleteCommentModal;

