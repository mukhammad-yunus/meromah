import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const HomeSortBy = ({
  labelByType,
  labelByTime,
  SortByTypeComponent,
  SortByTimeComponent,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowSortDropdown(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSortDropdown]);

  useEffect(() => {
    setShowSortDropdown(false);
  }, [labelByTime, labelByType]);

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-neutral-900 cursor-pointer select-none" onClick={() => setShowSortDropdown(!showSortDropdown)}>{labelByType}</h2>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50"
        >
          <span>{labelByTime}</span>
          <FiChevronDown
            className={`w-4 h-4 transition-transform ${
              showSortDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showSortDropdown && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-3 space-y-3">
              <div>
                <div className="text-xs text-neutral-500 mb-2">Type</div>
                <SortByTypeComponent />
              </div>
              
              <div className="border-t border-neutral-200" />
              
              <div>
                <div className="text-xs text-neutral-500 mb-2">Sort by</div>
                <SortByTimeComponent />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSortBy;