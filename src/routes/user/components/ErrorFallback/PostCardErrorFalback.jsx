import React from "react";
import { AlertCircle } from "lucide-react";

const PostCardErrorFallback = ({
  error,
  resetErrorBoundary,
  isFirst,
  isLast,
}) => {
  return (
    <div
      className={`block bg-white dark:bg-neutral-900 border-x border-b border-gray-200 dark:border-neutral-700 p-4 transition-colors duration-200 ${
        isFirst ? "rounded-t-lg border-t" : isLast ? "rounded-b-lg" : ""
      }`}
    >
      {/* Header - matches PostCard structure */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Error Icon instead of Avatar */}
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
          </div>

          {/* Error Message */}
          <div className="max-w-52 sm:max-w-full flex flex-col gap-0.5">
            <span className="text-primary-blue dark:text-neutral-100 text-base">
              Error loading post
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              This post couldn't be displayed
            </p>
          </div>
        </div>
      </div>

      {/* Content - matches PostCard content structure */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="border-l-4 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900 p-3 rounded">
          <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Unable to display post
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            This post encountered an error and couldn't be rendered. Please try
            again or continue browsing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostCardErrorFallback;
