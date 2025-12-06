import { Link, useNavigate } from "react-router-dom";
import { useGetDescsQuery } from "../../../services/descsApi";
import {
  useSubscribeToDescMutation,
  useUnsubscribeFromDescMutation,
} from "../../../services/descSubscriptionsApi";
import { useSelector } from "react-redux";
import { getFileUrl, getInitials } from "../../../utils";
import { useMemo } from "react";

const ExploreDescs = () => {
  const { data: result, isLoading, error } = useGetDescsQuery();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [subscribeToDesc, { isLoading: isSubscribing }] =
    useSubscribeToDescMutation();
  const [unsubscribeFromDesc, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromDescMutation();
  const subscribedIds = useMemo(() => {
    if (!result?.subscribed) return new Set();
    return new Set(result.subscribed);
  }, [result]);
  const onSubscribe = async (e, desc) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
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
    try {
      await unsubscribeFromDesc({ desc: desc.name }).unwrap();
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };
  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-4">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white border border-neutral-300 rounded p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-full bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-20 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded border border-neutral-300 p-8 text-center">
          <h3 className="text-xl font-medium text-neutral-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-neutral-600 text-sm mb-4">
            {error.message || "Failed to load data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-blue text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-blue/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle empty results
  if (!result?.data || result.data.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-medium text-neutral-900 mb-4">
          Explore Descs
        </h1>
        <div className="bg-white rounded border border-neutral-300 p-8 text-center">
          <p className="text-neutral-600 text-sm">No Descs found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-medium text-neutral-900 mb-1">
          Explore Descs
        </h1>
        <p className="text-neutral-500 text-sm">
          {result.data.length} communities
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="space-y-3">
          {result?.data?.map((element) => (
            <div
              key={element.id}
              className="flex items-start justify-between gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <Link
                to={`/d/${element.name}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white bg-white">
                  {element?.avatar ? (
                    <img
                      src={getFileUrl(element?.avatar?.file_hash)}
                      alt="Desc avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {getInitials(element.name)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-neutral-900 mb-0.5">
                    {`d/${element.name}`}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-1">
                    {element.description || "No description"}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                    <span>{element.subscribers_count} members</span>
                    <span>{element.tests_count} tests</span>
                  </p>
                </div>
              </Link>

              <div
                className={`flex items-center gap-2 rounded-full border ${
                  subscribedIds.has(element.id)
                    ? "border-red-500"
                    : "border-primary-blue hover:border-blue-700"
                }
                ${(isSubscribing || isUnsubscribing) && "animate-pulse"} `}
              >
                {subscribedIds.has(element.id) ? (
                  <button
                    className="px-3 py-2 text-red-500 active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                    onClick={(e) => onUnSubscribe(e, element)}
                    disabled={isUnsubscribing}
                  >
                    <span>Joined</span>
                  </button>
                ) : (
                  <button
                    className="px-5 py-2 text-primary-blue active:scale-95 transition-all duration-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                    onClick={(e) => onSubscribe(e, element)}
                    disabled={isSubscribing}
                  >
                    <span>Join</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ExploreDescs;
