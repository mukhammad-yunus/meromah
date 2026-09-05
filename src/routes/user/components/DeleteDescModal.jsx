import React from "react";
import { useDeleteDescMutation } from "../../../services/descsApi";
import DeleteModal from "./DeleteModal";

const DeleteDescModal = ({ isOpen, onClose, desc, onSuccess }) => {
  const [deleteDesc, { isLoading: isDeleting }] = useDeleteDescMutation();

  const handleConfirm = async () => {
    await deleteDesc({
      desc: desc.name,
    }).unwrap();
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
      itemType="desc"
      onSuccess={onSuccess}
    />
  );
};

export default DeleteDescModal;


