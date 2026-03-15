import React from "react";

const CommentSkeleton = () => {
  return (
    <div className="space-y-5">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex gap-3 pb-4 border-b border-stone-200 dark:border-slate-700/30 last:border-b-0 animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="w-8 h-8 bg-stone-200 dark:bg-slate-700/50 rounded-full flex-shrink-0"></div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 bg-stone-200 dark:bg-slate-700/50 rounded w-24"></div>
              <div className="h-3.5 bg-stone-200 dark:bg-slate-700/30 rounded w-12"></div>
            </div>

            {/* Text skeleton */}
            <div className="space-y-1.5">
              <div className="h-4 bg-stone-200 dark:bg-slate-700/40 rounded w-full"></div>
              <div className="h-4 bg-stone-200 dark:bg-slate-700/40 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSkeleton;
