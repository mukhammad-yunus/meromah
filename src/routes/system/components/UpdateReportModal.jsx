import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useUpdateReportMutation } from '../../../services/reportsApi';

const UpdateReportModal = ({ report, isOpen, onClose, onSuccess, onError, statusOptions }) => {
  const { profileData } = useSelector((state) => state.myProfile);
  const [status, setStatus] = useState(report?.status || "");
  const [actionNote, setActionNote] = useState(report?.action_note || "");
  const [updateReport, { isLoading }] = useUpdateReportMutation();

  useEffect(() => {
    if (report) {
      setStatus(report.status || "");
      setActionNote(report.action_note || "");
    }
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateReport({
        id: report.id,
        body: {
          status,
          action_note: actionNote.trim() || "No Action Note",
          action_author_id: profileData?.id,
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update report:", error);
      if (onError) {
        onError(error);
      }
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Update Report #{report.id}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {statusOptions.filter(opt => opt.value).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Action Note
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add notes about the action taken..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !status}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {isLoading ? "Updating..." : "Update Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default UpdateReportModal