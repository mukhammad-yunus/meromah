import React, { useState } from "react";
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

const BoardHeader = ({ board }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [subscribeToBoard, { isLoading: isSubscribing }] =
    useSubscribeToBoardMutation();
  const [unsubscribeFromBoard, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromBoardMutation();
  const onSubscribe = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await subscribeToBoard({ board: board.name }).unwrap();
  };
  const onUnSubscribe = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await unsubscribeFromBoard({ board: board.name }).unwrap();
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
        {/* After backend has an image, I can uncomment or fix below code */}
        {/* <img
      src={board.coverImage}
      alt={`${board.name} cover`}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div> */}
      </div>

      {/* Board Info */}
      <div className="p-6">
        {/* Board Name and Join Button */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h1 className="text-3xl font-bold text-neutral-900">
            b/{board.name}
          </h1>
          <div
            className={`flex items-center gap-2  rounded-lg border ${
              board.youSubscribed
                ? "border-red-500"
                : "bg-primary-blue  hover:bg-blue-700 border-primary-blue hover:border-blue-700"
            }
            ${(isSubscribing || isUnsubscribing) && "animate-pulse"}
            `}
          >
            {board.youSubscribed ? (
              <button
                className="px-5 py-2.5 text-red-500 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                onClick={onUnSubscribe}
                disabled={isUnsubscribing}
              >
                <span>Unsubscribe</span>
              </button>
            ) : (
              <button
                className="px-5 py-2.5 text-white active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                onClick={onSubscribe}
                disabled={isSubscribing}
              >
                <span>Subscribe</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm">
            <FaUsers className="text-blue-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {board.subscribers_count.toLocaleString()}
            </span>
            <span className="text-neutral-500">
              {board.subscribers_count === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaFileAlt className="text-blue-600 text-base" />
            <span className="text-neutral-700 font-medium">
              {board.posts_count.toLocaleString()}
            </span>
            <span className="text-neutral-500">
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
    </div>
  );
};

export default BoardHeader;
