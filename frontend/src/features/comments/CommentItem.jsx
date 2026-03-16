import React, { useState, useEffect, useRef } from "react";
import {
  Edit2,
  Trash2,
  Check,
  X,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DeleteConfirmation from "../../components/DeleteConfirmation";

const CommentItem = ({ comment, onEdit, onDelete, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentText);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  const isOwner = comment.userId === currentUserId;
  const isCommentLong =
    comment.commentText.split("\n").length > 3 ||
    comment.commentText.length > 150;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleEdit = async () => {
    if (isEditing) {
      if (editText.trim() && editText !== comment.commentText) {
        await onEdit(comment._id, editText.trim());
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setShowMenu(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.commentText);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      setShowDeleteConfirm(false);
    } catch {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="group flex gap-3 pb-4 border-b border-stone-200 dark:border-white/5 last:border-b-0 last:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {comment.userImage ? (
            <img
              src={comment.userImage}
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-300 dark:ring-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-white/5 flex items-center justify-center ring-1 ring-stone-300 dark:ring-white/10">
              <span className="text-xs font-semibold text-purple-700 dark:text-slate-300">
                {comment.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-stone-900 dark:text-gray-100 truncate">
                {comment.userName}
              </span>
              <span className="text-xs text-stone-500 dark:text-slate-400 whitespace-nowrap">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Action Menu - Always visible on mobile, visible on hover on desktop, hidden during edit */}
            {isOwner && !isDeleting && !isEditing && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-1.5 transition-all rounded-lg hover:bg-stone-200 dark:hover:bg-white/5 ${
                    showMenu
                      ? "opacity-100 text-stone-700 dark:text-slate-300"
                      : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-stone-600 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300"
                  }`}
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#111114] border border-stone-200 dark:border-white/10 rounded-lg shadow-2xl z-[9999] min-w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        handleEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm flex items-center gap-2 text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border-b border-stone-100 dark:border-white/5"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm flex items-center gap-2 text-stone-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Text or Edit */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-white/5 border border-stone-300 dark:border-white/10 rounded-lg text-stone-900 dark:text-gray-100 text-sm placeholder-stone-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 outline-none resize-none"
                rows={2}
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-200 dark:bg-white/5 text-stone-700 dark:text-slate-300 hover:bg-stone-300 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p
                className={`text-sm text-stone-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words ${
                  !isExpanded && isCommentLong ? "line-clamp-3" : ""
                }`}
              >
                {comment.commentText}
              </p>
              {isCommentLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show more
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        processingLabel="Deleting..."
        isProcessing={isDeleting}
        taskTitle="comment" 
      />
    </>
  );
};

export default CommentItem;
