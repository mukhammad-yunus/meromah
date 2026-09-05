import React, { useState, forwardRef } from "react";

const HomeSortBy = forwardRef(({ SortByComponent, type, setType }, ref) => {

  return (
    <div ref={ref} className="flex items-center justify-between virtual-item-padding-x pt-3 pb-3.5 mb-4 md:mb-6 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex gap-8">
        <button
          onClick={() => setType("posts")}
          className={`pb-3 text-sm font-medium transition-all duration-200 relative cursor-pointer ${
            type === "posts"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Posts
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-neutral-100 transition-all duration-200 ${
            type === "posts" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
        </button>
        <button
          onClick={() => setType("tests")}
          className={`pb-3 text-sm font-medium transition-all duration-200 relative cursor-pointer ${
            type === "tests"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Tests
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-neutral-100 transition-all duration-200 ${
            type === "tests" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
        </button>
      </div>
      <div className="relative">
        <SortByComponent />
      </div>
    </div>
  );
});

export default HomeSortBy;