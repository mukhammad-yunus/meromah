export const AnnouncementsSkeleton = ({ count = 3, isExplorePage = false }) => {
  return (
    <div
      className={
        isExplorePage
          ? ""
          : "bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4"
      }
    >
      <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-3" />
      <div
        className={
          isExplorePage
            ? "flex flex-col gap-2 p-4 text-lg"
            : "space-y-4"
        }
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={
              isExplorePage
                ? "bg-white dark:bg-neutral-900 w-full p-4 border border-neutral-100 dark:border-neutral-700 rounded-lg shadow"
                : "pb-4 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 last:pb-0"
            }
          >
            {/* Title skeleton */}
            <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2 w-3/4" />
            
            {/* Date skeleton */}
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2 w-24" />
            
            {/* Body skeleton - multiple lines */}
            <div className="space-y-2">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-full" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};