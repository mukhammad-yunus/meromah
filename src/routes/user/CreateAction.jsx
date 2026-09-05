import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { resetTestSlice } from "../../app/createTestSlice";

// Lazy load each action
const CreatePost = lazy(() => import("./components/CreatePost"));
const CreateCommunity = lazy(() => import("./components/CreateCommunity"));
const CreateTest = lazy(() => import("./components/CreateTest"));
const actions = {
  post: CreatePost,
  community: CreateCommunity,
  test: CreateTest,
};

const CreateAction = () => {
  const { action } = useParams();
  const [searchParams] = useSearchParams();
  const { descName } = useSelector((state) => state.testMetadata);
  const dispatch = useDispatch();
  const ActionComponent = actions[action];

  if (!ActionComponent) {
    return <h2>Unknown action: {action}</h2>;
  }
  useEffect(() => {
    if (action === "test" && searchParams.get("from") !== "drafts") {
      dispatch(resetTestSlice());
    }
}, [descName, searchParams, action]);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionComponent />
    </Suspense>
  );
};

export default CreateAction;
