import React, { useEffect } from "react";
import { X } from "lucide-react";

const BlockUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  isProcessing = false,
}) => {
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
      if (e.key === "Escape" && isOpen && !isProcessing) {
        handleClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isProcessing]);

  const handleClose = (e) => {
    e?.stopPropagation();
    if (!isProcessing) {
      onClose();
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing && member) {
      onConfirm(member);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 dark:bg-black/50 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-600 rounded-full p-1 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-red-500 dark:text-red-400">
              Block user
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2">
              Blocking <strong className="text-gray-700 dark:text-neutral-200">allows users to view</strong> content but prevents them from other
              community actions. Do you want to continue?
            </p>
            {member && (
              <p className="text-sm text-gray-700 dark:text-neutral-200 mt-3 font-medium">
                User: <span className="text-gray-900 dark:text-neutral-100">u/{member.username}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-500 dark:hover:bg-red-800 disabled:bg-gray-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal;

