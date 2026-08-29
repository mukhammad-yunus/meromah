import React, { useRef, useState, useMemo } from "react";
import {
  MessageCircle,
  Heart,
  Share2,
  Play,
  FileQuestion,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTogglePostLikeMutation } from "../../../services/postsApi";
import { useDispatch, useSelector } from "react-redux";
import RelativeTime from "../../../components/RelativeTime";
import UserAvatar from "../../../components/UserAvatar";
import PostImages from "./PostImages";
import PostFiles from "./PostFiles";
import ShareModal from "./ShareModal";
import PostMenu from "./PostMenu";
import EditPostModal from "./EditPostModal";
import ReportModal from "./ReportModal";
import DeletePostModal from "./DeletePostModal";
import { useToggleTestLikeMutation } from "../../../services/testsApi";
import { resetSession } from "../../../app/testSessionSlice";
import PostCardMarkdownViewer from "../../../components/markdownViewer/PostCardMarkdownViewer";
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
  communityUrl = "b/",
  onError,
  isLiked = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(isLiked);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const postLikesCountRef = useRef(null);
  const [togglePostLike, { isLoading: isTogglePostLikeLoading }] =
    useTogglePostLikeMutation();
  const [toggleTestLike, { isLoading: isToggleTestLikeLoading }] =
    useToggleTestLikeMutation();
  const isLoading = isTogglePostLikeLoading || isToggleTestLikeLoading;
  // Separate images and files based on mimetype
  const { images, files } = useMemo(() => {
    if (!item.files || item.files.length === 0) {
      return { images: [], files: [] };
    }
    const validFiles = item.files.filter((file) => file && file.mimetype);
    const imageFiles = validFiles.filter((file) =>
      file.mimetype.startsWith("image/"),
    );
    const nonImageFiles = validFiles.filter(
      (file) => !file.mimetype.startsWith("image/"),
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
    if (isLoading) return;
    try {
      const community = item[communityType].name;
      const itemId = item.id;
      const toggleLike = itemType === "test" ? toggleTestLike : togglePostLike;
      setLiked((prev) => !prev);
      const res = await toggleLike({
        [communityType]: community,
        [itemType]: itemId,
      }).unwrap();
      postLikesCountRef.current.textContent = res.toggle
        ? Number(postLikesCountRef.current.textContent) + 1
        : Number(postLikesCountRef.current.textContent) - 1;
    } catch (err) {
      onError({ message: err.data.message });
      setLiked((prev) => !prev);
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
  const onStartTest = (e) => {
    preventNavigation(e);
    dispatch(resetSession());
    navigate(
      `/${communityUrl}${item[communityType].name}/${itemType}s/${item.id}/start`,
    );
  };
  return (
    <>
      <section
        className={`block bg-white dark:bg-neutral-900 border-x border-b border-neutral-200 dark:border-neutral-700 ${
          isFirst ? "rounded-t-lg border-t" : isLast ? "rounded-b-lg" : ""
        }`}
        key={`${itemType}-${item.id}-${item.title}`}
      >
        {/* Header */}
        <header className="relative flex items-start justify-between p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <button
              onClick={(e) =>
                item.author &&
                handleAuthorClick(e, `/u/${item.author.username}`)
              }
              className="w-10 h-10 rounded-full overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 cursor-pointer"
            >
              <UserAvatar
                hash={item.author?.avatar?.file_hash}
                alt={`${item?.author?.username}'s profile picture`}
                loading="lazy"
              />
            </button>

            {/* User + Community */}
            <div className="max-w-52 sm:max-w-full flex flex-col gap-0.5">
              <button
                className="w-full text-primary-blue text-base text-start cursor-pointer hover:underline truncate focus:outline-none dark:text-neutral-200 dark:font-semibold"
                onClick={(e) =>
                  handleBoardClick(
                    e,
                    `/${communityUrl}${item[communityType].name}`,
                  )
                }
              >
                {communityUrl + item[communityType].name}
              </button>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                {item?.author !== null ? (
                  <button
                    onClick={(e) =>
                      handleAuthorClick(e, `/u/${item.author.username}`)
                    }
                    className="cursor-pointer hover:underline focus:outline-none"
                  >
                    u/{item.author.username}
                  </button>
                ) : (
                  <span className="dark:text-neutral-400">[deleted]</span>
                )}
                <RelativeTime
                  date={item.created_at}
                  className="text-neutral-500 dark:text-neutral-400"
                />
              </p>
            </div>
          </div>

          {/* Post Menu */}
          <div className="absolute top-0 right-0" onClick={preventNavigation}>
            <PostMenu
              itemType={itemType}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          </div>
        </header>

        {/* Content */}
        {itemType === "test" ? (
          <div
            className="flex flex-col gap-2 p-4 hover:bg-primary-bg dark:hover:bg-neutral-800 transition-colors duration-200 cursor-pointer"
            onClick={() =>
              navigate(
                `/${communityUrl}${item[communityType].name}/${itemType}/${item.id}`,
              )
            }
          >
            <div>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                {item.title}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  <span>{item.questions_count} questions</span>
                </div>
                {item.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.duration} min</span>
                  </div>
                )}
                {item.submissions_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item.submissions_count} {item.submissions_count === 1 ? 'submission' : 'submissions'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col gap-2 p-4 hover:bg-primary-bg dark:hover:bg-neutral-800 transition-colors duration-200 cursor-pointer"
            onClick={() =>
              navigate(
                `/${communityUrl}${item[communityType].name}/${itemType}/${item.id}`,
              )
            }
          >
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                {item.title}
              </h2>
              <PostCardMarkdownViewer
                isExpanded={false}
                maxLines={10}
                onReadMore={(e) => {
                  preventNavigation(e);
                  navigate(
                    `/${communityUrl}${item[communityType].name}/${itemType}/${item.id}`,
                  );
                }}
              >
                {item.body}
              </PostCardMarkdownViewer>
            </div>

            {images.length > 0 && <PostImages images={images} />}
            {files.length > 0 && <PostFiles files={files} />}
          </div>
        )}

        {/* Actions */}
        <footer className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:gap-0 justify-between p-4">
          <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-200 text-sm">
            <button
              className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 p-2 -m-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 cursor-pointer"
              title="Comments"
              aria-label={`${item.comments_count} comments`}
              onClick={() =>
                navigate(
                  `/${communityUrl}${item[communityType].name}/${itemType}/${item.id}`,
                )
              }
            >
              <MessageCircle size={18} /> {item.comments_count}
            </button>

            <button
              onClick={onTogglePostLike}
              className={`${
                isLoading ? "animate-pulse" : ""
              } flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 cursor-pointer`}
              aria-label={`${item.likes_count} likes. ${
                liked ? "Unlike" : "Like"
              } this item`}
              title={liked ? "Unlike" : "Like"}
            >
              <Heart
                size={18}
                className={liked ? "text-red-500 fill-red-500" : ""}
              />
              <span
                ref={postLikesCountRef}
                className={liked ? "text-red-500" : ""}
              >
                {item.likes_count}
              </span>
            </button>

            <button
              className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 p-2 -m-2 rounded transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40"
              title="Share"
              onClick={(e) => {
                preventNavigation(e);
                setIsShareModalOpen(true);
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
          {itemType === "test" && (
            <button
              className="rounded bg-primary-blue text-white text-sm hover:bg-primary-blue/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-neutral-100 dark:text-neutral-900 font-medium cursor-pointer dark:hover:bg-neutral-900 dark:hover:text-neutral-100 px-6 py-2 flex items-center gap-2 justify-center border border-primary-blue  dark:border-neutral-100"
              onClick={onStartTest}
            >
              <Play className="w-4 h-4" />
              <span> Start Test</span>
            </button>
          )}
        </footer>
      </section>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemUrl={`${window.location.origin}/${communityType[0]}/${item[communityType].name}/${itemType}/${item.id}`}
        itemTitle={item.title}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
        community={item[communityType].name}
        itemType={itemType}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        item={item}
        itemType={itemType}
      />

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

export default React.memo(PostCard);
