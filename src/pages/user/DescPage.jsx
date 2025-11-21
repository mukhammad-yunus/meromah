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
import { IoMdAttach } from "react-icons/io";
import useSortBy from "../../hooks/useSortBy";
import CreateTest from "./components/CreateTest";
import DescHeader from "./components/DescHeader";

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
  
  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Create Test State
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [toast, setToast] = useState(null);

  // Use custom hook for sorting
  const { sortBy, SortByComponent, emptyStateMessages } = useSortBy(
    isAuthenticated,
    username
  );
  
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
    board: {
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
        <DescHeader desc={descData.data} />

        {/* Create Test Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          {!showCreateTest ? (
            <div className="flex items-center gap-3 p-4">
              {/* Avatar */}
              <div
                onClick={onShowCreateTest}
                className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white flex-shrink-0"
              >
                <p className="w-11 h-11 flex items-center justify-center rounded-full">
                  {getInitials(isAuthenticated ? profileData?.name : "User")}
                </p>
              </div>

              {/* Placeholder Text */}
              <div
                onClick={onShowCreateTest}
                className="flex-1 px-4 py-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
              >
                Create a new test for d/{descData.data.name}
              </div>

              {/* Attachment Icon */}
              <button
                onClick={onShowCreateTest}
                className="p-2 text-neutral-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Create test"
              >
                <IoMdAttach className="w-5 h-5" />
              </button>
            </div>
          ) : isAuthenticated ? (
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
          ) : null}
        </div>

        {/* Sorting/Filtering Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Tests</h2>
          <SortByComponent />
        </div>

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
                    post={test}
                    isFirst={isFirst}
                    isLast={isLast}
                    postType="test"
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
