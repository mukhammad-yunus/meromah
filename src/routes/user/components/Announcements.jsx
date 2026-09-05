import React from "react";
import { AnnouncementsSkeleton } from "./Skeleton/AnnouncementsSkeleton";
import RelativeTime from "../../../components/RelativeTime";

const Announcements = ({
  announcements,
  isExplorePage = false,
  isLoading,
  isSuccess,
  className = "",
}) => {
  return (
    <>
      {isLoading ? (
        <AnnouncementsSkeleton isExplorePage={isExplorePage} />
      ) : (
        <div
          className={
            isExplorePage
              ? ""
              : "bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4"
          }
        >
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            Announcements
          </h2>
          <div
            className={
              className.length > 0
                ? className
                : isExplorePage
                ? "flex flex-col gap-2 p-4 text-lg"
                : "space-y-4"
            }
          >
            {isSuccess &&
              announcements?.map((announcement) => (
                <div
                  key={announcement.id}
                  className={
                    isExplorePage
                      ? `bg-white dark:bg-neutral-900 w-full p-4 border border-neutral-100 dark:border-neutral-700 rounded-lg shadow ${className.length > 0 && "min-w-3/4"}`
                      : "pb-4 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 last:pb-0"
                  }
                >
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {announcement.title}
                  </h3>
                  <RelativeTime
                    date={announcement.created_at}
                    className="text-xs text-neutral-400"
                  />
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                    {announcement.body}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Announcements;
