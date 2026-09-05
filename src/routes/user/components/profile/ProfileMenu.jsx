import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileMenu = ({ isMyProfile, onReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

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

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    navigate("/profile/edit");
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onReport();
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label="Profile options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-50 min-w-[160px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isMyProfile ? (
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 cursor-pointer"
            >
              Report user
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
