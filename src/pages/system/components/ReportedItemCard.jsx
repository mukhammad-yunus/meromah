import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetReportByIdQuery } from "../../../services/reportsApi";
import { AlertCircle, Ban, Calendar, CheckCircle, Clock, Edit3, ExternalLink, FileText, HelpCircle, MessageSquare, Shield, Trash2, User, Users, XCircle } from "lucide-react";
import RelativeTime from "../../../components/RelativeTime";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";
import UserAvatar from "../../../components/UserAvatar";

const getStatusIcon = (status) => {
  switch (status) {
    case "open":
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    case "in_review":
      return <Clock className="w-4 h-4 text-blue-500" />;
    case "resolved":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "removed":
      return <Trash2 className="w-4 h-4 text-red-500" />;
    case "warned":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "banned":
      return <Ban className="w-4 h-4 text-red-600" />;
    case "no_action":
      return <XCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700";
    case "in_review":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700";
    case "resolved":
      return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700";
    case "removed":
      return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
    case "warned":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    case "banned":
      return "bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-400 dark:border-red-600";
    case "no_action":
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700";
  }
};

const getTargetTypeIcon = (type) => {
  switch (type) {
    case "post":
      return <FileText className="w-4 h-4" />;
    case "comment":
      return <MessageSquare className="w-4 h-4" />;
    case "user":
      return <User className="w-4 h-4" />;
    case "board":
      return <Users className="w-4 h-4" />;
    case "desc":
      return <Users className="w-4 h-4" />;
    case "test":
      return <HelpCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};
const ReportedItemCard = ({ report, onUpdateReport }) => {
  const navigate = useNavigate();
  const { target_type, target_id } = report;
  const [itemData, setItemData] = useState(report?.target??{});
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [itemError, setItemError] = useState(null);

  useEffect(() => {
    // Check if full report data includes the target item
    if (report?.target) {
      setItemData(report?.target);
    }
  }, [report]);

  const getItemUrl = () => {
    if (!target_id) return null;

    switch (target_type) {
      case "user":
        // For users, we need username - if not in data, can't navigate
        if (itemData?.username) return `/u/${itemData.username}`;
        return null;
      case "board":
        // For boards, we need board name
        if (itemData?.name) return `/b/${itemData.name}`;
        return null;
      case "desc":
        // For descs, we need desc name
        if (itemData?.name) return `/d/${itemData.name}`;
        return null;
      case "post":
        // For posts, we need board name and post ID
        if (itemData?.board?.name)
          return `/b/${itemData.board.name}/post/${target_id}`;
        return null;
      case "test":
        // For tests, we need desc name and test ID
        if (itemData?.desc?.name)
          return `/d/${itemData.desc.name}/test/${target_id}`;
        return null;
      case "comment":
        // For comments, we need board/post or desc/test context
        if (itemData?.board?.name && itemData?.post?.id) {
          return `/b/${itemData.board.name}/post/${itemData.post.id}`;
        }
        if (itemData?.desc?.name && itemData?.test?.id) {
          return `/d/${itemData.desc.name}/test/${itemData.test.id}`;
        }
        return null;
      default:
        return null;
    }
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    const url = getItemUrl();
    if (url) {
      navigate(url);
    }
  };

  const itemUrl = getItemUrl();

  return (
    <div
      key={report.id}
      className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Report Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Report ID: {report.id}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                report.status
              )}`}
            >
              {getStatusIcon(report.status)}
              {report.status}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600">
              {getTargetTypeIcon(report.target_type)}
              {report.target_type}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <RelativeTime date={report.created_at} />
            </span>
            {report.reporter && (
              <Link
                to={`/u/${report.reporter.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Reporter: {report.reporter.username || "Unknown"}
              </Link>
            )}
            {report.action_author && (
              <Link
                to={`/u/${report.action_author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                Action by: {report.action_author.username || "Unknown"}
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={() => onUpdateReport(report)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          Update
        </button>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <h3 className="text-sm lg:text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          Reason:
        </h3>
        <p className="text-xs lg:text-sm text-neutral-900 dark:text-neutral-100">
          {report.reason}
        </p>
      </div>

      {/* Action Note */}
      {report.action_note && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
            Action Note:
          </h3>
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {report.action_note}
          </p>
        </div>
      )}

      <div
        className={`mt-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
          itemUrl
            ? "hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors"
            : ""
        }`}
        onClick={itemUrl ? handleItemClick : undefined}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getTargetTypeIcon(target_type)}
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize">
              {target_type}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-500">
              ID: {target_id}
            </span>
          </div>
          {itemUrl && (
            <ExternalLink className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          )}
        </div>

        {/* Display item data if available */}
        {itemData ? (
          <div className="space-y-2">
            {target_type === "user" && (
              <div className="flex items-center gap-3">
                <UserAvatar
                  hash={itemData.avatar?.file_hash}
                  alt={itemData.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    u/{itemData.username}
                  </p>
                  {itemData.name && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {itemData.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {target_type === "board" && (
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  b/{itemData.name}
                </p>
                {itemData.description && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    <MarkdownViewer>{itemData.description}</MarkdownViewer>
                  </div>
                )}
              </div>
            )}

            {target_type === "desc" && (
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  d/{itemData.name}
                </p>
                {itemData.description && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    <MarkdownViewer>{itemData.description}</MarkdownViewer>
                  </div>
                )}
              </div>
            )}

            {target_type === "post" && (
              <div>
                {itemData.author && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    by u/{itemData.author.username}
                  </p>
                )}
                {itemData.title && (
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {itemData.title}
                  </p>
                )}
                {itemData.body && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    <MarkdownViewer>{itemData.body}</MarkdownViewer>
                  </div>
                )}
              </div>
            )}

            {target_type === "test" && (
              <div>
                {itemData.author && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    by u/{itemData.author.username}
                  </p>
                )}
                {itemData.title && (
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {itemData.title}
                  </p>
                )}
                {itemData.description && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    <MarkdownViewer>{itemData.description}</MarkdownViewer>
                  </div>
                )}
              </div>
            )}

            {target_type === "comment" && (
              <div>
                {itemData.author && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    by u/{itemData.author.username}
                  </p>
                )}
                {itemData.body && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    <MarkdownViewer>{itemData.body}</MarkdownViewer>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {target_type === "post" && "Post content not available"}
              {target_type === "comment" && "Comment content not available"}
              {target_type === "user" && "User information not available"}
              {target_type === "board" && "Board information not available"}
              {target_type === "desc" && "Desc information not available"}
              {target_type === "test" && "Test information not available"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Click to view item details (if available)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportedItemCard;
