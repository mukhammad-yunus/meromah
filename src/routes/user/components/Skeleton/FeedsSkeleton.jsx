import PostCardSkeleton from "./PostCardSkeleton";

const FeedsSkeleton = () => {
  return (
    <div className="relative grid gap-4 md:gap-6">
      <div className="sticky top-0 left-0 right-0 grid grid-cols-2 bg-transparent py-0.5 backdrop-blur-sm border-b border-b-neutral-200 dark:border-b-neutral-700 z-50 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center py-5">
            <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between animate-pulse px-4 md:px-6">
        {/* Left title skeleton */}
        <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />

        {/* Right button skeleton */}
        <div className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>

      {Array.from(Array(20).keys()).map((_, i) => (
        <div key={i} className="px-4 md:px-6">
          <PostCardSkeleton isFirst={i === 0} isLast={i === 19} />
        </div>
      ))}
    </div>
  );
};

export default FeedsSkeleton;
