import React from "react";

const CommunitySkeleton = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-20 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default CommunitySkeleton;
