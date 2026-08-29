import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NotFound from "../../../../components/NotFound";
import ErrorDisplay from "../../../../components/ErrorDisplay";
import MemberCard from "./MemberCard";
import BlockUserModal from "./BlockUserModal";

const CommunityMembers = ({
  communityId,
  isAuthenticated,
  useGetCommunityMembers,
  useGetCommunityQuery,
  communityType="board",
  useRestrictUserInCommunityMutation,
}) => {
  const [searchParams, setSearchParams] = useSearchParams({
    page: "1",
    limit: "50",
  });
  const navigate = useNavigate();
  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const page = useMemo(
    () => Number(searchParams.get("page")) || 1,
    [searchParams.get("page")]
  );
  const limit = useMemo(
    () => Number(searchParams.get("limit")) || 50,
    [searchParams.get("limit")]
  );
  const {
    data,
    isLoading: isMembersLoading,
    isError: isMembersError,
    error: membersError,
  } = useGetCommunityMembers({
    [communityType]: communityId,
    queryParams: { page, limit: limit > 0 ? limit : 50 },
  });
  const {
    data: communityData,
    error: communityError,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
  } = useGetCommunityQuery(communityId);
  const { members, blockedUsers } = useMemo(() => {
    const members = data?.data || [];
    const blockedUsers = new Set(data?.restricted || []);
    return { members, blockedUsers };
  }, [data]);
  const { totalPage, totalMembers } = useMemo(() => {
    if (communityData === undefined) return { totalPage: 0, totalMembers: 0 };
    const totalMembers = Number(communityData?.data?.subscribers_count);
    const validLimit = limit > 0 ? limit : 50;
    const totalPage = Math.ceil(totalMembers / validLimit);
    return { totalPage, totalMembers };
  }, [communityData, limit]);
  const isLoading = useMemo(
    () => isMembersLoading || isCommunityLoading || false,
    [isMembersLoading, isCommunityLoading]
  );
  const isError = useMemo(
    () => isMembersError || isCommunityError || false,
    [isMembersError, isCommunityError]
  );
  const error = useMemo(
    () => ({ member: membersError, community: communityError }),
    [membersError, communityError]
  );
  const [blockUser, { isLoading: isBlocking }] =
    useRestrictUserInCommunityMutation();
  const handleSetBlock = (member) => {
    setSelectedMember(member);
    if (blockedUsers.has(member.id)) {
      handleConfirmBlock(member);
      return;
    }
    setShowBlockUserModal(true);
  };

  const handleConfirmBlock = async (member) => {
    setIsProcessing(true);
    try {
      await blockUser({ [communityType]: communityId, user: member.id }).unwrap();
      if (blockedUsers.has(member.id)) {
        blockedUsers.delete(member.id);
      } else {
        blockedUsers.add(member.id);
      }
      // Close modal after success
      setShowBlockUserModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Failed to set read-only:", error);
      // Handle error (could show toast notification)
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseBlockUserModal = () => {
    if (!isProcessing) {
      setShowBlockUserModal(false);
      setSelectedMember(null);
    }
  };
  // Early authentication check - most critical
  if (isAuthenticated === false) {
    navigate("/login");
    return;
  }
  const handleNexPage = () => {
    if (page === totalPage) return;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", page + 1);
      return params;
    });
  };
  const handlePreviousPage = () => {
    if (page <= 1) return;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", page - 1);
      return params;
    });
  };

  // Error handling
  if (isError) {
    const { community, member } = error;
    const status = community?.status || member?.states;
    // Handle specific error cases
    if (status === 404 || status === 403) {
      return <NotFound />;
    }
    return <ErrorDisplay error={community || member} />;
  }
  return (
    <div className="min-h-screen bg-primary-bg dark:bg-neutral-950">
      {isLoading ? (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-6 shrink-0">
            <div className="h-8 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
            <div className="h-4 w-1/5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>

          {/* Members List Skeleton */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-900 flex flex-col gap-2"
              >
                <div className="h-4 w-2/5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
          {/* Header */}
          <div className="mb-6 shrink-0">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Members
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {totalMembers || 0} total member{totalMembers > 1 ? "s" : ""}
            </p>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {members.length > 0 ? (
              <div className="space-y-3">
                {members.map((subscriber) => (
                  <MemberCard
                    key={subscriber.id}
                    subscriber={subscriber}
                    onBlockUser={handleSetBlock}
                    blockedUsers={blockedUsers}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-12 text-center h-full flex items-center justify-center">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  No members yet
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="mt-6 flex items-center justify-between shrink-0">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {page} of {totalPage}
              </span>

              <button
                onClick={handleNexPage}
                disabled={page === totalPage}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      <BlockUserModal
        isOpen={showBlockUserModal}
        onClose={handleCloseBlockUserModal}
        onConfirm={handleConfirmBlock}
        member={selectedMember}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CommunityMembers;
