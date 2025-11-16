import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchBoardsQuery } from "../../../services/boardsApi";

const SearchBarButton = ({ board, onSelectBoard }) => {
  return (
    <button
      type="button"
      onClick={() => onSelectBoard(board)}
      className="w-full px-3 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
        {board.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-900">
          b/{board.name}
        </div>
        {board.description && (
          <div className="text-xs text-neutral-500 truncate">
            {board.description}
          </div>
        )}
        <div className="text-xs text-neutral-400 mt-0.5">
          {board.subscribers_count || 0} members • {board.posts_count || 0}{" "}
          posts
        </div>
      </div>
    </button>
  );
};

const BoardSelection = ({ onSelectBoard, onClearSelection, resetRef }) => {
  const boardSearchRef = useRef(null);
  const boardDropdownRef = useRef(null);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);

  // Search boards when boardSearchQuery has content
  const { data: boardsData, isLoading: isBoardsLoading } = useSearchBoardsQuery(
    boardSearchQuery.trim().length > 0
      ? { search: boardSearchQuery.trim() }
      : undefined,
    { skip: boardSearchQuery.trim().length === 0 }
  );
  // Expose reset function to parent via ref
  useEffect(() => {
    if (resetRef) {
      resetRef.current = () => {
        setBoardSearchQuery("");
        setShowBoardDropdown(false);
      };
    }
  }, [resetRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        boardDropdownRef.current &&
        !boardDropdownRef.current.contains(event.target) &&
        boardSearchRef.current &&
        !boardSearchRef.current.contains(event.target)
      ) {
        setShowBoardDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBoardSearch = (e) => {
    const query = e.target.value;
    setBoardSearchQuery(query);
    setShowBoardDropdown(query.trim().length > 0);

    // Reset selection if user clears the input
    if (query.trim().length === 0) {
      if (onClearSelection) {
        onClearSelection();
      }
    }
  };

  const handleSelectBoard = (board) => {
    if (onSelectBoard) {
      onSelectBoard(board);
    }
    setBoardSearchQuery(`b/${board.name}`);
    setShowBoardDropdown(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-800">
        Select Board *
      </label>
      <div className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            ref={boardSearchRef}
            type="text"
            value={boardSearchQuery}
            onChange={handleBoardSearch}
            onFocus={() => {
              if (boardSearchQuery.trim() !== "") {
                setShowBoardDropdown(true);
              }
            }}
            placeholder="Search for a board..."
            className="w-full pl-10 pr-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
          />
        </div>
        {showBoardDropdown && (
          <div
            ref={boardDropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {isBoardsLoading && (
              <div className="p-3 text-sm text-neutral-500 text-center">
                Searching...
              </div>
            )}

            {!isBoardsLoading && (!boardsData || boardsData.length === 0) && (
              <div className="p-3 text-sm text-neutral-500 text-center">
                No board found
              </div>
            )}

            {!isBoardsLoading && boardsData && boardsData.length > 0 && (
              <div className="py-1">
                {boardsData.map((board) => (
                  <SearchBarButton
                    board={board}
                    onSelectBoard={handleSelectBoard}
                    key={board.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardSelection;
