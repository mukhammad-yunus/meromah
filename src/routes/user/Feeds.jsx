import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Inbox } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useSortBy from "../../hooks/useSortBy.jsx";
import HomeSortBy from "./components/home/HomeSortBy.jsx";
import { SORT_BY, SORT_BY_TYPE } from "../../utils/constants.js";
import useGetHomeData from "../../hooks/useGetHomeData.jsx";
import Toast from "../../components/Toast.jsx";
import InfiniteItemCards from "./components/Virtualized/InfiniteItemCards.jsx";
import FeedsSkeleton from "./components/Skeleton/FeedsSkeleton.jsx";
import { setHasFetchRequest } from "../../app/homeFeedSlice.js";
import CreateCTASection from "./components/home/CreateCTASection.jsx";
import { useGetAnnouncementsQuery } from "../../services/announcementApi.js";
import Announcements from "./components/Announcements.jsx";

const Feeds = () => {
  const [type, setType] = useState("posts");
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.myProfile);
  const { hasFetchRequest } = useSelector((s) => s.homeFeed);

  const hasFetchRequestRef = useRef(hasFetchRequest);
  const username = useMemo(() => profileData?.username || null, [profileData]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Custom hook for sorting
  const {
    sortBy,
    SortByComponent,
    emptyStateMessages: emptyStateMessagesByTime,
    resetSortBy,
  } = useSortBy({ isAuthenticated, sortOptionsConfig: SORT_BY });
  //API call hook to get posts/tests details
  const { data, likedData, error, hasMore } = useGetHomeData({
    sortBy,
    type,
    username,
  });

  const {
    data: announcementsResult,
    isSuccess: isAnnouncementsSuccess,
    isFetching: isAnnouncementsFetching,
  } = useGetAnnouncementsQuery();

  useEffect(() => {
    hasFetchRequestRef.current = hasFetchRequest;
  }, [hasFetchRequest]);
  useEffect(() => {
    if (isFirstLoading && data && data.length > 0) {
      setIsFirstLoading(false);
    }
  }, [data, isFirstLoading]);
  const fetchRequest = useCallback(() => {
    if (!hasFetchRequestRef.current[type]) {
      dispatch(setHasFetchRequest({ state: true, itemType: type }));
    }
  }, [dispatch, type]);

  return (
    <>
      <div>
        <div>
          {/* Content */}
          {isFirstLoading ? (
            <FeedsSkeleton />
          ) : data.length === 0 ? (
            <>
              <HomeSortBy
                SortByComponent={SortByComponent}
                type={type}
                setType={setType}
              />
              <CreateCTASection />
              <div className="sm:hidden virtual-item-margin-x">
                <Announcements
                  announcements={announcementsResult?.data}
                  isExplorePage={true}
                  isLoading={isAnnouncementsFetching}
                  isSuccess={isAnnouncementsSuccess}
                  className="flex gap-4 overflow-x-auto"
                />
              </div>
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-4">
                  <Inbox className="text-4xl text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No posts yet. Be a first one to post
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center max-w-sm">
                  Be the first to post something!
                </p>
              </div>
            </>
          ) : (
            <>
              <InfiniteItemCards
                key={type}
                hasMore={hasMore}
                items={data}
                likedData={likedData}
                type={type}
                error={error}
                layoutVersion={`${type}-${sortBy}`}
                layoutSchemaVersion={"feeds-itemCards"}
                headerElements={[
                  (ref) => (
                    <HomeSortBy
                      ref={ref}
                      SortByComponent={SortByComponent}
                      type={type}
                      setType={setType}
                    />
                  ),
                  (ref) => <CreateCTASection ref={ref} />,
                  (ref) => (
                    <div className="sm:hidden virtual-item-margin-x" ref={ref}>
                      <Announcements
                        announcements={announcementsResult?.data}
                        isExplorePage={true}
                        isLoading={isAnnouncementsFetching}
                        isSuccess={isAnnouncementsSuccess}
                        className="flex gap-4 overflow-x-auto"
                      />
                    </div>
                  ),
                ]}
                onNearBottom={fetchRequest}
              />
            </>
          )}
        </div>
      </div>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Feeds;
