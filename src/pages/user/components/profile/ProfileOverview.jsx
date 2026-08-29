import React from "react";
import { Calendar, User } from "lucide-react";
import { DEFAULT_PLACEHOLDERS } from "../../../../utils";

const ProfileOverview = ({ profile, user, formatJoinDate }) => (
  <div className="space-y-6">
    <div className="rounded-lg py-6">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <User className="text-primary-blue dark:text-blue-400" />
        About
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Bio</label>
          <p className="text-neutral-900 dark:text-neutral-100 mt-1">
            {profile?.biography || profile?.bio || DEFAULT_PLACEHOLDERS.bio}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
            <Calendar className="text-primary-blue dark:text-blue-400" />
            Member Since
          </label>
          <p className="text-neutral-900 dark:text-neutral-100 mt-1">
            {formatJoinDate(
              user?.joined_on ||
                DEFAULT_PLACEHOLDERS.joinDate
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);
export default ProfileOverview;
