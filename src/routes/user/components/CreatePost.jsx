import React, { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Image, X, Paperclip, RotateCw } from "lucide-react";
import { getFile, getImage } from "../../../utils";
import { useUploadPostFilesMutation } from "../../../services/fileApi";
import { useCreatePostMutation } from "../../../services/postsApi";
import CommunitySelection from "./CommunitySelection";
import { useNavigate } from "react-router-dom";
import AutoResizeTextarea from "./AutoResizeTextarea";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";

// Helper function to extract error message from API error response
const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  if (typeof error === "string") return error;
  return (
    error.data?.message ??
    error.data?.error ??
    error.message ??
    error.error ??
    error.response?.data?.message ??
    "An unexpected error occurred. Please try again."
  );
};

const CreatePost = ({ boardId, onCancel = undefined, onError }) => {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedBoardNameRef = useRef(null);
  const boardSelectionResetRef = useRef(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPreviewOn, setIsPreviewOn] = useState(false);
  const uploadingIds = useRef(new Set());
  const fileHashes = useRef(new Array());

  const [uploadPostFiles] = useUploadPostFilesMutation();
  const [createPost] = useCreatePostMutation();
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

  const handleSelectBoard = (board) => {
    selectedBoardNameRef.current = board.name;
  };

  const handleClearBoardSelection = () => {
    selectedBoardNameRef.current = null;
  };
  useEffect(() => {
    const hasBoard = boardId || selectedBoardNameRef.current;
    setIsFormValid(
      postTitle.trim().length > 0 && postBody.trim().length > 0 && hasBoard
    );
  }, [selectedBoardNameRef.current, postTitle, postBody, boardId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
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
    try {
      await createPost({ board: targetBoardId, postData }).unwrap();
      // Reset form
      onResetPostForm();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const onResetPostForm = () => {
    setPostTitle("");
    setPostBody("");
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setUploadedFiles([]);
    setIsFormValid(false);
    setIsPreviewOn(false);
    selectedBoardNameRef.current = null;
    uploadingIds.current.clear();
    fileHashes.current = [];
    if (boardSelectionResetRef.current) {
      boardSelectionResetRef.current();
    }
    if (onCancel) {
      onCancel();
    } else if (!(boardId && onCancel)) {
      navigate("/home");
    }
  };

  const handleTitleChange = (e) => {
    setPostTitle(e.target.value || "");
  };

  const handleBodyChange = (e) => {
    setPostBody(e.target.value || "");
  };
  return (
    <form
      onSubmit={handlePostSubmit}
      className={`p-4 space-y-4 ${
        !boardId &&
        "bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 m-6"
      }`}
    >
      {/* Board Selection - only show when boardId is not provided */}
      {!boardId && (
        <CommunitySelection
          communityName={boardId}
          communityType={"board"}
          onSelectCommunity={handleSelectBoard}
          disabled={false}
          onClearSelection={handleClearBoardSelection}
          resetRef={boardSelectionResetRef}
        />
      )}

      {/* Preview/Edit Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900/50 dark:text-neutral-100">
          Markdown supported
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOn(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-none transition-colors ${
              !isPreviewOn
                ? "text-primary-blue dark:text-blue-400 border border-primary-blue dark:border-blue-400 bg-primary-blue/5 dark:bg-blue-400/10"
                : "text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOn(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-none transition-colors ${
              isPreviewOn
                ? "text-primary-blue dark:text-blue-400 border border-primary-blue dark:border-blue-400 bg-primary-blue/5 dark:bg-blue-400/10"
                : "text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {!isPreviewOn ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Post Title *
            </label>
            <input
              type="text"
              value={postTitle}
              placeholder="Post title"
              onChange={handleTitleChange}
              className="w-full px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Post Body *
            </label>
            <AutoResizeTextarea
              value={postBody}
              placeholder="What's on your mind?"
              onChange={handleBodyChange}
              className="w-full min-h-[120px] px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-y"
            />
          </div>
        </>
      ) : (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
          {postTitle && (
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
              {postTitle}
            </h2>
          )}
          <MarkdownViewer>{postBody || "*No content yet*"}</MarkdownViewer>
        </div>
      )}

      {/* Attachment Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Image className="w-4 h-4" />
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
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
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
              className={`relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 ${
                image.error && "ring-2 ring-red-500 dark:ring-red-600"
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
                  className="absolute top-2 right-2 p-1 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  <RotateCw className="w-7 h-7" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 dark:bg-red-600 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 hover:bg-red-600 dark:hover:bg-red-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-black/70 text-white text-xs p-2 truncate">
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
              className={`flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                file.isUploading && "animate-pulse"
              } ${file.error && "ring-2 ring-red-500 dark:ring-red-600"}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
                <span className="text-sm text-neutral-700 dark:text-neutral-200 truncate">
                  {file.name}
                </span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              {file.error ? (
                <button
                  type="button"
                  onClick={() => handleReUpload(file, i, setUploadedFiles)}
                  className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={onResetPostForm}
          className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className="px-4 py-2 text-sm bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
