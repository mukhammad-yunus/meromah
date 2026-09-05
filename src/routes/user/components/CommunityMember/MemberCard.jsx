import React from "react";
import MemberMenu from "./MemberMenu";
import { useSelector } from "react-redux";

const MemberCard = ({
  subscriber,
  onBlockUser,
  blockedUsers = new Set(),
}) => {
  const { profileData } = useSelector((state) => state.myProfile);
  return (
    <div
      className={`group rounded-lg border p-4 transition-all ${
        blockedUsers.has(subscriber.id)
          ? "border-red-500 bg-red-50"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              blockedUsers.has(subscriber.id) ? "text-red-500" : "text-gray-900"
            }`}
          >
            {subscriber.name}
          </p>
          <p className={`text-xs truncate ${
              blockedUsers.has(subscriber.id) ? "text-red-400" : "text-gray-600"
            }`}>
            u/{subscriber.username}
          </p>
        </div>

        {/* Menu */}
        <div
          className={
            profileData?.username === subscriber.username ? "hidden" : "block"
          }
        >
          <MemberMenu member={subscriber} onBlockUser={onBlockUser} isUserBlocked={blockedUsers.has(subscriber.id)}/>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
