import React, { useState, useCallback } from "react";
import {
  useGetReportsQuery,
  useUpdateReportMutation,
  useGetReportByIdQuery,
} from "../../services/reportsApi";
import { useSelector } from "react-redux";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Users,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Shield,
  Edit3,
  Trash2,
  ExternalLink,
} from "lucide-react";
import RelativeTime from "../../components/RelativeTime";
import { getFileUrl, getInitials } from "../../utils";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";
import MarkdownViewer from "../../components/markdownViewer/MarkdownViewer";
import ReportedItemCard from "./components/ReportedItemCard";
import UpdateReportModal from "./components/UpdateReportModal";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "removed", label: "Removed" },
  { value: "warned", label: "Warned" },
  { value: "banned", label: "Banned" },
  { value: "no_action", label: "No Action" },
  { value: "other", label: "Other" },
];

const TARGET_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "post", label: "Post" },
  { value: "comment", label: "Comment" },
  { value: "user", label: "User" },
  { value: "board", label: "Board" },
  { value: "desc", label: "Desc" },
  { value: "test", label: "Test" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

const ReportsPage = () => {
  const { profileData } = useSelector((state) => state.myProfile);
  const [filters, setFilters] = useState({
    status: "",
    target_type: "",
    sort: "latest",
    page: 1,
    limit: 20,
    start_date: "",
    end_date: "",
    action_author: "",
    reporter: "",
  });
  const [queryParams, setQueryParams] = useState({})
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const applyQueryParams = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.target_type) params.target_type = filters.target_type;
    if (filters.sort) {
      if (filters.sort === "latest") params.latest = 1;
      if (filters.sort === "oldest") params.oldest = 1;
    }
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.action_author) params.action_author = filters.action_author;
    if (filters.reporter) params.reporter = filters.reporter;
    setQueryParams(params)
    setShowFilters(false)
  }, [filters]);

  const {
    data: reports,
    isLoading,
    error,
    refetch,
  } = useGetReportsQuery(queryParams);

  const handleUpdateReport = (report) => {
    setSelectedReport(report);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setToast({ message: "Report updated successfully", type: "success" });
    refetch();
  };

  const handleUpdateError = (error) => {
    setToast({
      message: error?.data?.message || "Failed to update report",
      type: "error",
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading reports:{" "}
            {error?.data?.message || error?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Reports Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage and review user reports
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium cursor-pointer"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showFilters && (
            <div className="">
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Target Type
                  </label>
                  <select
                    value={filters.target_type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        target_type: e.target.value,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TARGET_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Action Author (username)
                  </label>
                  <input
                    type="text"
                    value={filters.action_author}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        action_author: e.target.value,
                        page: 1,
                      }))
                    }
                    placeholder="Filter by action author..."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Reporter (username)
                  </label>
                  <input
                    type="text"
                    value={filters.reporter}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        reporter: e.target.value,
                        page: 1,
                      }))
                    }
                    placeholder="Filter by reporter..."
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Items Per Page
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        limit: parseInt(e.target.value),
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={()=> applyQueryParams()}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {Object.keys(reports).length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                No reports found matching your filters.
              </p>
            </div>
          ) : (
            Object.keys(reports).map((key) =>
              Object.values(reports[key]).map((report) => (
                <ReportedItemCard key={report.id} report={report} onUpdateReport={handleUpdateReport}/>
              ))
            )
          )}
        </div>

        {/* Pagination */}
        {/* {pagination.last_page > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.prev_page_url}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-neutral-700 dark:text-neutral-300">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.next_page_url}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )} */}

        {/* Update Modal */}
        <UpdateReportModal
          report={selectedReport}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedReport(null);
          }}
          onSuccess={handleUpdateSuccess}
          onError={handleUpdateError}
          statusOptions={STATUS_OPTIONS}
        />

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
