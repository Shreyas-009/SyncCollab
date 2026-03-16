import React, { useState } from "react";
import { Send } from "lucide-react";

const CommentForm = ({ onSubmit, isSubmitting = false }) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await onSubmit(commentText.trim());
      setCommentText("");
    } catch {
      // Error is handled by parent
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share your thoughts... (Ctrl+Enter to send)"
        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-stone-300 dark:border-white/10 rounded-lg text-stone-900 dark:text-gray-100 text-sm placeholder-stone-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 outline-none resize-none transition-all"
        rows={2}
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-600 dark:text-slate-500">
          {commentText.length} / 500
        </p>
        <button
          type="submit"
          disabled={
            !commentText.trim() || isSubmitting || commentText.length > 500
          }
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg disabled:bg-stone-300 dark:disabled:bg-white/10 disabled:text-stone-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
