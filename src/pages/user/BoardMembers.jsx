import React, { useState, useRef, useEffect } from "react";
import { useGetBoardSubscribersPrivilegedQuery } from "../../services/boardSubscriptionsApi";
import { useParams, Link } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import Loading from "../../components/Loading";
import ErrorDisplay from "../../components/ErrorDisplay";
import NotFound from "../../components/NotFound";
import { useSelector } from "react-redux";

// Member Menu Component
const MemberMenu = ({ member, onSetReadOnly, onBanUser }) => {
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
        <HiDotsVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleMenuAction(e, onSetReadOnly)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Set read-only
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={(e) => handleMenuAction(e, onBanUser)}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Ban user
          </button>
        </div>
      )}
    </div>
  );
};

// Member Card Component
const MemberCard = ({ subscriber, onSetReadOnly, onBanUser }) => {
  const user = subscriber.user;
  const joinDate = new Date(subscriber.created_at);

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/user/${user.username}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
          >
            u/{user.username}
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>Member since</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-gray-400">
              {joinDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <MemberMenu
            member={subscriber}
            onSetReadOnly={onSetReadOnly}
            onBanUser={onBanUser}
          />
        </div>
      </div>
    </div>
  );
};

const BoardMembers = () => {
  const { boardId } = useParams();
  const { profileData } = useSelector((state) => state.myProfile);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } =
    useGetBoardSubscribersPrivilegedQuery({
      board: boardId,
      queryParams: {page},
    });
  
  const handleSetReadOnly = (member) => {
    console.log("Set read only for:", member);
    // TODO: Implement read-only functionality
  };

  const handleBanUser = (member) => {
    console.log("Ban user:", member);
    // TODO: Implement ban user functionality
  };
  // Early authentication check - most critical
  if (isAuthenticated === false) {
    navigate("/login");
    return;
  }
  if (isLoading) return <Loading />;

  // Error handling
  if (isError) {
    const status = error?.status;
    // Handle specific error cases
    if (status === 404 || status === 403) {
      return <NotFound />;
    }
    return <ErrorDisplay error={error} />;
  }
  //  Data validation
  if (!data?.data) {
    return (
      <ErrorDisplay error={{ message: "Board members data not available" }} />
    );
  }

  // // Authorization check - verify ownership
  if (profileData?.username !== data.data.author?.username) {
    return <NotFound />; // Later I can create <Unauthorized /> component and return it, but for now this is enough
  }
  const subscribers = data?.data?.data || [];
  const pagination = data?.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total || 0} total member
            {pagination?.total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Members List */}
        {subscribers.length > 0 ? (
          <div className="space-y-3">
            {subscribers.map((subscriber) => (
              <MemberCard
                key={subscriber.id}
                subscriber={subscriber}
                onSetReadOnly={handleSetReadOnly}
                onBanUser={handleBanUser}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No members yet</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.current_page} of {pagination.last_page}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.last_page}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardMembers;
