import React from "react";
const tabs = ["Posts", "Tests", "Boards", "Descs"];
const SearchPageHeader = ({onSelect, activeTab, ref}) => {
  return (
    <div ref={ref} className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700">
      {/* Tabs */}
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`flex-1 px-4 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors relative ${
              activeTab === tab 
                ? "font-bold text-neutral-900 dark:text-neutral-100" 
                : "text-gray-500 dark:text-neutral-400"
            }`}
          >
            <span
              className={`block py-4 border-b-4 ${
                activeTab === tab 
                  ? "border-b-black dark:border-b-neutral-100" 
                  : "border-b-transparent"
              }`}
            >
              {tab}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchPageHeader;
