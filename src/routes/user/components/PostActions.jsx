import { Share2, Heart } from "lucide-react";

const PostActions = ({
  isPostLiked,
  likesCount,
  postLikesCountRef,
  onTogglePostLike,
  onShare,
}) => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-3 border-t border-neutral-100 dark:border-neutral-700">
      <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-200 text-sm">
        <button
          onClick={onTogglePostLike}
          className="flex items-center gap-2 hover:text-red-500 p-2 -m-2 rounded focus:outline-none"
          title={isPostLiked ? "Unlike" : "Like"}
          aria-label={`${likesCount} likes`}
        >
          <Heart className={`transition-colors cursor-pointer ${isPostLiked ? "text-red-500 fill-red-500" : ""} `}/>
          <span
            ref={postLikesCountRef}
            className={` transition-colors duration-200 ${isPostLiked ? "text-red-500" : ""}`}
          >
            {likesCount}
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-300 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
          title="Share"
        >
          <Share2 />
        </button>
      </div>
    </div>
  );
};

export default PostActions;


