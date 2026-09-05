import React from "react";
import CommunitySkeleton from "./CommunitySkeleton";

const ExploreCommunitySkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
      </div>
      <div className="space-y-3">
        {Array(5).fill(0).map((i) => (
          <CommunitySkeleton key={i}/>
        ))}
      </div>
    </div>
  );
};

export default ExploreCommunitySkeleton;
