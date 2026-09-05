import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const PreviewActionsMenu = ({
  onPreview,
  onEdit,
  onRemove,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
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
      action();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 cursor-pointer"
        aria-label="Comment options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-50 min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={(e) => handleMenuAction(e, onEdit)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              Edit
            </button>
          )}
          {onPreview && (
            <button
              type="button"
              onClick={(e) => handleMenuAction(e, onPreview)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              Preview
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => handleMenuAction(e, onRemove)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewActionsMenu;
