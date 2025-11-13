import { useState, useEffect, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi";

const useSortBy = (isAuthenticated, username = undefined) => {
  // we now can add/edit/remove sorting options, by simply modifying this array
  const sortOptionsConfig = useMemo(
    () => [
      {
        id: "latest=1",
        label: "Latest",
        requiresAuth: false,
        emptyStateTitle: "No posts yet",
        emptyStateMessage: "Be the first to share something in this board!",
      },
      {
        id: "oldest=1",
        label: "Oldest",
        requiresAuth: false,
        emptyStateTitle: "No posts yet",
        emptyStateMessage: "Be the first to share something in this board!",
      },
      {
        id: "popular=1",
        label: "Popular",
        requiresAuth: false,
        emptyStateTitle: "No posts yet",
        emptyStateMessage: "Be the first to share something in this board!",
      },
      {
        id: "random=1",
        label: "Random",
        requiresAuth: false,
        emptyStateTitle: "No posts yet",
        emptyStateMessage: "Be the first to share something in this board!",
      },
      {
        id: "author=",
        label: "My Posts",
        requiresAuth: true,
        emptyStateTitle: "No posts from you yet",
        emptyStateMessage: "Start sharing your thoughts!",
      },
    ],
    []
  );

  // Sorting/Filtering State
  const [sortBy, setSortBy] = useState(sortOptionsConfig[0].id);
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
  const handleSortChange = (sortType) => {
    if (sortType == "author=" && isAuthenticated && username) {
      setSortBy(sortType+username);
    } else{
      setSortBy(sortType)
    }
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
                onClick={() => handleSortChange(option.id)}
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

  return { sortBy, SortByComponent, emptyStateMessages };
};

export default useSortBy;
