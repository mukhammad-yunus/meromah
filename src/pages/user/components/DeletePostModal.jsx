import React from "react";
import { useDeletePostMutation } from "../../../services/postsApi";
import DeleteModal from "./DeleteModal";

const DeletePostModal = ({ isOpen, onClose, board, postId, onSuccess }) => {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const handleConfirm = async () => {
    await deletePost({
      board,
      post: postId,
    }).unwrap();
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
      itemType="post"
      onSuccess={onSuccess}
    />
  );
};

export default DeletePostModal;
