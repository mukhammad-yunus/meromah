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
    if (communityType !== "board" || communityType !== "desc") {
      throw new Error("Community name is not valid");
    }
    if (communityType === "board") {
      await deletePost({
        board: communityName,
        post: itemId,
      }).unwrap();
    } else if (communityName === "desc") {
      await deleteTest({
        desc: communityName,
        test: itemId,
      }).unwrap();
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
    />
  );
};

export default DeletePostModal;
