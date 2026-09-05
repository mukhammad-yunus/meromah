import React from "react";
import SearchPageHeader from "./SearchPageHeader";
import PostCardSkeleton from "../Skeleton/PostCardSkeleton";
import InfiniteItemCards from "../Virtualized/InfiniteItemCards";
import { useGetTestsBySearchQuery } from "../../../../services/testsApi";
import { Inbox } from "lucide-react";

const SearchPageTests = ({ activeTab, onSelectTab, query }) => {
  const {
    data: items,
    isFetching,
    isSuccess,
  } = useGetTestsBySearchQuery({ search: query });
  //TODO: a callback function for pagination
  return isFetching ? (
    <div className="h-screen overflow-auto bg-primary-bg dark:bg-neutral-950">
      <SearchPageHeader onSelect={() => null} activeTab={activeTab} />

      <div className="virtual-item-padding">
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <PostCardSkeleton
              key={idx}
              isLast={idx === 5 - 1}
              isFirst={idx === 0}
            />
          ))}
      </div>
    </div>
  ) : isSuccess ? (
    (items?.data && items.data.length > 0) ? (
      <InfiniteItemCards
        key={`tab=${activeTab}-type=test`}
        items={items.data}
        headerElements={[
          (ref) => (
            <SearchPageHeader
              ref={ref}
              onSelect={onSelectTab}
              activeTab={activeTab}
            />
          ),
        ]}
        layoutSchemaVersion={"searchPage-testCards"}
        layoutVersion={`tab=${activeTab}-type=test`}
        likedData={new Set(items?.liked ?? [])}
        onNearBottom={() => console.log("The End")}
        tab={activeTab}
      />
    ) : (
      <div className="h-screen overflow-auto bg-primary-bg dark:bg-neutral-950">
        <SearchPageHeader onSelect={onSelectTab} activeTab={activeTab} />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-4">
            <Inbox className="text-4xl text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No tests found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center max-w-sm">
            Try adjusting your search query
          </p>
        </div>
      </div>
    )
  ) : null;
};

export default SearchPageTests;
