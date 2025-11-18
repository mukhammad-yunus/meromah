import React from "react";
import { useDeleteBoardMutation } from "../../../services/boardsApi";
import DeleteModal from "./DeleteModal";

const DeleteBoardModal = ({ isOpen, onClose, board, onSuccess }) => {
  const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();

  const handleConfirm = async () => {
    await deleteBoard({
      board: board.name,
    }).unwrap();
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
      itemType="board"
      onSuccess={onSuccess}
    />
  );
};

export default DeleteBoardModal;

