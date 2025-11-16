import React from "react";
import { useDeleteCommentByBoardPostMutation } from "../../../services/commentsApi";
import DeleteModal from "./DeleteModal";

const DeleteCommentModal = ({
  isOpen,
  onClose,
  board,
  postId,
  commentId,
  onSuccess,
}) => {
  const [deleteComment, { isLoading: isDeleting }] =
    useDeleteCommentByBoardPostMutation();

  const handleConfirm = async () => {
    await deleteComment({
      board,
      post: postId,
      comment: commentId,
    }).unwrap();
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
      itemType="comment"
      onSuccess={onSuccess}
    />
  );
};

export default DeleteCommentModal;

