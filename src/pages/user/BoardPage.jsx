import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { FiX } from "react-icons/fi";
import { IoMdAttach } from "react-icons/io";
import { getFile, getImage } from "../../utils";
import { useUploadPostFilesMutation } from "../../services/fileApi";
import { IoReload } from "react-icons/io5";
import useSortBy from "../../hooks/useSortBy";

const BoardPage = () => {
  const { boardId } = useParams();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get current user from Redux
  const { profileData } = useSelector((state) => state.myProfile);
  const username = useMemo(()=>profileData?.username ||null, [profileData])
  const { isAuthenticated } = useSelector((state) => state.auth);
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
  
  // Use custom hook for sorting
  const { sortBy, SortByComponent, emptyStateMessages } = useSortBy(
    isAuthenticated, username
  );
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
  } = useGetPostsForBoardQuery({ board: boardId, queryParams: sortBy });
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
    handleUpload(uploadedFiles, setUploadedFiles);
  }, [uploadedFiles]);
  useEffect(() => {
    handleUpload(uploadedImages, setUploadedImages);
  }, [uploadedImages]);
  const handleUpload = (upload, setUpload) => {
    upload.forEach(async (item) => {
      if (item.isUploading && !uploadingIds.current.has(item.id)) {
        uploadingIds.current.add(item.id);
        try {
          const res = await uploadPostFiles([
            { file: item.file, id: item.id },
          ]).unwrap();
          if (res.files && Array.isArray(res.files)) {
            res.files.forEach((fileObj) => {
              fileHashes.current.push(fileObj);
            });
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
  const handleReUpload = async (item, index, setUpload) => {
    try {
      const res = await uploadPostFiles([
        { file: item.file, id: item.id },
      ]).unwrap();
      if (res.files && Array.isArray(res.files)) {
        res.files.forEach((fileObj) => {
          fileHashes.current.push(fileObj);
        });
      }
      setUpload((prev) => {
        const element = prev[index];
        prev[index] = { ...element, error: false }
        return prev;
      });
    } catch (err) {
      setUpload((prev) => {
        const element = prev[index];
        prev[index] = { ...element, error: true }
        return prev;
      });
    }
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
    const file_hashes = fileHashes.current.map(hash=> Object.values(hash)[0])
    e.preventDefault();
    const postData = {
      title: postTitle,
      body: postBody,
      file_hashes
    };

    await createPost({ board: boardId, postData });
    // Reset form
    onResetPostForm();
  };
  const onResetPostForm = () => {
    setPostTitle("");
    setPostBody("");
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setUploadedFiles([]);
    setShowCreatePost(false);
    uploadingIds.current.clear();
    fileHashes.current = [];
  };

  const onShowCreatePost = () => {
    if (!isAuthenticated) return navigate("/login");
    setShowCreatePost(true);
  };

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
                onClick={onShowCreatePost}
                className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white flex-shrink-0"
              >
                <p className="w-11 h-11 flex items-center justify-center rounded-full">
                  {getInitials(isAuthenticated ? profileData?.name : "User")}
                </p>
              </div>

              {/* Placeholder Text */}
              <div
                onClick={onShowCreatePost}
                className="flex-1 px-4 py-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
              >
                What is on your mind, {profileData?.username || "User"}?
              </div>

              {/* Attachment Icon */}
              <button
                onClick={onShowCreatePost}
                className="p-2 text-neutral-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Attach file"
              >
                <IoMdAttach className="w-5 h-5" />
              </button>
            </div>
          ) : isAuthenticated ? (
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
                  {uploadedImages.map((image, i) => (
                    <div
                      key={image.id}
                      className={`relative group rounded-lg overflow-hidden border border-neutral-200 ${
                        image.error && "ring-2 ring-red-500"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover"
                      />
                      {image.error ? (
                        <button
                          type="button"
                          onClick={() => handleReUpload(image, i, setUploadedImages)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <IoReload className="w-7 h-7" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
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
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 bg-neutral-50 rounded-lg border border-neutral-200 ${
                        file.isUploading && "animate-pulse"
                      } ${
                        file.error && "ring-2 ring-red-500"
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
                      {file.error? <button
                        type="button"
                        onClick={() => handleReUpload(file, i, setUploadedFiles)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <IoReload className="w-4 h-4" />
                      </button>:<button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </button>}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onResetPostForm}
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
          ) : null}
        </div>

        {/* Sorting/Filtering Controls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Posts</h2>
          <SortByComponent />
        </div>

        {/* Posts Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {postData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <FaRegFileAlt className="text-4xl text-neutral-700" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {emptyStateMessages.title}
              </h3>
              <p className="text-neutral-600 text-sm text-center max-w-sm">
                {emptyStateMessages.message}
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
                    postType="post"
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
