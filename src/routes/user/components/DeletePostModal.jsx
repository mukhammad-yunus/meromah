import React from "react";
import { useDeletePostMutation } from "../../../services/postsApi";
import DeleteModal from "./DeleteModal";
import { useDeleteTestMutation } from "../../../services/testsApi";

const DeletePostModal = ({
  isOpen,
  onClose,
  communityName,
  itemId,
  onSuccess,
  communityType = "board",
}) => {
  const [deletePost, { isLoading: isPostDeleting }] = useDeletePostMutation();
  const [deleteTest, { isLoading: isTestDeleting }] = useDeleteTestMutation();
  const isDeleting = isPostDeleting || isTestDeleting
  const handleConfirm = async () => {
    if (communityType === "board") {
      await deletePost({
        board: communityName,
        post: itemId,
      }).unwrap();
    } else if (communityType === "desc") {
      await deleteTest({
        desc: communityName,
        test: itemId,
      }).unwrap();
    } else{
      throw new Error("Community type is not valid");
    }
  };

  return (
    <DeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
      itemType="post"
      onSuccess={onSuccess}
      itemId={itemId}
    />
  );
};

export default DeletePostModal;
