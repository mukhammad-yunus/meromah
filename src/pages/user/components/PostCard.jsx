import React, { useRef, useState, useMemo } from "react";
import { FaRegComment, FaRegHeart, FaHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTogglePostLikeMutation } from "../../../services/postsApi";
import { useSelector } from "react-redux";
import RelativeTime from '../../../components/RelativeTime'
import { getInitials } from "../../../utils";
import PostImages from "./PostImages";
import PostFiles from "./PostFiles";
import ShareModal from "./ShareModal";
import PostMenu from "./PostMenu";
import EditPostModal from "./EditPostModal";
import ReportModal from "./ReportModal";
import DeletePostModal from "./DeletePostModal";
const preventNavigation = (e) => {
  e.preventDefault();
  e.stopPropagation();
};
const getType = {
  post: ["b", "board"],
  quiz: ["d", "desc"],
  library: ["b", "board"],
};
const PostCard = ({ post, isFirst, isLast, postType = "post" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(post.youLiked);
  const [imageError, setImageError] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const postLikesCountRef = useRef(null);
  const [togglePostLike, { error: togglePostLikeError }] =
    useTogglePostLikeMutation();

  // Separate images and files based on mimetype
  const { images, files } = useMemo(() => {
    if (!post.files || post.files.length === 0) {
      return { images: [], files: [] };
    }
    const imageFiles = post.files.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    const nonImageFiles = post.files.filter(
      (file) => !file.mimetype.startsWith("image/")
    );
    return { images: imageFiles, files: nonImageFiles };
  }, [post.files]);

  const handleAuthorClick = (e, path) => {
    preventNavigation(e);
    //later i will implement the logic to determine if the path is for UserProfile or MyProfile.
    //for now, i will just navigate to the UserProfile page.
    navigate(path);
  };

  const handleBoardClick = (e, path) => {
    preventNavigation(e);
    navigate(path);
  };

  const onTogglePostLike = async (e) => {
    preventNavigation(e);
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const board = post.board.name;
    const postId = post.id;
    const res = await togglePostLike({ board, post: postId }).unwrap();
    setLiked(res.toggle);
    if (res.toggle) {
      postLikesCountRef.current.textContent =
        Number(postLikesCountRef.current.textContent) + 1;
    } else {
      postLikesCountRef.current.textContent =
        Number(postLikesCountRef.current.textContent) - 1;
    }
  };

  const handleEdit = (e) => {
    preventNavigation(e);
    setIsEditModalOpen(true);
  };

  const handleDelete = (e) => {
    preventNavigation(e);
    setIsDeleteModalOpen(true);
  };

  const handleReport = (e) => {
    preventNavigation(e);
    setIsReportModalOpen(true);
  };

  return (
    <>
    <Link
      to={`/b/${post.board.name}/post/${post.id}`}
      className={`block bg-white border-x border-b border-gray-200 p-4 hover:bg-primary-bg transition-colors duration-200 ${
        isFirst && "rounded-t-lg border-t"
      } ${isLast && "rounded-b-lg"}`}
    >
      {/* Author */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* For now I am not going to display avatar
          {author.avatar ? (
            <img
              src={post.author.avatar}
              alt={`${post.author.username}'s profile picture`}
              className="w-8 h-8 rounded-full shadow shadow-neutral-200"
              onClick={(e) =>
                handleAuthorClick(e, `/user/${post.author.username}`)
              }
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow shadow-neutral-200"
              onClick={(e) =>
                handleAuthorClick(e, `/user/${post.author.username}`)
              }
            >
              {getInitials(post.author.username)}
            </div>
          )} */}
          <div
            className="rounded-full bg-blue-500 text-white text-xs font-semibold shadow shadow-neutral-200"
            onClick={(e) => handleAuthorClick(e, `/user/${post.author.username}`)}
          >
            <p className="w-10 h-10 flex items-center justify-center">
              {getInitials(post.author.username)}
            </p>
          </div>
          <div>
            <p
              className="w-fit text-primary-blue text-base cursor-pointer hover:underline truncate"
              onClick={(e) =>
                handleBoardClick(e, `/${getType[postType][0]}/${post.board.name}`)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleBoardClick(e, `/${getType[postType][0]}/${post.board.name}`)}
            >
              {getType[postType][0]}/{post.board.name}
            </p>
            <p className="text-[12px] flex items-center gap-1">
              <span
                onClick={(e) =>
                  handleAuthorClick(e, `/user/${post.author.username}`)
                }
                className="cursor-pointer hover:underline"
                role="link"
                tabIndex={0}
              >
                u/{post.author.username}
              </span>
              <RelativeTime date={post.created_at} className="text-neutral-500"/>
            </p>
          </div>
        </div>
        <div onClick={preventNavigation}>
          <PostMenu
            post={post}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReport={handleReport}
          />
        </div>
      </div>

      {/* Content */}
      {postType === "quiz" ? (
        <div className="group mb-3 flex justify-between items-center border-l-4 border-blue-500 bg-blue-50 p-3 px-4 rounded hover:bg-blue-100 transition-colors duration-200">
          <div>
            <p className="mb-1 font-medium">{post.title}</p>
            <p className="text-sm text-neutral-600">{post.body}</p>
          </div>
          <button
            className="ml-auto px-4 py-2 rounded bg-primary-blue text-white text-sm hover:bg-primary-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            Start
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <div>
            <p className="mb-1 font-medium">{post.title}</p>
            <p className="text-sm text-neutral-600">{post.body}</p>
          </div>
          {/* Display images if available */}
          {images.length > 0 && <PostImages images={images} />}
          {/* Display files if available */}
          {files.length > 0 && <PostFiles files={files} />}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-neutral-600 text-sm">
        <button
          className="flex items-center gap-2 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none"
          title="Comments"
          aria-label={`${post.comments_count} comments`}
        >
          <FaRegComment /> {post.comments_count}
        </button>
        <button
          className="flex items-center gap-2 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
          title={liked ? "Unlike" : "Like"}
          aria-label={`${post.likes_count} likes. ${
            liked ? "Unlike" : "Like"
          } this post`}
          onClick={onTogglePostLike}
        >
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span ref={postLikesCountRef} className={liked ? "text-red-500" : ""}>
            {post.likes_count}
          </span>
        </button>
        <button
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
          title="Share"
          onClick={(e) => {
            preventNavigation(e);
            setIsShareModalOpen(true);
          }}
        >
          <FiShare2 />
        </button>
      </div>
    </Link>

    {/* Share Modal */}
    <ShareModal
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
      postUrl={`${window.location.origin}/b/${post.board.name}/post/${post.id}`}
      postTitle={post.title}
    />

    {/* Edit Post Modal */}
    <EditPostModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      post={post}
      boardName={post.board.name}
    />

    {/* Report Post Modal */}
    <ReportModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      item={post}
      itemType="post"
    />

    {/* Delete Post Modal */}
    <DeletePostModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      board={post.board.name}
      postId={post.id}
    />
    </>
  );
};

export default PostCard;
