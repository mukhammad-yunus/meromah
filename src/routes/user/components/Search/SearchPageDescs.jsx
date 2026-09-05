import React, { useMemo } from "react";
import { useSearchDescsQuery } from "../../../../services/descsApi";
import SearchPageHeader from "./SearchPageHeader";
import CommunitySkeleton from "../Skeleton/CommunitySkeleton";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CommunityAvatar from "../../../../components/CommunityAvatar";
import { useSubscribeToDescMutation, useUnsubscribeFromDescMutation } from "../../../../services/descSubscriptionsApi";
import { Inbox } from "lucide-react";

const SearchPageDescs = ({ query, activeTab, onSelectTab }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profileData } = useSelector((state) => state.myProfile);
  const navigate = useNavigate();
  const {
    data: items,
    isFetching,
    isSuccess,
  } = useSearchDescsQuery({ search: query });
  const subscribedIds = useMemo(
    () => new Set(items?.subscribed ?? []),
    [items]
  );

  const [subscribeToDesc, { isLoading: isSubscribing }] =
    useSubscribeToDescMutation();
  const [unsubscribeFromDesc, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromDescMutation();

  const onSubscribe = async (e, desc) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (profileData?.id === desc.author.id) return;
    try {
      await subscribeToDesc({ desc: desc.name }).unwrap();
      subscribedIds.add(desc.id)
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  };

  const onUnSubscribe = async (e, desc) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (profileData?.id === desc.author.id) return;
    try {
      await unsubscribeFromDesc({ desc: desc.name }).unwrap();
      subscribedIds.add(desc.id)
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };
  return isFetching && !isSuccess ? (
    <div className="h-screen overflow-auto bg-primary-bg dark:bg-neutral-950">
      <SearchPageHeader onSelect={() => null} activeTab={activeTab} />
      <div className="virtual-item-padding flex flex-col gap-2">
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <CommunitySkeleton key={idx} />
          ))}
      </div>
    </div>
  ) : (
    <div className="h-screen overflow-y-auto bg-primary-bg dark:bg-neutral-950">
      <SearchPageHeader onSelect={onSelectTab} activeTab={activeTab} />
      {items?.data && items.data.length > 0 ? (
        <main className="flex flex-col gap-2 virtual-item-padding">
          {items.data.map((element, ind) => (
            <div
            key={element.id}
            className="flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 items-start justify-between gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Link
              to={`/d/${element.name}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-12 h-12  rounded-full overflow-hidden border-4 border-white bg-white dark:border-neutral-900 dark:bg-neutral-900">
                <CommunityAvatar
                  hash={element?.avatar?.file_hash}
                  name={element.name}
                  alt="Desc avatar"
                  gradientClassName="bg-gradient-to-br from-purple-500 to-pink-500"
                  sizeClassName="font-bold text-lg"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-0.5">
                  {`d/${element.name}`}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1">
                  {element.description || "No description"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {element.subscribers_count} members • {element.posts_count}{" "}
                  posts
                </p>
              </div>
            </Link>
            {profileData?.id !== element.author.id && (
              <div
                className={`flex items-center gap-2  rounded-full border overflow-hidden ${
                  subscribedIds.has(element.id)
                    ? "border-red-500 dark:border-neutral-100"
                    : "border-primary-blue dark:border-neutral-100"
                }
                     `}
              >
                {subscribedIds.has(element.id) ? (
                  <button
                    className="px-3 py-2 bg-white dark:bg-neutral-900 text-red-500 dark:text-neutral-100 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-red-500/10 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
                    onClick={(e) => onUnSubscribe(e, element)}
                    disabled={isUnsubscribing}
                  >
                    <span>Joined</span>
                  </button>
                ) : (
                  <button
                    className="px-5 py-2 bg-white dark:bg-neutral-100 text-primary-blue dark:text-neutral-900 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer hover:bg-primary-blue/10 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                    onClick={(e) => onSubscribe(e, element)}
                    disabled={isSubscribing}
                  >
                    <span>Join</span>
                  </button>
                )}
              </div>
            )}
          </div>
          ))}
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-4">
            <Inbox className="text-4xl text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No descs found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center max-w-sm">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPageDescs;
