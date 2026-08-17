import React from "react";
import { useSelector } from "react-redux";
import { Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../../../components/UserAvatar";

const CreateCTASection = ({ ref = null }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profileData } = useSelector((state) => state.myProfile);
  // console.
  return (
    <div
      className="virtual-item-margin-x flex items-center gap-3 p-4 shadow shadow-neutral-300 dark:shadow-none dark:border dark:border-neutral-800 dark:hover:border-neutral-700 hover:shadow-neutral-400 transition-all ease-in-out duration-150 rounded-lg"
      ref={ref}
    >
      {/* Avatar */}
      <div
        onClick={() => navigate(`/profile`)}
        className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white dark:ring-neutral-900 flex-shrink-0"
      >
        <UserAvatar
          hash={profileData?.avatar?.file_hash}
          alt={profileData?.name || "User"}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      </div>

      {/* Placeholder Text */}
      <div
        onClick={() => navigate("/create/post")}
        className="flex-1 px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-lg transition-colors cursor-pointer border border-transparent"
      >
        {`What is on your mind${profileData?.username? `, ${profileData?.username}` : ""}?`}
      </div>

      {/* Attachment Icon */}
      <button
        onClick={() => navigate("/create/post")}
        className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-blue dark:hover:text-neutral-300 rounded-lg transition-colors cursor-pointer"
        aria-label="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CreateCTASection;
