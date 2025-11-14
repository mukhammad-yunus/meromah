import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Inappropriate content",
  "Copyright violation",
  "Misinformation",
  "Other",
];

const ReportPostModal = ({ isOpen, onClose, post }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset form when closing
      setSelectedReason("");
      setOtherReason("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedReason) {
      return;
    }

    if (selectedReason === "Other" && !otherReason.trim()) {
      return;
    }

    setIsSubmitting(true);

    // For now, just console.log as requested
    const reportData = {
      postId: post?.id,
      reason: selectedReason,
      otherReason: selectedReason === "Other" ? otherReason.trim() : null,
    };

    console.log("Report submitted:", reportData);

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      onClose(e);
      // Reset form
      setSelectedReason("");
      setOtherReason("");
    }, 500);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (!isSubmitting) {
      onClose(e);
    }
  };

  const isOtherSelected = selectedReason === "Other";

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Report post</h2>
          <p className="text-sm text-gray-500 mt-1">
            Help us understand what's wrong with this post
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-3">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 flex-1">{reason}</span>
              </label>
            ))}
          </div>

          {/* Other reason text input */}
          {isOtherSelected && (
            <div className="mt-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Please provide more details
                </span>
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-gray-400"
                  disabled={isSubmitting}
                  required={isOtherSelected}
                />
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !selectedReason ||
                (isOtherSelected && !otherReason.trim()) ||
                isSubmitting
              }
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPostModal;

