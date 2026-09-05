import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PostCard from "./components/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { addRecentCommunity } from "../../app/recentCommunitiesSlice";
import { useGetTestsForDescQuery } from "../../services/testsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import Toast from "../../components/Toast";
import { useGetDescQuery } from "../../services/descsApi";
import { FileText } from "lucide-react";
import useSortBy from "../../hooks/useSortBy";
import CreateTest from "./components/CreateTest";
import DescHeader from "./components/DescHeader";
import { Plus } from "lucide-react";
import { SORT_BY } from "../../utils";
import { setDescName, setIsPopUp } from "../../app/createTestSlice";
import InfiniteItemCards from "./components/Virtualized/InfiniteItemCards";

// Helper function to extract error message from API error response
const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  if (typeof error === "string") return error;
  return (
    error.data?.message ??
    error.data?.error ??
    error.message ??
    error.error ??
    error.response?.data?.message ??
    "An unexpected error occurred. Please try again."
  );
};

const DescPage = () => {
  const { descId } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Create Test State
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!showCreateTest) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showCreateTest]);
  // Use custom hook for sorting
  const { sortBy, SortByComponent, emptyStateMessages } = useSortBy({
    isAuthenticated,
    sortOptionsConfig: SORT_BY,
  });

  const {
    data: descData,
    error: descError,
    isLoading: isDescLoading,
    isError: isDescError,
  } = useGetDescQuery(descId);

  const {
    data: testData,
    error: testError,
    isLoading: isTestLoading,
    isError: isTestError,
  } = useGetTestsForDescQuery({ desc: descId, queryParams: sortBy });
  const subscribedIds = useMemo(() => {
    if (!descData?.subscribed) return new Set();
    return new Set(descData.subscribed);
  }, [descData]);
  useEffect(() => {
    if (!descId || !pathname || descData === undefined) return;
    dispatch(
      addRecentCommunity({
        id: `d/${descId}`,
        name: `d/${descId}`,
        to: pathname,
      })
    );
  }, [descId, pathname, descData, dispatch]);

  const onShowCreateTest = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(setIsPopUp(true));
    dispatch(setDescName(descId));
    setShowCreateTest(true);
  };

  if (isTestLoading || isDescLoading) return <Loading />;

  if (isTestError || isDescError) {
    const statusDesc = descError?.status;
    const statusTest = testError?.status;
    if (statusDesc === 404 || statusTest === 404) return <NotFound />;
    return <ErrorDisplay error={descError || testError} />;
  }

  if (!descData || !testData) return null;

  // Transform test data to match PostCard expected structure
  const transformedTests = testData?.data?.map((test) => ({
    ...test,
    body: test.description,
    desc: {
      name: descData.data.name,
      id: descData.data.id,
    },
    comments_count: 0, // Tests don't have comments in the template
    youLiked: testData.likedTests?.includes(test.id) || false,
  }));
  return (
    <div className="min-h-screen bg-primary-bg dark:bg-neutral-950">
      <InfiniteItemCards
        items={testData.data}
        likedData={{ post: new Set(testData?.liked || []) }}
        layoutVersion={sortBy}
        tab={"desc"}
        key={descData?.data.name}
        headerElements={[
          (ref) => (
            <div ref={ref} className="w-full mx-auto px-4 py-8">
              {/* Desc Header */}
              <DescHeader
                desc={descData?.data}
                isSubscribed={subscribedIds.has(descData?.data.id)}
              />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Tests
                </h2>
                <div className="flex items-center gap-3">
                  <SortByComponent />
                  {!showCreateTest && isAuthenticated && (
                    <button
                      onClick={onShowCreateTest}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 bg-primary-blue dark:bg-neutral-100 hover:bg-primary-blue/90 dark:hover:bg-neutral-900 hover:text-white dark:hover:text-neutral-100 rounded-lg transition-colors shadow-sm"
                      aria-label="Create test"
                    >
                      <Plus className="w-5 h-5" />
                      Create Test
                    </button>
                  )}
                </div>
              </div>

              {/* Create Test Form */}
              {isAuthenticated && showCreateTest && (
                <CreateTest
                  onCancel={() => setShowCreateTest(false)}
                  onError={(errorMessage) => {
                    setToast({
                      message: errorMessage,
                      type: "error",
                    });
                  }}
                />
              )}

              {/* Tests Feed */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                {transformedTests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-4">
                      <FileText className="text-4xl text-neutral-700 dark:text-neutral-200" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      No tests yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center max-w-sm">
                      Be the first to create a test in this desc!
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ),
        ]}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DescPage;
