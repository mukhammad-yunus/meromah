import React, { useRef, useState, useMemo } from "react";
import { FaRegComment, FaRegHeart, FaHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTogglePostLikeMutation } from "../../../services/postsApi";
import { useSelector } from "react-redux";
import RelativeTime from "../../../components/RelativeTime";
import { getFileUrl, getInitials } from "../../../utils";
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
const PostCard = ({
  item,
  isFirst,
  isLast,
  itemType = "post",
  communityType = "board",
  communityUrl = "b/"
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(item.youLiked);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const postLikesCountRef = useRef(null);
  const [togglePostLike, { error: togglePostLikeError }] =
    useTogglePostLikeMutation();

  // Separate images and files based on mimetype
  const { images, files } = useMemo(() => {
    if (!item.files || item.files.length === 0) {
      return { images: [], files: [] };
    }
    const imageFiles = item.files.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    const nonImageFiles = item.files.filter(
      (file) => !file.mimetype.startsWith("image/")
    );
    return { images: imageFiles, files: nonImageFiles };
  }, [item.files]);

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
    const community = item[communityType].name;
    const postId = item.id;
    const res = await togglePostLike({ board: community, item: postId }).unwrap();
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
  const handleStart = (e)=> {
    preventNavigation(e)
    navigate(`/${communityUrl}${item[communityType].name}/${itemType}/${item.id}/start`)
  }
  return (
    <>
      <Link
        to={`/${communityUrl}${item[communityType].name}/${itemType}/${item.id}`}
        className={`block bg-white border-x border-b border-gray-200 p-4 hover:bg-primary-bg transition-colors duration-200 ${
          isFirst && "rounded-t-lg border-t"
        } ${isLast && "rounded-b-lg"}`}
      >
        {/* Author */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden"
              onClick={(e) =>
                handleAuthorClick(e, `/user/${item.author.username}`)
              }
            >
              {item.author.avatar ? (
                <img
                  src={getFileUrl(item.author.avatar.file_hash)}
                  alt={`${item.author.username}'s profile picture`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={(e) =>
                    handleAuthorClick(e, `/user/${item.author.username}`)
                  }
                />
              ) : (
                <p className="flex items-center justify-center bg-blue-500 text-white text-xs font-semibold w-full h-full">
                  {getInitials(item.author.username)}
                </p>
              )}
            </div>
            <div>
              <p
                className="w-fit text-primary-blue text-base cursor-pointer hover:underline truncate"
                onClick={(e) =>
                  handleBoardClick(
                    e,
                    `/${communityUrl}${item[communityType].name}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleBoardClick(
                    e,
                    `/${communityUrl}${item[communityType].name}`
                  )
                }
              >
                {communityUrl}{item[communityType].name}
              </p>
              <p className="text-[12px] flex items-center gap-1">
                <span
                  onClick={(e) =>
                    handleAuthorClick(e, `/user/${item.author.username}`)
                  }
                  className="cursor-pointer hover:underline"
                  role="link"
                  tabIndex={0}
                >
                  u/{item.author.username}
                </span>
                <RelativeTime
                  date={item.created_at}
                  className="text-neutral-500"
                />
              </p>
            </div>
          </div>
          <div onClick={preventNavigation}>
            <PostMenu
              itemType={itemType}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          </div>
        </div>

        {/* Content */}
        {itemType === "test" ? (
          <div className="group mb-3 flex justify-between items-center gap-4 border-l-4 border-blue-500 bg-blue-50 p-3 px-4 rounded hover:bg-blue-100 transition-colors duration-200">
            <div className="flex-1 overflow-hidden flex flex-col gap-0.5">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-neutral-600 truncate">{item.body}</p>
            </div>
            <button
              className="block ml-auto px-4 py-2 rounded bg-primary-blue text-white text-sm hover:bg-primary-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              onClick={handleStart}
            >
              Start
            </button>
          </div>
        ) : (
          <div className="mb-3">
            <div>
              <p className="mb-1 font-medium">{item.title}</p>
              <p className="text-sm text-neutral-600">{item.body}</p>
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
            aria-label={`${item.comments_count} comments`}
          >
            <FaRegComment /> {item.comments_count}
          </button>
          <button
            className="flex items-center gap-2 hover:text-neutral-900 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none cursor-pointer"
            title={liked ? "Unlike" : "Like"}
            aria-label={`${item.likes_count} likes. ${
              liked ? "Unlike" : "Like"
            } this item`}
            onClick={onTogglePostLike}
          >
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span
              ref={postLikesCountRef}
              className={liked ? "text-red-500" : ""}
            >
              {item.likes_count}
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
        itemUrl={`${window.location.origin}/b/${item[communityType].name}/${itemType}/${item.id}`}
        itemTitle={item.title}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={item}
        boardName={item[communityType].name}
      />

      {/* Report Post Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        item={item}
        itemType={itemType}
      />

      {/* Delete Post Modal */}
      <DeletePostModal
        communityType={communityType}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        communityName={item[communityType].name}
        itemId={item.id}
      />
    </>
  );
};

export default PostCard;
