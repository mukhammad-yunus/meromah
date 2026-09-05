import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ErrorDisplay from "../../../components/ErrorDisplay";
import { useDispatch } from 'react-redux'
import { removeItem } from "../../../app/homeFeedSlice";
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  itemType = "item",
  onSuccess,
  errorTitle,
  itemId
}) => {
  const dispatch = useDispatch();
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
        handleClose(e)
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
      await onConfirm();
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose(e);
      }, 500);
      if (itemType === "post" || itemType ==="test") {
        dispatch(removeItem({itemType, itemId}))
      }
    } catch (err) {
      console.error(`Failed to delete ${itemType}:`, err);
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

  const getItemTypeLabel = () => {
    const labels = {
      post: "post",
      comment: "comment",
      user: "user",
      board: "board",
    };
    return labels[itemType] || itemType;
  };

  const itemTypeLabel = getItemTypeLabel();
  const defaultErrorTitle = errorTitle || `Failed to delete ${itemTypeLabel}`;
  const capitalizedItemType =
    itemTypeLabel.charAt(0).toUpperCase() + itemTypeLabel.slice(1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600 rounded-full p-1 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Success Message */}
        {success ? (
          <div className="p-6 my-8">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {capitalizedItemType} deleted successfully.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay error={error} title={defaultErrorTitle} />
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Delete {itemTypeLabel}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                This action cannot be undone. The {itemTypeLabel} will be
                permanently removed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
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

export default DeleteModal;

