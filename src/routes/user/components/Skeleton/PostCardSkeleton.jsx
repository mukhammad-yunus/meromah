import React from "react";

const PostCardSkeleton = ({isFirst, isLast}) => {
  return (
    <div
      className={`block bg-white dark:bg-neutral-900 border-x border-b border-neutral-200 dark:border-neutral-700 p-4 ${
        isFirst ? "rounded-t-lg border-t" : isLast ? "rounded-b-lg" : ""
      }`}
    >
      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse shrink-0"></div>

          {/* User + Community Skeleton */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Title */}
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-1"></div>
        {/* Body Lines */}
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
