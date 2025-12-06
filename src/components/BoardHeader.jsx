import React, { useState, useEffect, useMemo } from "react";
import { FaUsers, FaFileAlt, FaHeart } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { LiaCrownSolid } from "react-icons/lia";
import RelativeTime from "./RelativeTime";
import { Link, useNavigate } from "react-router-dom";
import {
  useSubscribeToBoardMutation,
  useUnsubscribeFromBoardMutation,
} from "../services/boardSubscriptionsApi";
import { useSelector } from "react-redux";
import Toast from "./Toast";
import BoardMenu from "../pages/user/components/BoardMenu";
import DeleteBoardModal from "../pages/user/components/DeleteBoardModal";
import ReportModal from "../pages/user/components/ReportModal";
import { getFileUrl, getInitials } from "../utils";

// Helper function to extract error message from API error response
const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  if (typeof error === "string") return error;
  return (
    error.data?.message ??
    error.data?.error ??
    error.message ??
    error.error ??
    error.response?.data?.message ??
    "An unexpected error occurred. Please try again."
  );
};

const BoardHeader = ({ board, isSubscribed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const avatarUrl = useMemo(
    () => (board?.avatar ? getFileUrl(board?.avatar?.file_hash) : null),
    [board]
  );
  const bannerUrl = useMemo(
    () => (board?.banner ? getFileUrl(board?.banner?.file_hash) : null),
    [board]
  );
  const [
    subscribeToBoard,
    { isLoading: isSubscribing, error: subscribeError },
  ] = useSubscribeToBoardMutation();
  const [
    unsubscribeFromBoard,
    { isLoading: isUnsubscribing, error: unsubscribeError },
  ] = useUnsubscribeFromBoardMutation();

  // Handle subscription errors
  useEffect(() => {
    if (subscribeError) {
      setToast({
        message: extractErrorMessage(subscribeError),
        type: "error",
      });
    }
  }, [subscribeError]);

  useEffect(() => {
    if (unsubscribeError) {
      setToast({
        message: extractErrorMessage(unsubscribeError),
        type: "error",
      });
    }
  }, [unsubscribeError]);

  const onSubscribe = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await subscribeToBoard({ board: board.name }).unwrap();
    } catch (error) {
      // Error will be handled by useEffect above
    }
  };
  const onUnSubscribe = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await unsubscribeFromBoard({ board: board.name }).unwrap();
    } catch (error) {
      // Error will be handled by useEffect above
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleDeleteSuccess = () => {
    navigate("/b/all");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6 overflow-hidden">
      {/* Cover Image */}
      <div className="flex flex-col">
        <div className="relative h-20 sm:h-32">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Board banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 opacity-100 transition-opacity flex items-center justify-center"></div>
          )}
          <BoardMenu
            board={board}
            onDelete={handleDelete}
            onReport={handleReport}
            className="pr-2 pt-2 z-50 top-2 right-2"
          />
        </div>

        {/* Mobile Layout (< sm) */}
        <div className="sm:hidden relative px-4">
          <div className="flex justify-between items-start -mt-8 mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Board avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center text-white font-black text-xl justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  {getInitials(board.name)}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            b/{board.name}
          </h1>

          <div
            className={`flex w-full items-center justify-center rounded-lg border ${
              isSubscribed
                ? "border-red-500"
                : "bg-primary-blue hover:bg-blue-700 border-primary-blue hover:border-blue-700"
            }
            ${(isSubscribing || isUnsubscribing) && "animate-pulse"}
            `}
          >
            {isSubscribed ? (
              <button
                className="w-full px-5 py-2.5 text-red-500 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                onClick={onUnSubscribe}
                disabled={isUnsubscribing}
              >
                <span>Unsubscribe</span>
              </button>
            ) : (
              <button
                className="w-full px-5 py-2.5 text-white active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                onClick={onSubscribe}
                disabled={isSubscribing}
              >
                <span>Subscribe</span>
              </button>
            )}
          </div>
        </div>
        <div className="hidden sm:block relative">
          <div className="absolute -top-14 left-2 right-2 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-white group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Board avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center text-white font-black text-3xl justify-center bg-gradient-to-br from-blue-500 to-purple-600 transition-all">
                    {getInitials(board.name)}
                  </div>
                )}
              </div>
              <h1 className="text-lg lg:text-xl xl::text-3xl font-bold text-neutral-900 whitespace-nowrap">
                b/{board.name}
              </h1>
            </div>
            <div
              className={`flex w-fit items-center justify-center rounded-full border ${
                isSubscribed
                  ? "border-red-500"
                  : "bg-primary-blue hover:bg-blue-700 border-primary-blue hover:border-blue-700"
              }
              ${(isSubscribing || isUnsubscribing) && "animate-pulse"}
              `}
            >
              {isSubscribed ? (
                <button
                  className="px-5 py-2.5 text-red-500 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                  onClick={onUnSubscribe}
                  disabled={isUnsubscribing}
                >
                  <span>Joined</span>
                </button>
              ) : (
                <button
                  className="px-5 py-2.5 text-white active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                  onClick={onSubscribe}
                  disabled={isSubscribing}
                >
                  <span>Join</span>
                </button>
              )}
            </div>
          </div>
          <div className="h-14" />
        </div>
      </div>
      <div className="p-6">
        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm">
            <FaUsers className="text-blue-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {board.subscribers_count.toLocaleString()}
            </span>
            <span className="text-neutral-500 hidden sm:inline">
              {board.subscribers_count === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaFileAlt className="text-blue-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {board.posts_count.toLocaleString()}
            </span>
            <span className="text-neutral-500 hidden sm:inline">
              {board.posts_count === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>

        {/* Expandable About Section */}
        <div>
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors group"
          >
            <span>About this board</span>
            <FiChevronDown
              className={`text-lg transition-transform duration-200 text-neutral-400 group-hover:text-blue-600 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-neutral-900">
                  Description:{" "}
                </span>
                <span className="text-neutral-600">{board.description}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600">
                <span className="font-semibold text-neutral-900">Author:</span>
                <Link
                  to={`/user/${board.author.username}`}
                  className="hover:underline hover:text-blue-600 cursor-pointer transition-colors"
                >
                  u/{board.author.username}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600">
                <span className="font-semibold text-neutral-900">Created:</span>
                <RelativeTime date={board.created_at} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Board Modal */}
      <DeleteBoardModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        board={board}
        onSuccess={handleDeleteSuccess}
      />

      {/* Report Board Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        item={board}
        itemType="board"
      />
    </div>
  );
};

export default BoardHeader;
