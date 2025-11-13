import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import PostCard from "./components/PostCard";
import BoardHeader from "../../components/BoardHeader";
import { useDispatch, useSelector } from "react-redux";
import { addRecentCommunity } from "../../app/recentCommunitiesSlice";
import {
  useCreatePostMutation,
  useGetPostsForBoardQuery,
} from "../../services/postsApi";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useGetBoardQuery } from "../../services/boardsApi";
import { FaRegFileAlt, FaFileAlt, FaImage } from "react-icons/fa";
import { FiChevronDown, FiX } from "react-icons/fi";
import { IoMdAttach } from "react-icons/io";
import { getFile, getImage } from "../../utils";
import { useUploadPostFilesMutation } from "../../services/fileApi";
const BoardPage = () => {
  const { boardId } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  // Get current user from Redux
  const { profileData } = useSelector((state) => state.myProfile);
  const currentUsername = profileData?.username;
  const currentUserName = profileData?.name || profileData?.username || "User";

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Create Post State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadingIds = useRef(new Set());
  const fileHashes = useRef(new Array());
  // Sorting/Filtering State
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const {
    data: boardData,
    error: boardError,
    isLoading: isBoardLoading,
    isError: isBoardError,
  } = useGetBoardQuery(boardId);
  const {
    data: postData,
    error: postError,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useGetPostsForBoardQuery({ board: boardId });
  const [uploadPostFiles] = useUploadPostFilesMutation();
  const [createPost] = useCreatePostMutation();
  useEffect(() => {
    if (!boardId || !pathname || boardData === undefined) return;
    dispatch(
      addRecentCommunity({
        id: `b/${boardId}`,
        title: `b/${boardId}`,
        to: pathname,
      })
    );
  }, [boardId, pathname, boardData, dispatch]);
  useEffect(() => {
    handleUpload(uploadedFiles, setUploadedFiles, uploadPostFiles);
  }, [uploadedFiles]);
  useEffect(() => {
    handleUpload(uploadedImages, setUploadedImages, uploadPostFiles);
  }, [uploadedImages]);
  const handleUpload = (upload, setUpload, apiCall) => {
    upload.forEach(async (item) => {
      if (item.isUploading && !uploadingIds.current.has(item.id)) {
        uploadingIds.current.add(item.id);
        try {
          const res = await apiCall([item.file]).unwrap();
          for (const hash of res.hash) {
            fileHashes.current.push(hash);
          }
          setUpload((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, isUploading: false } : i
            )
          );
        } catch (err) {
          setUpload((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, isUploading: false, error: true } : i
            )
          );
        } finally {
          uploadingIds.current.delete(item.id);
        }
      }
    });
  };
  // Handle file uploads
  const onImageUpload = (e) => {
    const newImages = getImage(e);
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const onFileUpload = (e) => {
    const newFiles = getFile(e);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (imageId) => {
    const imageToRemove = uploadedImages.find((img) => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      title: postTitle,
      body: postBody,
      file_hashes: fileHashes.current,
    };

    await createPost({ board: boardId, postData });
    // Reset form
    setPostTitle("");
    setPostBody("");
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setUploadedFiles([]);
    setShowCreatePost(false);
    uploadingIds.current.clear();
    fileHashes.current = [];
  };

  // Handle sorting/filtering
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setShowSortDropdown(false);
    console.log("Sorting by:", sortType);
  };

  // Sort and filter posts
  const sortedAndFilteredPosts = ()=>{
    console.log("Sort Posts")
  }

  if (isPostLoading || isBoardLoading) return <Loading />;

  if (isPostError || isBoardError) {
    const statusBoard = boardError?.status;
    const statusPost = postError?.status;
    if (statusBoard === 404 || statusPost === 404) return <NotFound />;
    return <ErrorDisplay />;
  }

  if (!boardData || !postData) return null;
  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Board Header */}
        <BoardHeader board={boardData.data} />

        {/* Create Post Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          {!showCreatePost ? (
            <div className="flex items-center gap-3 p-4">
              {/* Avatar */}
              <div
                onClick={() => setShowCreatePost(true)}
                className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white flex-shrink-0"
              >
                <p className="w-11 h-11 flex items-center justify-center rounded-full">
                  {getInitials(currentUserName)}
                </p>
              </div>

              {/* Placeholder Text */}
              <div
                onClick={() => setShowCreatePost(true)}
                className="flex-1 px-4 py-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
              >
                What is on your mind, {currentUsername || "User"}?
              </div>

              {/* Attachment Icon */}
              <button
                onClick={() => setShowCreatePost(true)}
                className="p-2 text-neutral-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Attach file"
              >
                <IoMdAttach className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handlePostSubmit} className="p-4 space-y-4">
              <div>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
                />
              </div>

              <div>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors resize-y"
                />
              </div>

              {/* Attachment Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <FaImage className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <IoMdAttach className="w-4 h-4" />
                  <span>File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border border-neutral-200"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* File Previews */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 bg-neutral-50 rounded-lg border border-neutral-200 ${
                        file.isUploading && "animate-pulse"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FaFileAlt className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-700 truncate">
                          {file.name}
                        </span>
                        <span className="block text-xs text-neutral-500 whitespace-nowrap">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePost(false);
                    setPostTitle("");
                    setPostBody("");
                    uploadedImages.forEach((img) =>
                      URL.revokeObjectURL(img.url)
                    );
                    setUploadedImages([]);
                    setUploadedFiles([]);
                  }}
                  className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!postTitle.trim() || !postBody.trim()}
                  className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Post
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sorting/Filtering Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Posts</h2>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <span>
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "hottest"
                  ? "Hottest"
                  : "My Posts"}
              </span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform ${
                  showSortDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                      sortBy === "newest"
                        ? "text-primary-blue font-medium bg-primary-blue/5"
                        : "text-neutral-700"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange("hottest")}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                      sortBy === "hottest"
                        ? "text-primary-blue font-medium bg-primary-blue/5"
                        : "text-neutral-700"
                    }`}
                  >
                    Hottest
                  </button>
                  {currentUsername && (
                    <button
                      onClick={() => handleSortChange("myPosts")}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                        sortBy === "myPosts"
                          ? "text-primary-blue font-medium bg-primary-blue/5"
                          : "text-neutral-700"
                      }`}
                    >
                      My Posts
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {sortedAndFilteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <FaRegFileAlt className="text-4xl text-neutral-700" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {sortBy === "myPosts"
                  ? "No posts from you yet"
                  : "No posts yet"}
              </h3>
              <p className="text-neutral-600 text-sm text-center max-w-sm">
                {sortBy === "myPosts"
                  ? "Start sharing your thoughts!"
                  : "Be the first to share something in this board!"}
              </p>
            </div>
          ) : (
            <div>
              {sortedAndFilteredPosts.map((post, i) => {
                const isFirst = i === 0;
                const isLast = i === sortedAndFilteredPosts.length - 1;
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
