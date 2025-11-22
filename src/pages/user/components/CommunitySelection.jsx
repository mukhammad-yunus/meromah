import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchBoardsQuery } from "../../../services/boardsApi";
import { useGetMyBoardSubscriptionsQuery } from "../../../services/boardSubscriptionsApi";
import { useSearchDescsQuery } from "../../../services/descsApi";
import { useGetMyDescSubscriptionsQuery } from "../../../services/descSubscriptionsApi";

const SearchBarButton = ({ community, onSelectCommunity, communityType }) => {
  const PostCount = () => {
    const count =
      communityType === "board"
        ? community?.posts_count
        : community?.tests_count;
    const postType =
      communityType === "board"
        ? `post${count !== 1 ? "s" : ""}`
        : `test${count !== 1 ? "s" : ""}`;

    return (
      <p className="flex items-center gap-1">
        <span>{count || 0}</span>
        <span>{postType}</span>
      </p>
    );
  };
  return (
    <button
      type="button"
      onClick={() => onSelectCommunity(community)}
      className="w-full px-3 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
        {community?.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-900">
          {communityType === "board" ? "b/" : "d/"}
          {community?.name}
        </div>
        {community?.description && (
          <div className="text-xs text-neutral-500 truncate">
            {community?.description}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
          <p>{community?.subscribers_count || 0} members</p>
          <PostCount />
        </div>
      </div>
    </button>
  );
};

const CommunitySelection = ({
  communityType,
  onSelectCommunity,
  onClearSelection,
  resetRef,
}) => {
  const communityTypes = new Set(["desc", "board"]);
  if (!communityTypes.has(communityType)) return null;
  const communitySearchRef = useRef(null);
  const communityDropdownRef = useRef(null);
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  // Search boards when communitySearchQuery has content
  const { data: boardsData, isLoading: isBoardsLoading } = useSearchBoardsQuery(
    communitySearchQuery.trim().length > 0
      ? { search: communitySearchQuery.trim() }
      : undefined,
    {
      skip:
        communitySearchQuery.trim().length === 0 || communityType !== "board",
    }
  );
  const { data: descsData, isLoading: isDescsLoading } = useSearchDescsQuery(
    communitySearchQuery.trim().length > 0
      ? { search: communitySearchQuery.trim() }
      : undefined,
    {
      skip:
        communitySearchQuery.trim().length === 0 || communityType !== "desc",
    }
  );
  const communityData = communityType === "board" ? boardsData : descsData;
  const isCommunityLoading =
    communityType === "board" ? isBoardsLoading : isDescsLoading;
  // My board subscriptions
  const {
    data: myBoardSubscriptions,
    isSuccess: isMyBoardSubscriptionsSuccess,
  } = useGetMyBoardSubscriptionsQuery(undefined, {
    skip: communityType !== "board",
  });
  // My board subscriptions
  const { data: myDescSubscriptions, isSuccess: isMyDescSubscriptionsSuccess } =
    useGetMyDescSubscriptionsQuery(undefined, {
      skip: communityType !== "desc",
    });

  // Expose reset function to parent via ref
  useEffect(() => {
    if (resetRef) {
      resetRef.current = () => {
        setCommunitySearchQuery("");
        setShowCommunityDropdown(false);
      };
    }
  }, [resetRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        communityDropdownRef.current &&
        !communityDropdownRef.current.contains(event.target) &&
        communitySearchRef.current &&
        !communitySearchRef.current.contains(event.target)
      ) {
        setShowCommunityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Create a Set of board IDs from boardsData for O(1) lookup
  const communityDataIdSet = useMemo(() => {
    if (!communityData || communityData.length === 0) return new Set();
    return new Set(communityData.map((item) => item.id));
  }, [communityData]);

  // Filter myBoardSubscriptions || myDescSubscriptions based on search query
  const filteredSubscriptions = useMemo(() => {
    const isSuccess =
      communityType === "board"
        ? isMyBoardSubscriptionsSuccess
        : isMyDescSubscriptionsSuccess;
    const myCommunitySubscriptions =
      communityType === "board" ? myBoardSubscriptions : myDescSubscriptions;
    if (!isSuccess || !myCommunitySubscriptions?.data) return [];

    const query = communitySearchQuery.trim();

    // If search query is empty, show all subscriptions
    if (query === "") {
      return myCommunitySubscriptions.data;
    }

    // If search query exists, only show subscriptions whose id is in boardsData
    if (communityDataIdSet.size > 0) {
      return myCommunitySubscriptions.data.filter((sub) =>
        communityDataIdSet.has(sub.id)
      );
    }

    // Otherwise, hide subscriptions
    return [];
  }, [
    isMyBoardSubscriptionsSuccess,
    myBoardSubscriptions,
    isMyDescSubscriptionsSuccess,
    myDescSubscriptions,
    communityType,
    communitySearchQuery,
    communityDataIdSet,
  ]);

  const handleCommunitySearch = (e) => {
    let query = e.target.value;
    query = query.trim().length !== 0 ? query.replace(/\s+/g, "_") : "";
    query = query.replace(/[^a-zA-Z0-9_]/g, "");

    setCommunitySearchQuery(query);
    setShowCommunityDropdown(true);

    // Reset selection if user clears the input
    if (query.trim().length === 0) {
      if (onClearSelection) {
        onClearSelection();
      }
    }
  };

  const handleSelectCommunity = (community) => {
    if (onSelectCommunity) {
      onSelectCommunity(community);
    }
    setCommunitySearchQuery(
      `${communityType === "board" ? "b" : "d"}/${community.name}`
    );
    setShowCommunityDropdown(false);
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1 text-sm font-medium text-neutral-800">
        <span>Select</span>
        <span>{communityType === "board" ? "Board *" : "Desc *"}</span>
      </label>
      <div className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            ref={communitySearchRef}
            type="text"
            maxLength={20}
            value={communitySearchQuery}
            onChange={handleCommunitySearch}
            onFocus={() => setShowCommunityDropdown(true)}
            placeholder={`Search for a ${communityType}...`}
            className="w-full pl-10 pr-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
          />
        </div>
        {showCommunityDropdown && (
          <div
            ref={communityDropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {/* Show filtered subscriptions */}
            {filteredSubscriptions?.length > 0 && (
              <div className="p-2 border-b border-neutral-100">
                <h2 className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  <span>Subscribed</span>{" "}
                  <span>{communityType === "board" ? "Boards" : "Descs"}</span>
                </h2>
                <div className="mt-1">
                  {filteredSubscriptions.map((item, i) => (
                    <SearchBarButton
                      community={item}
                      communityType={communityType}
                      onSelectCommunity={handleSelectCommunity}
                      //Here, temporary key value inserted, later it will be removed or altered
                      key={`${i}-${item.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show search results when query exists */}
            {communitySearchQuery.trim() !== "" && (
              <div className={filteredSubscriptions.length > 0 ? "p-2" : ""}>
                {isCommunityLoading && (
                  <div className="p-3 text-sm text-neutral-500 text-center">
                    Searching...
                  </div>
                )}

                {!isCommunityLoading &&
                  (!communityData || communityData?.length === 0) && (
                    <div className="flex items-center gap-1 p-3 text-sm text-neutral-500 text-center">
                      <span>
                        {communityType === "board"
                          ? "No Board found"
                          : "No Desc Found"}
                      </span>
                    </div>
                  )}

                {!isCommunityLoading &&
                  communityData &&
                  communityData?.length > 0 && (
                    <>
                      {filteredSubscriptions.length > 0 && (
                        <h2 className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-2">
                          Search Results
                        </h2>
                      )}
                      <div className="py-1">
                        {communityData.map((item) => (
                          <SearchBarButton
                            community={item}
                            communityType={communityType}
                            onSelectCommunity={handleSelectCommunity}
                            key={`search-item-id-${item.id}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
              </div>
            )}

            {/* Show message when no subscriptions and no search query */}
            {communitySearchQuery.trim() === "" &&
              filteredSubscriptions.length === 0 && (
                <div className="p-3 text-sm text-neutral-500 text-center">
                  {communityType === "board"
                    ? "No subscribed boards"
                    : "No subscribed descs"}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySelection;
