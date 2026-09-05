import React, { useState, useEffect, useMemo } from "react";
import { Users, FileText, Heart, ChevronDown, Crown } from "lucide-react";
import RelativeTime from "./RelativeTime";
import { Link, useNavigate } from "react-router-dom";
import {
  useSubscribeToBoardMutation,
  useUnsubscribeFromBoardMutation,
} from "../services/boardSubscriptionsApi";
import { useSelector } from "react-redux";
import Toast from "./Toast";
import BoardMenu from "../routes/user/components/BoardMenu";
import DeleteBoardModal from "../routes/user/components/DeleteBoardModal";
import ReportModal from "../routes/user/components/ReportModal";
import { getFileUrl } from "../utils";
import MarkdownViewer from "./markdownViewer/MarkdownViewer";
import CommunityAvatar from "./CommunityAvatar";

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
  const { profileData } = useSelector((state) => state.myProfile);
  const navigate = useNavigate();
  const bannerUrl = useMemo(
    () => (board?.banner ? getFileUrl(board?.banner?.file_hash) : null),
    [board],
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
    if (profileData?.id === board.author.id) return;
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
    if (profileData?.id === board.author.id) return;
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
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 mb-6 overflow-hidden">
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
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-white dark:border-neutral-900 dark:bg-neutral-900">
              <CommunityAvatar
                hash={board?.avatar?.file_hash}
                name={board.name}
                alt="Board avatar"
              />
            </div>
          </div>

          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            b/{board.name}
          </h1>

          <div
            className={`flex w-full items-center justify-center rounded-lg border overflow-hidden ${
              isSubscribed
                ? "border-red-500 dark:border-neutral-100"
                : "border-primary-blue dark:border-neutral-100"
            }
            ${(isSubscribing || isUnsubscribing) && "animate-pulse"}
            `}
          >
            {isSubscribed ? (
              <button
                className="w-full px-5 py-2.5 bg-white dark:bg-neutral-900 text-red-500 dark:text-neutral-100 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-red-500/10 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 dark:hover:font-bold"
                onClick={onUnSubscribe}
                disabled={isUnsubscribing}
              >
                <span>Joined</span>
              </button>
            ) : (
              <button
                className="w-full px-5 py-2.5 bg-white dark:bg-neutral-100 text-primary-blue dark:text-neutral-900 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-primary-blue/10 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:hover:font-bold"
                onClick={onSubscribe}
                disabled={isSubscribing}
              >
                <span>Join</span>
              </button>
            )}
          </div>
        </div>
        <div className="hidden sm:block relative">
          <div className="absolute -top-14 left-2 right-2 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-white dark:bg-neutral-900 dark:border-neutral-900 group">
                <CommunityAvatar
                  hash={board?.avatar?.file_hash}
                  name={board.name}
                  alt="Board avatar"
                  sizeClassName="font-black text-3xl"
                />
              </div>
              <h1 className="text-lg lg:text-xl xl::text-3xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                b/{board.name}
              </h1>
            </div>
            {profileData?.id !== board.author.id && (
              <div
                className={`flex w-fit items-center justify-center rounded-full border overflow-hidden ${
                  isSubscribed
                    ? "border-red-500 dark:border-neutral-100"
                    : "border-primary-blue dark:border-neutral-100"
                }
              ${(isSubscribing || isUnsubscribing) && "animate-pulse"}
              `}
              >
                {isSubscribed ? (
                  <button
                    className="px-5 py-2.5 bg-white dark:bg-neutral-900 text-red-500 dark:text-neutral-100 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-red-500/10 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
                    onClick={onUnSubscribe}
                    disabled={isUnsubscribing}
                  >
                    <span>Joined</span>
                  </button>
                ) : (
                  <button
                    className="px-5 py-2.5 bg-white dark:bg-neutral-100 text-primary-blue dark:text-neutral-900 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-primary-blue/10 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                    onClick={onSubscribe}
                    disabled={isSubscribing}
                  >
                    <span>Join</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="h-14" />
        </div>
      </div>
      <div className="p-6">
        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 text-sm">
            <Users className="text-blue-600 text-base" />
            <span className="text-neutral-700 dark:text-neutral-200 font-medium">
              {board.subscribers_count.toLocaleString()}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              {board.subscribers_count === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="text-blue-600 text-base" />
            <span className="text-neutral-700 dark:text-neutral-200 font-medium">
              {board.posts_count.toLocaleString()}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              {board.posts_count === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>

        {/* Expandable About Section */}
        <div>
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-neutral-700 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors group cursor-pointer"
          >
            <span>About this board</span>
            <ChevronDown
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
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Description:{" "}
                </span>
                <MarkdownViewer>
                  {board.description || "No description provided."}
                </MarkdownViewer>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Author:
                </span>
                <Link
                  to={`/u/${board.author.username}`}
                  className="hover:underline hover:text-blue-600 cursor-pointer transition-colors"
                >
                  u/{board.author.username}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Created:
                </span>
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
