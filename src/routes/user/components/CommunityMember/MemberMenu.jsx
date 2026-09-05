import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

const MemberMenu = ({ member, onBlockUser, isUserBlocked = false }) => {
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
      action(member);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all focus:outline-none focus:bg-gray-100"
        aria-label="Member options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[140px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
         {isUserBlocked? <button
            onClick={(e) => handleMenuAction(e, onBlockUser)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Unblock user
          </button>:
          <button
            onClick={(e) => handleMenuAction(e, onBlockUser)}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-gray-50 transition-colors"
          >
            Block user
          </button>}
        </div>
      )}
    </div>
  );
};

export default MemberMenu;
