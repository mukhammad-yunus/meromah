import React, { useState, useRef, useEffect } from "react";
import { FaFileAlt, FaImage } from "react-icons/fa";
import { FiX, FiSearch } from "react-icons/fi";
import { IoMdAttach } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { getFile, getImage } from "../../../utils";
import { useUploadPostFilesMutation } from "../../../services/fileApi";
import { useCreatePostMutation } from "../../../services/postsApi";
import { useSearchBoardsQuery } from "../../../services/boardsApi";

const CreatePost = ({ boardId, onCancel = undefined }) => {
  const postTitleRef = useRef(null);
  const postBodyRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const boardSearchRef = useRef(null);
  const boardDropdownRef = useRef(null);
  const selectedBoardNameRef = useRef(null);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const uploadingIds = useRef(new Set());
  const fileHashes = useRef(new Array());

  const [uploadPostFiles] = useUploadPostFilesMutation();
  const [createPost] = useCreatePostMutation();

  // Search boards when boardId is not provided
  const { data: boardsData, isLoading: isBoardsLoading } = useSearchBoardsQuery(
    !boardId && boardSearchQuery.trim().length > 0
      ? { search: boardSearchQuery.trim() }
      : undefined,
    { skip: boardId || boardSearchQuery.trim().length === 0 }
  );
  useEffect(() => {
    handleUpload(uploadedFiles, setUploadedFiles);
  }, [uploadedFiles]);

  useEffect(() => {
    handleUpload(uploadedImages, setUploadedImages);
  }, [uploadedImages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        boardDropdownRef.current &&
        !boardDropdownRef.current.contains(event.target) &&
        boardSearchRef.current &&
        !boardSearchRef.current.contains(event.target)
      ) {
        setShowBoardDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        prev[index] = { ...element, error: false };
        return prev;
      });
    } catch (err) {
      setUpload((prev) => {
        const element = prev[index];
        prev[index] = { ...element, error: true };
        return prev;
      });
    }
  };

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
    fileHashes.current = fileHashes.current.filter((obj) => {
      const key = Object.keys(obj)[0];
      return key !== String(imageId);
    });

    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeFile = (fileId) => {
    fileHashes.current = fileHashes.current.filter((obj) => {
      const key = Object.keys(obj)[0];
      return key !== String(fileId);
    });
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const checkFormValidity = () => {
    const postTitle = postTitleRef.current?.value?.trim() || "";
    const postBody = postBodyRef.current?.value?.trim() || "";
    const hasBoard = boardId || selectedBoardNameRef.current;
    setIsFormValid(
      postTitle.length > 0 && postBody.length > 0 && hasBoard
    );
  };

  const handleBoardSearch = (e) => {
    const query = e.target.value;
    setBoardSearchQuery(query);
    setShowBoardDropdown(query.trim().length > 0);

    // Reset selection if user clears the input
    if (query.trim().length === 0) {
      setSelectedBoard(null);
      selectedBoardNameRef.current = null;
      checkFormValidity();
    }
  };

  const handleSelectBoard = (board) => {
    setSelectedBoard(board);
    selectedBoardNameRef.current = board.name;
    setBoardSearchQuery(`b/${board.name}`);
    setShowBoardDropdown(false);
    checkFormValidity();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const postTitle = postTitleRef.current?.value || "";
    const postBody = postBodyRef.current?.value || "";
    const targetBoardId = boardId || selectedBoardNameRef.current;

    if (!postTitle.trim() || !postBody.trim() || !targetBoardId) {
      return;
    }

    const file_hashes = fileHashes.current.map(
      (hash) => Object.values(hash)[0]
    );

    const postData = {
      title: postTitle,
      body: postBody,
      file_hashes,
    };

    await createPost({ board: targetBoardId, postData });

    // Reset form
    onResetPostForm();
  };

  const onResetPostForm = () => {
    if (postTitleRef.current) postTitleRef.current.value = "";
    if (postBodyRef.current) postBodyRef.current.value = "";
    if (boardSearchRef.current) boardSearchRef.current.value = "";
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setUploadedFiles([]);
    setIsFormValid(false);
    setBoardSearchQuery("");
    setSelectedBoard(null);
    setShowBoardDropdown(false);
    selectedBoardNameRef.current = null;
    uploadingIds.current.clear();
    fileHashes.current = [];
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handlePostSubmit}
      className={`p-4 space-y-4 ${
        !boardId &&
        "max-h-5/6 bg-white rounded-lg shadow-sm border border-neutral-200 m-6"
      }`}
    >
      {/* Board Selection - only show when boardId is not provided */}
      {!boardId && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-800">
            Select Board *
          </label>
          <div className="relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                ref={boardSearchRef}
                type="text"
                value={boardSearchQuery}
                onChange={handleBoardSearch}
                onFocus={() => {
                  if (boardSearchQuery.trim().length > 0) {
                    setShowBoardDropdown(true);
                  }
                }}
                placeholder="Search for a board..."
                className="w-full pl-10 pr-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
              />
            </div>
            {showBoardDropdown && (
              <div
                ref={boardDropdownRef}
                className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                {isBoardsLoading ? (
                  <div className="p-3 text-sm text-neutral-500 text-center">
                    Searching...
                  </div>
                ) : boardsData.length === 0 ? (
                  <div className="p-3 text-sm text-neutral-500 text-center">
                    No board found
                  </div>
                ) : (
                  <div className="py-1">
                    {boardsData.map((board) => (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => handleSelectBoard(board)}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {board.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900">
                            b/{board.name}
                          </div>
                          {board.description && (
                            <div className="text-xs text-neutral-500 truncate">
                              {board.description}
                            </div>
                          )}
                          <div className="text-xs text-neutral-400 mt-0.5">
                            {board.subscribers_count || 0} members •{" "}
                            {board.posts_count || 0} posts
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-800">
          Post Title *
        </label>
        <input
          ref={postTitleRef}
          type="text"
          placeholder="Post title"
          onChange={checkFormValidity}
          className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-800">
          Post Body *
        </label>
        <textarea
          ref={postBodyRef}
          placeholder="What's on your mind?"
          rows={4}
          onChange={checkFormValidity}
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
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
              } ${file.error && "ring-2 ring-red-500"}`}
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
              {file.error ? (
                <button
                  type="button"
                  onClick={() => handleReUpload(file, i, setUploadedFiles)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <IoReload className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
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
          disabled={!isFormValid}
          className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
