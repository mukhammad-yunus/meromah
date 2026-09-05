import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMakeReportMutation } from "../../../services/reportsApi";

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Inappropriate content",
  "Copyright violation",
  "Misinformation",
  "Other",
];

const ReportModal = ({ isOpen, onClose, item, itemType = "post" }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [makeReport, { isLoading, isSuccess, isUninitialized, data }] =
    useMakeReportMutation();
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

  const getItemTypeLabel = () => {
    const labels = {
      post: "post",
      comment: "comment",
      user: "user",
      board: "board",
      desc: "desc",
      test: "test",
    };
    return labels[itemType] || "item";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedReason) {
      return;
    }

    if (selectedReason === "Other" && !otherReason.trim()) {
      return;
    }
    // For now, just console.log as requested
    const reportData = {
      target_id: item?.id,
      target_type: itemType,
      reason: selectedReason === "Other" ? otherReason.trim() : selectedReason,
    };
    try {
      await makeReport({ body: reportData }).unwrap();
      setTimeout(() => {
        onClose(e);
        // Reset form
        setSelectedReason("");
        setOtherReason("");
      }, 5000);
    } catch (err) {
      console.error(err)
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (!isLoading) {
      onClose(e);
    }
  };

  const isOtherSelected = selectedReason === "Other";
  const itemTypeLabel = getItemTypeLabel();

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      {!isUninitialized && isSuccess && data?.message && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-600 rounded-full p-1 cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
              Report {itemTypeLabel}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">{data.message}</p>
          </div>
        </div>
      )}
      {!data?.message && (
        <div
          className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-600 rounded-full p-1 cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
              Report {itemTypeLabel}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              Help us understand what's wrong with this {itemTypeLabel}
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
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-neutral-200 flex-1">{reason}</span>
                </label>
              ))}
            </div>

            {/* Other reason text input */}
            {isOtherSelected && (
              <div className="mt-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                    Please provide more details
                  </span>
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
                    disabled={isLoading}
                    required={isOtherSelected}
                  />
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !selectedReason ||
                  (isOtherSelected && !otherReason.trim()) ||
                  isLoading
                }
                className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 disabled:bg-gray-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                {isLoading ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportModal;
