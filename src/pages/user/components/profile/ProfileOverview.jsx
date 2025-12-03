import React from "react";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { DEFAULT_PLACEHOLDERS } from "../../../../utils";

const ProfileOverview = ({ profile, user, formatJoinDate }) => (
  <div className="space-y-6">
    <div className="rounded-lg py-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <FaUser className="text-primary-blue" />
        About
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-600">Bio</label>
          <p className="text-neutral-900 mt-1">
            {profile?.biography || profile?.bio || DEFAULT_PLACEHOLDERS.bio}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-600 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-blue" />
            Member Since
          </label>
          <p className="text-neutral-900 mt-1">
            {formatJoinDate(
              user?.created_at ||
                user?.createdAt ||
                DEFAULT_PLACEHOLDERS.joinDate
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);
export default ProfileOverview;
