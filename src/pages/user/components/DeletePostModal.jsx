import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useDeletePostMutation } from "../../../services/postsApi";
import ErrorDisplay from "../../../components/ErrorDisplay";

const DeletePostModal = ({
  isOpen,
  onClose,
  board,
  postId,
}) => {
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isDeleting]);
  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSuccess(false);
    try {
      await deletePost({
        board,
        post: postId,
      }).unwrap();
      setSuccess(true);
      setTimeout(() => {
        onClose(e);
      }, 3000);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError(err);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (!isDeleting) {
      setError(null);
      setSuccess(false);
      onClose(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        {/* Success Message */}
        {success ? (
          <div className="p-6 my-8">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Post deleted successfully.</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay error={error} title="Failed to delete post" />
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delete post</h2>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. The post will be permanently
                removed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletePostModal;
