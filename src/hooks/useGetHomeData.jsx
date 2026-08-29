import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetTestsByFilterQuery,
} from "../services/testsApi";
import {
  useGetPostsByFilterQuery,
} from "../services/postsApi";
import { useDispatch, useSelector } from "react-redux";
import {
  nextPage,
  resetTab,
  setItems,
} from "../app/homeFeedSlice";

const PAGE_SIZE = 50;
const useGetHomeData = ({ sortBy, type }) => {
  /* ----------------------------------*/
  /* Redux */
  /* ----------------------------------*/

  const {
    items,
    page,
    hasFetchRequest,
  } = useSelector((state) => state.homeFeed);
  const dispatch = useDispatch();

  /* ----------------------------------*/
  /* States */
  /* ----------------------------------*/
  const [error, setError] = useState({
    posts: {
      hasError: false,
      status: undefined,
      message: undefined,
    },
    tests: {
      hasError: false,
      status: undefined,
      message: undefined,
    },
  });
  const [hasMore, setHasMore] = useState({
    posts: true,
    tests: true,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [likedData, setLikedData] = useState({
    post: new Set(),
    test: new Set(),
  });
  /* ----------------------------------*/
  /* Refs */
  /* ----------------------------------*/
  const remainingRef = useRef({
    posts: 1,
    tests: 1,
  });
  const loaderRef = useRef(null);
  const requestedPageRef = useRef(page[type]);
  const {
    data: tests,
    isFetching: isTestsFetching,
    error: testsError,
    isError: isTestsError,
    isSuccess: isTestsSuccess,
  } = useGetTestsByFilterQuery(
    { queryParams: `${sortBy}&page=${page[type]}` },
    {
      skip:
        type === "posts" ||
        !hasMore.tests,
    }
  );

  /* ----------------------------------*/
  /* API Queries */
  /* ----------------------------------*/
  const {
    data: posts,
    isFetching: isPostsFetching,
    error: postsError,
    isError: isPostsError,
    isSuccess: isPostsSuccess,
  } = useGetPostsByFilterQuery(
    { queryParams: `${sortBy}&page=${page[type]}` },
    {
      skip:
        type === "tests" ||
        !hasMore.posts,
    }
  );

  const isSuccess = useMemo(() => {
    const successMap = {
      posts: isPostsSuccess,
      tests: isTestsSuccess,
    };

    return successMap[type] ?? false;
  }, [
    type,
    isPostsSuccess,
    isTestsSuccess,
  ]);

  /* ----------------------------------*/
  /* useEffects */
  /* ----------------------------------*/

  //Reset feed data when sort or tab changes; reset hasMore so the new filter request is not skipped
  useEffect(() => {
    setHasMore((prev) => ({ ...prev, [type]: true }));
    dispatch(resetTab({ sortBy, itemType: type }));
  }, [sortBy, type, dispatch]);
  //Update liked data
  useEffect(() => {
  setLikedData(prev => {
    const next = {
      post: new Set(prev.post),
      test: new Set(prev.test),
    };

    const merge = (target, source) => {
      if (Array.isArray(source)) {
        source.forEach(id => next[target].add(id));
      }
    };

    merge("post", posts?.liked);
    merge("test", tests?.liked);

    return next;
  });
}, [posts, tests]);


  //Save data to Redux
  useEffect(() => {
    // Determine active data source
    const getActiveData = { posts, tests };
    const activeData = getActiveData[type];

    // Update data
    if (activeData?.data) {
      dispatch(
        setItems({
          data: activeData.data,
          sortBy,
          itemType: type,
          page: page[type],
        })
      );
    }
  }, [sortBy, type, isSuccess, posts?.data, tests?.data, page, dispatch]);

  //Extract error from API queries
  useEffect(() => {
    const getActiveError = { posts: postsError, tests: testsError };
    const getIsActiveError = { posts: isPostsError, tests: isTestsError };
    const activeError = getActiveError[type];
    const isActiveError = getIsActiveError[type];
    // Update error state
    if (isActiveError && activeError) {
      setError((e) => ({
        ...e,
        [type]: {
          hasError: true,
          status: activeError.status,
          message: activeError.data?.message,
        },
      }));
    } else if (isActiveError === false) {
      setError((e) => ({
        ...e,
        [type]: { hasError: false, status: undefined, message: undefined },
      }));
    }
  }, [postsError, testsError, isPostsError, isTestsError, type]);

  //Extract isFetching from API queries
  useEffect(() => {
    const anyFetching =
      (type === "posts" && isPostsFetching) ||
      (type === "tests" && isTestsFetching);
    setIsFetching(Boolean(anyFetching));
  }, [isPostsFetching, isTestsFetching, type]);

  //Checking if the data available to fetch from API queries
  useEffect(() => {
    if (posts && posts.data) {
      const got = posts.data.length;
      setHasMore((s) => ({ ...s, posts: got >= PAGE_SIZE }));
    }
    if (tests && tests.data) {
      const got = tests.data.length;
      setHasMore((s) => ({ ...s, tests: got >= PAGE_SIZE }));
    }
  }, [posts, tests]);

  /* ----------------------------------*/
  /* Pagination useEffect*/
  /* ----------------------------------*/
  useEffect(() => {
    requestedPageRef.current = page[type];
  }, [page, type]);
  useEffect(() => {
    const canFetchMore =
      type === "posts"
        ? hasMore.posts
        : hasMore.tests;

    const alreadyRequested = requestedPageRef.current > page[type];
    if (
      !isFetching &&
      isSuccess &&
      canFetchMore &&
      !alreadyRequested &&
      hasFetchRequest[type]
    ) {
      requestedPageRef.current = page[type] + 1;
      dispatch(nextPage({ itemType: type }));
      if (!hasMore.posts) {
        remainingRef.current.posts = 0;
      }
      if (!hasMore.tests) {
        remainingRef.current.tests = 0;
      }
    }
  }, [
    dispatch,
    isFetching,
    isSuccess,
    page,
    type,
    hasMore,
    hasFetchRequest,
    items,
  ]);
  return {
    data: items[type],
    likedData,
    error: error[type],
    isFetching,
    loaderRef,
    hasMore,
    isSuccess,
    page: page[type],
    requestedPageRef,
  };
};

export default useGetHomeData;
