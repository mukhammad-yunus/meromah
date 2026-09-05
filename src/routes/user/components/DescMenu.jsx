import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const DescMenu = ({ desc, onDelete, onReport, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { profileData } = useSelector((state) => state.myProfile);
  const navigate = useNavigate();

  const isAuthor =
    profileData &&
    (profileData.id === desc.author_id ||
      profileData.username === desc.author?.username ||
      profileData.id === desc.author?.id);

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
    setIsOpen((prev) => !prev);
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
    navigate(`/d/${desc.name}/edit`);
  };

  return (
    <div className={`absolute ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-full hover:bg-gray-100 text-white hover:text-gray-900 transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label="Desc options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthor ? (
            <>
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                Edit desc
              </button>
              <button
                onClick={() => navigate(`/d/${desc.name}/members`)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              >
                Desc members
              </button>
              <button
                onClick={(e) => handleMenuAction(e, onDelete)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              >
                Delete desc
              </button>
            </>
          ) : hasPrivileges ? (
            <>
              <button
                onClick={(e) => handleMenuAction(e, onDelete)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              >
                Delete desc
              </button>
              <button
                onClick={(e) => handleMenuAction(e, onReport)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                Report desc
              </button>
            </>
          ) : (
            <button
              onClick={(e) => handleMenuAction(e, onReport)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              Report desc
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DescMenu;
