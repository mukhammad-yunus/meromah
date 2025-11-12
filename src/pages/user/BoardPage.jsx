import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import PostCard from "./components/PostCard";
import BoardHeader from "../../components/BoardHeader";
import { useDispatch } from "react-redux";
import { addRecentCommunity } from "../../app/recentCommunitiesSlice";
import { useGetPostsForBoardQuery } from "../../services/postsApi";
import Loading from "../../components/Loading";
import { useGetBoardQuery } from "../../services/boardsApi";
import { FaRegFileAlt } from "react-icons/fa";

const BoardPage = () => {
  const { boardId } = useParams();
  const { pathname } = useLocation();
  const {
    data: boardData,
    error: errorBoard,
    isLoading: isBoardLoading,
  } = useGetBoardQuery(boardId);
  const {
    data: postData,
    error: postError,
    isLoading: isPostLoading,
  } = useGetPostsForBoardQuery({ board: boardId });
  const dispatch = useDispatch();
  useEffect(() => {
    if (!boardId || !pathname || boardData === undefined) return;
    dispatch(
      addRecentCommunity({
        id: `b/${boardId}`,
        title: `b/${boardId}`,
        to: pathname,
      })
    );
  }, [boardId, pathname]);
  if (isPostLoading || isBoardLoading) return <Loading />;
  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Board Header */}
        <BoardHeader board={boardData.data} />

        {/* Posts Feed */}
        <div className="bg-white rounded-lg shadow-sm">
          {boardData.data.post_count === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <FaRegFileAlt className="text-4xl text-neutral-700" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No posts yet
              </h3>
              <p className="text-neutral-600 text-sm text-center max-w-sm">
                Be the first to share something in this board!
              </p>
            </div>
          ) : (
            <div>
              {postData.data.map((post, i) => {
                const isFirst = i === 0;
                const isLast = i === postData.data.length - 1;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    isFirst={isFirst}
                    isLast={isLast}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
