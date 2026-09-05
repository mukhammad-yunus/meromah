import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BoardMenu = ({ board, onDelete, onReport, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { profileData } = useSelector((state) => state.myProfile);
  const navigate = useNavigate();

  // Check if current user is the board author
  const isAuthor =
    profileData &&
    (profileData.id === board.author_id ||
      profileData.username === board.author?.username ||
      profileData.id === board.author?.id);

  // Check if current user has privileges
  const hasPrivileges = profileData && profileData?.has_privileges;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (action) {
      action(e);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    navigate(`/b/${board.name}/edit`, { replace: true });
  };

  return (
    <div className={`absolute ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-full hover:bg-neutral-100 text-white hover:text-neutral-900 dark:text-neutral-100 transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label="Board options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50 min-w-[160px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthor ? (
            <>
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
              >
                Edit board
              </button>
              <button
                onClick={() => navigate(`/b/${board.name}/members`)}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
              >
                Board members
              </button>
              <button
                onClick={(e) => handleMenuAction(e, onDelete)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-600 dark:hover:text-neutral-100 transition-colors duration-150 cursor-pointer"
              >
                Delete board
              </button>
            </>
          ) : hasPrivileges ? (
            <>
              <button
                onClick={(e) => handleMenuAction(e, onDelete)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-600 dark:hover:text-neutral-100 transition-colors duration-150 cursor-pointer"
              >
                Delete board
              </button>
              <button
                onClick={(e) => handleMenuAction(e, onReport)}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
              >
                Report board
              </button>
            </>
          ) : (
            <button
              onClick={(e) => handleMenuAction(e, onReport)}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              Report board
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardMenu;
