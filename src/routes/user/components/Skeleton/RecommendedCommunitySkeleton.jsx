import React from 'react'

const RecommendedCommunitySkeleton = ({ count = 5, isExplorePage = false }) => {
  return (
    <div
      className={
        isExplorePage
          ? ""
          : "bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4"
      }
    >
      <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-3" />
      <div
        className={
          isExplorePage
            ? "flex flex-col sm:flex-row items-center gap-2 p-4 overflow-x-scroll"
            : "space-y-3"
        }
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={
              isExplorePage
                ? "flex flex-col gap-3 flex-1 bg-white dark:bg-neutral-900 w-full md:min-w-1/3 md:max-w-1/2 p-4 border border-neutral-100 dark:border-neutral-700 rounded-lg shadow"
                : "flex items-start justify-between gap-3 p-2 rounded-lg"
            }
          >
            <div className="flex-1 min-w-0 w-full">
              {/* Community name skeleton */}
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2 w-24" />
              
              {/* Description skeleton */}
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2 w-full" />
              
              {/* Members count skeleton */}
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-20 mt-1" />
            </div>
            
            {/* Join button skeleton */}
            <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCommunitySkeleton

