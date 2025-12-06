import React, { useState, useEffect, useMemo } from "react";
import { FaUsers, FaFileAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import RelativeTime from "../../../components/RelativeTime";
import { Link, useNavigate } from "react-router-dom";
import {
  useSubscribeToDescMutation,
  useUnsubscribeFromDescMutation,
} from "../../../services/descSubscriptionsApi";
import { useSelector } from "react-redux";
import Toast from "../../../components/Toast";
import { getFileUrl, getInitials } from "../../../utils";

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

const DescHeader = ({ desc, isSubscribed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const avatarUrl = useMemo(
    () => (desc?.avatar ? getFileUrl(desc?.avatar?.file_hash) : null),
    [desc]
  );
  const bannerUrl = useMemo(
    () => (desc?.banner ? getFileUrl(desc?.banner?.file_hash) : null),
    [desc]
  );

  const [subscribeToDesc, { isLoading: isSubscribing, error: subscribeError }] =
    useSubscribeToDescMutation();
  const [
    unsubscribeFromDesc,
    { isLoading: isUnsubscribing, error: unsubscribeError },
  ] = useUnsubscribeFromDescMutation();

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
      await subscribeToDesc({ desc: desc.name }).unwrap();
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
      await unsubscribeFromDesc({ desc: desc.name }).unwrap();
    } catch (error) {
      // Error will be handled by useEffect above
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6 overflow-hidden">
      {/* Cover Image */}
      <div className="flex flex-col">
        <div className="relative h-20 sm:h-32">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Desc banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 opacity-100 transition-opacity flex items-center justify-center"></div>
          )}
        </div>

        {/* Mobile Layout (< sm) */}
        <div className="sm:hidden relative px-4">
          <div className="flex justify-between items-start -mt-8 mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Desc avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center text-white font-black text-xl justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                  {getInitials(desc.name)}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            d/{desc.name}
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

        {/* Desktop Layout (>= sm) */}
        <div className="hidden sm:block relative">
          <div className="absolute -top-14 left-2 right-2 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-white group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Desc avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center text-white font-black text-3xl justify-center bg-gradient-to-br from-purple-500 to-pink-600 transition-all">
                    {getInitials(desc.name)}
                  </div>
                )}
              </div>
              <h1 className="text-xl lg:text-3xl font-bold text-neutral-900 whitespace-nowrap">
                d/{desc.name}
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
            <FaUsers className="text-purple-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {desc.subscribers_count?.toLocaleString() || 0}
            </span>
            <span className="text-neutral-500 hidden sm:inline">
              {desc.subscribers_count === 1 ? "subscriber" : "subscribers"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaFileAlt className="text-purple-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {desc.tests_count?.toLocaleString() || 0}
            </span>
            <span className="text-neutral-500 hidden sm:inline">
              {desc.tests_count === 1 ? "test" : "tests"}
            </span>
          </div>
        </div>

        {/* Expandable About Section */}
        <div>
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors group"
          >
            <span>About this desc</span>
            <FiChevronDown
              className={`text-lg transition-transform duration-200 text-neutral-400 group-hover:text-purple-600 ${
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
                <span className="text-neutral-600">
                  {desc.description || "No description provided."}
                </span>
              </div>
              {desc.author && (
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <span className="font-semibold text-neutral-900">
                    Author:
                  </span>
                  <Link
                    to={`/user/${desc.author.username}`}
                    className="hover:underline hover:text-purple-600 cursor-pointer transition-colors"
                  >
                    u/{desc.author.username}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-neutral-600">
                <span className="font-semibold text-neutral-900">Created:</span>
                <RelativeTime date={desc.created_at} />
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
    </div>
  );
};

export default DescHeader;
