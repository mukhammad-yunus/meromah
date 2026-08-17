import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetDescsQuery,
  useGetMyDescsQuery,
} from "../../../services/descsApi";
import {
  useGetMyDescSubscriptionsQuery,
  useSubscribeToDescMutation,
  useUnsubscribeFromDescMutation,
} from "../../../services/descSubscriptionsApi";
import { useSelector } from "react-redux";
import { SORT_BY_DESC_TYPE } from "../../../utils";
import { useMemo } from "react";
import useSortBy from "../../../hooks/useSortBy";
import ExploreCommunitySkeleton from "./Skeleton/ExploreCommunitySkeleton";
import CommunityAvatar from "../../../components/CommunityAvatar";

const ExploreDescs = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profileData } = useSelector((state) => state.myProfile);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = useMemo(() => searchParams.get("sort"), [searchParams]);

  const {
    data: allDescs,
    isLoading: isAllDescsLoading,
    error: allDescsError,
  } = useGetDescsQuery(undefined, {
    skip: sortParam === "all" ? false : sortParam === null ? false : true,
  });
  const {
    data: myDescSubscriptions,
    isLoading: isMyDescSubsLoading,
    error: myDescSubsError,
  } = useGetMyDescSubscriptionsQuery(undefined, {
    skip: sortParam !== "subscribed",
  });
  const {
    data: myDescs,
    isLoading: isMyDescsLoading,
    error: isMyDescsError,
  } = useGetMyDescsQuery(undefined, {
    skip: sortParam !== "my",
  });
  const [subscribeToDesc, { isLoading: isSubscribing }] =
    useSubscribeToDescMutation();
  const [unsubscribeFromDesc, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromDescMutation();

  const { result, isLoading, subscribedIds, error } = useMemo(() => {
    const result =
      sortParam === "all"
        ? allDescs
        : sortParam === null
        ? allDescs
        : sortParam === "subscribed"
        ? myDescSubscriptions
        : sortParam === "my"
        ? myDescs
        : { data: [] };
    const isLoading =
      sortParam === "all"
        ? isAllDescsLoading
        : sortParam === null
        ? isAllDescsLoading
        : sortParam === "subscribed"
        ? isMyDescSubsLoading
        : sortParam === "my"
        ? isMyDescsLoading
        : false;
    const error =
      sortParam === "all"
        ? allDescsError
        : sortParam === null
        ? allDescsError
        : sortParam === "subscribed"
        ? myDescSubsError
        : sortParam === "my"
        ? isMyDescsError
        : null;

    const subscribedIds = result?.subscribed
      ? new Set(result.subscribed)
      : new Set();
    return { result: result?.data || [], isLoading, subscribedIds, error };
  }, [
    allDescs,
    myDescSubscriptions,
    myDescs,
    isAllDescsLoading,
    isMyDescSubsLoading,
    isMyDescsLoading,
    allDescsError,
    myDescSubsError,
    isMyDescsError,
    searchParams,
  ]);

  const { sortBy, label, SortByComponent, emptyStateMessages } = useSortBy({
    isAuthenticated,
    sortOptionsConfig: SORT_BY_DESC_TYPE,
    initialSort: sortParam,
    searchParam: "sort",
    setSearchParams: (param) => setSearchParams(param),
  });
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
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };
  if (isLoading) return <ExploreCommunitySkeleton/>

  // Handle error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 p-8 text-center">
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Something went wrong
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">
            {error?.message || "Failed to load data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-blue text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-blue/90 dark:bg-white dark:border dark:border-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition duration-150 ease-in-out"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          Explore Descs
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">{result.length} communities</p>
      </div>
      {sortBy !== null && (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">{label}</h2>
          <SortByComponent />
        </div>
      )}
      {/* List */}
      {result.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="space-y-3">
            {result?.map((element) => (
              <div
                key={element.id}
                className="flex items-start justify-between gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Link
                  to={`/d/${element.name}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white bg-white dark:border-neutral-900 dark:bg-neutral-900">
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
                    <p className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span>{element.subscribers_count} members</span>
                      <span>{element.tests_count} tests</span>
                    </p>
                  </div>
                </Link>

                {profileData?.id !== element.author.id && (
                  <div
                    className={`flex items-center gap-2 rounded-full border overflow-hidden ${
                      subscribedIds.has(element.id) ||
                      searchParams.get("sort") === "subscribed"
                        ? "border-red-500 dark:border-neutral-100"
                        : "border-primary-blue dark:border-neutral-100"
                    }
                ${(isSubscribing || isUnsubscribing) && "animate-pulse"} `}
                  >
                    {subscribedIds.has(element.id) ||
                    searchParams.get("sort") === "subscribed" ? (
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
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 p-8 text-center">
          <h2 className="text-neutral-800 dark:text-neutral-100 text-lg font-bold">
            {emptyStateMessages.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
            {emptyStateMessages.message}
          </p>
        </div>
      )}
    </div>
  );
};
export default ExploreDescs;
