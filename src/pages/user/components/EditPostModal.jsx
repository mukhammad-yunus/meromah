import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useUpdatePostMutation } from "../../../services/postsApi";

const EditPostModal = ({ isOpen, onClose, post, boardName }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [updatePost, { isLoading }] = useUpdatePostMutation();

  useEffect(() => {
    if (isOpen && post) {
      setTitle(post.title || "");
      setBody(post.body || "");
    }
  }, [isOpen, post]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!title.trim() || !body.trim()) {
      return;
    }

    try {
      await updatePost({
        board: boardName,
        post: post.id,
        postData: { title: title.trim(), body: body.trim() },
      }).unwrap();
      onClose(e);
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (!isLoading) {
      onClose(e);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm cursor-default"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit post</h2>
          <p className="text-sm text-gray-500 mt-1">Update your post title and content</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <label className="flex flex-col gap-2">
              <span className="font-medium text-neutral-800">Title *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                required
                disabled={isLoading}
                maxLength={200}
              />
            </label>

            {/* Body Textarea */}
            <label className="flex flex-col gap-2">
              <span className="font-medium text-neutral-800">Content *</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-gray-400 resize-none overflow-auto"
                required
                disabled={isLoading}
                maxLength={1000}
                
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {body.length}/1000 characters
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !body.trim() || isLoading}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;

