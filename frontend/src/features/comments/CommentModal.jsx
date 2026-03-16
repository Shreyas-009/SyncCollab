import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, MessageCircle, AlertCircle } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import CommentSkeleton from "./CommentSkeleton";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "./commentsApi";

const CommentModal = ({ isOpen, onClose, task, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(task._id);
      setComments(data);
    } catch {
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (isOpen && task?._id) {
      loadComments();
    }
  }, [isOpen, task?._id, loadComments]);

  const handleCreateComment = async (commentText) => {
    setSubmitting(true);
    setError(null);
    try {
      const newComment = await createComment(task._id, commentText);
      setComments((prev) => [...prev, newComment]);
      // Auto-scroll to newly added comment
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
    } catch {
      setError("Failed to add comment. Please try again.");
      throw new Error("Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, commentText) => {
    try {
      const updatedComment = await updateComment(commentId, commentText);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                commentText: updatedComment.commentText,
                updatedAt: updatedComment.updatedAt,
              }
            : comment,
        ),
      );
    } catch {
      setError("Failed to update comment.");
      throw new Error("Update failed");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );
    } catch {
      setError("Failed to delete comment.");
      throw new Error("Delete failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-stone-50 dark:bg-[#111114] border border-stone-200 dark:border-white/5 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-white/5 bg-stone-100 dark:bg-white/5 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-100 dark:from-purple-500/10 to-purple-200 dark:to-purple-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-stone-900 dark:text-gray-100 truncate">
                Discussion
              </h2>
              <p className="text-xs text-stone-600 dark:text-slate-400 truncate">
                on "{task?.title || "Task"}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 dark:hover:bg-white/10 rounded-lg transition-all text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 flex-shrink-0"
            title="Close discussion"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0c0c0e]"
        >
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-600/10 border border-red-300 dark:border-red-600/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-2 font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <CommentSkeleton />
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-stone-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-stone-500 dark:text-slate-500" />
                </div>
                <h3 className="text-sm font-medium text-stone-600 dark:text-slate-400">
                  No comments yet
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-500 mt-1">
                  Be the first to share your thoughts
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onEdit={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-stone-200 dark:border-white/5 bg-stone-100 dark:bg-white/5 backdrop-blur px-6 py-5">
          <CommentForm
            onSubmit={handleCreateComment}
            isSubmitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
