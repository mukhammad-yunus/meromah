import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import PostCardErrorFallback from "../ErrorFallback/PostCardErrorFalback";
import PostCard from "../PostCard";
import { useSubmitErrorLogMutation } from "../../../../services/errorLogApi";

const PostCardWithErrorBoundary = (props) => {
  const [submitErrorLog] = useSubmitErrorLogMutation();
  // Handle error logging: Error logging logic to backend
  const handleError = (error, errorInfo) => {
    const errorNames = Object.getOwnPropertyNames(error);
    const log = {};
    for (const name of errorNames) {
      log[name] = error[name];
    }
    log.error= errorInfo
    handleErrorSubmit({log})
  };
  const handleErrorSubmit = async ({log})=> {
    try {
      await submitErrorLog({log}).unwrap()
    } catch (err) {
      console.error(err)
    }
  }
  // Create fallback renderer that passes through layout props
  const fallbackRender = ({ error, resetErrorBoundary }) => (
    <PostCardErrorFallback
      error={error}
      resetErrorBoundary={resetErrorBoundary}
      isFirst={props.isFirst}
      isLast={props.isLast}
    />
  );

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onError={handleError}
      // Reset when the post ID changes (prevents stale error states)
      resetKeys={[props.item?.id]}
    >
      <PostCard {...props} />
    </ErrorBoundary>
  );
};

export default PostCardWithErrorBoundary;
