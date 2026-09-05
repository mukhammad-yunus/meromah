import { useState } from "react";
import { Send } from "lucide-react";
import { useSelector } from "react-redux";

const CommentForm = ({ onSubmit, isLoading }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit(e, null, newComment, setNewComment);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
          U
        </div>
      </div>
      <div className="flex-1 flex items-end gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (newComment.trim()) {
                handleSubmit(e);
              }
            }
          }}
          placeholder="Add a comment..."
          rows={1}
          className="flex-1 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-none overflow-hidden"
          style={{
            minHeight: "40px",
            maxHeight: "120px",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isLoading}
          className="px-4 h-10 bg-primary-blue dark:bg-neutral-100 dark:border dark:border-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:bg-primary-blue/90 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-400 dark:disabled:border-neutral-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CommentForm;
