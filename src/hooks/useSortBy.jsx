import { useState, useEffect, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi";

const useSortBy = ({isAuthenticated, sortOptionsConfig}) => {
  // Sorting/Filtering State
  const [sortBy, setSortBy] = useState(sortOptionsConfig[0].id);
  const [label, setLabel] = useState(sortOptionsConfig[0].label)
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Get current sort option configuration
  const currentSortOption =
    sortOptionsConfig.find((option) => option.id === sortBy) ||
    sortOptionsConfig[0];

  // Get available sort options based on authentication
  const availableSortOptions = sortOptionsConfig.filter(
    (option) => !option.requiresAuth || isAuthenticated
  );

  // Reset sort option if current selection requires auth but user is not authenticated
  useEffect(() => {
    const currentOption = sortOptionsConfig.find(
      (option) => option.id === sortBy
    );
    if (currentOption?.requiresAuth && !isAuthenticated) {
      setSortBy(sortOptionsConfig[0].id);
    }
  }, [isAuthenticated, sortBy, sortOptionsConfig]);

  // Handle sorting/filtering
  const handleSortChange = ({sortType, label}) => {
    setSortBy(sortType)
    setLabel(label)
    setShowSortDropdown(false);
  };

  // Get empty state messages for current sort option
  const emptyStateMessages = useMemo(() => {
    const option =
      sortOptionsConfig.find((opt) => opt.id === sortBy) ||
      sortOptionsConfig[0];
    return {
      title: option.emptyStateTitle,
      message: option.emptyStateMessage,
    };
  }, [sortBy, sortOptionsConfig]);

  // SortByComponent
  const SortByComponent = () => (
    <div className="relative">
      <button
        onClick={() => setShowSortDropdown(!showSortDropdown)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <span>{currentSortOption.label}</span>
        <FiChevronDown
          className={`w-4 h-4 transition-transform ${
            showSortDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {showSortDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSortDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20">
            {availableSortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange({sortType: option.id, label: option.label})}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                  sortBy === option.id
                    ? "text-primary-blue font-medium bg-primary-blue/5"
                    : "text-neutral-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
  const resetSortBy = ()=> {
    setSortBy(sortOptionsConfig[0].id)
    setLabel(sortOptionsConfig[0].label)
    setShowSortDropdown(false)
  }
  return { sortBy, label, SortByComponent, emptyStateMessages, resetSortBy};
};

export default useSortBy;
