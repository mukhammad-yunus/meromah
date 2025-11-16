import { FiShare2 } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const PostActions = ({
  isPostLiked,
  likesCount,
  postLikesCountRef,
  onTogglePostLike,
  onShare,
}) => {
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-4 text-neutral-600 text-sm">
        <button
          onClick={onTogglePostLike}
          className="flex items-center gap-2 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none"
          title={isPostLiked ? "Unlike" : "Like"}
          aria-label={`${likesCount} likes`}
        >
          {isPostLiked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
          <span
            ref={postLikesCountRef}
            className={isPostLiked ? "text-red-500" : ""}
          >
            {likesCount}
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
          title="Share"
        >
          <FiShare2 />
        </button>
      </div>
    </div>
  );
};

export default PostActions;

