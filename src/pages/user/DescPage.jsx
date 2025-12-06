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
import { FaRegFileAlt } from "react-icons/fa";
import useSortBy from "../../hooks/useSortBy";
import CreateTest from "./components/CreateTest";
import DescHeader from "./components/DescHeader";
import { IoAdd } from "react-icons/io5";
import { SORT_BY } from "../../utils";

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

  // Get current user from Redux
  const { profileData } = useSelector((state) => state.myProfile);
  const username = useMemo(() => profileData?.username || null, [profileData]);
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
  const transformedTests = testData?.data?.data?.map((test) => ({
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
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Desc Header */}
        <DescHeader desc={descData?.data} isSubscribed={subscribedIds.has(descData?.data.id)} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Tests</h2>
          <div className="flex items-center gap-3">
            <SortByComponent />
            {!showCreateTest && (
              <button
                onClick={() => setShowCreateTest(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-primary-blue/10 hover:text-primary-blue rounded-lg transition-colors shadow-sm"
                aria-label="Create test"
              >
                <IoAdd className="w-5 h-5" />
                Create Test
              </button>
            )}
          </div>
        </div>

        {/* Create Test Form */}
        {isAuthenticated && showCreateTest && (
          <CreateTest
            descId={descId}
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
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {transformedTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <FaRegFileAlt className="text-4xl text-neutral-700" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No tests yet
              </h3>
              <p className="text-neutral-600 text-sm text-center max-w-sm">
                Be the first to create a test in this desc!
              </p>
            </div>
          ) : (
            <div>
              {transformedTests.map((test, i) => {
                const isFirst = i === 0;
                const isLast = i === transformedTests.length - 1;
                return (
                  <PostCard
                    key={test.id}
                    item={test}
                    isFirst={isFirst}
                    isLast={isLast}
                    itemType="test"
                    communityType="desc"
                    communityUrl="d/"
                  />
                );
              })}
            </div>
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
    </div>
  );
};

export default DescPage;
