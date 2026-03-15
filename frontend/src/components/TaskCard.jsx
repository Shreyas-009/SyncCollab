import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, SignalHigh, SignalMedium, SignalLow, MessageCircle } from 'lucide-react';
import { TASK_TYPES } from './TaskForm';

const TASK_TYPE_BADGE = {
    'feature':       { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    'bug-fix':       { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300' },
    'design':        { bg: 'bg-pink-100 dark:bg-pink-900/30',     text: 'text-pink-700 dark:text-pink-300' },
    'refactor':      { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
    'testing':       { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    'documentation': { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-300' },
    'other':         { bg: 'bg-stone-100 dark:bg-slate-700',      text: 'text-stone-500 dark:text-slate-400' },
};

const TaskCard = ({ task, index, onDelete, onEdit, onView, onComments, isBusy = false }) => {
  const priority = task.priority;
  const hasDescription = task.description && task.description.trim() !== '';
  const typeInfo = TASK_TYPES.find(t => t.value === task.taskType);
  const typeBadge = TASK_TYPE_BADGE[task.taskType] || TASK_TYPE_BADGE.other;

  // Due date logic
  const now = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < now && task.status !== 'completed';
  const dueDateLabel = dueDate
    ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <Draggable draggableId={task._id} index={index} isDragDisabled={isBusy}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`w-full flex flex-col justify-between min-h-[90px] border rounded-xl p-3 my-2 mx-0 overflow-hidden shadow-sm transition-all duration-[0ms] group
            ${snapshot.isDragging
              ? 'bg-white border-purple-500 ring-2 ring-purple-500/20 dark:bg-slate-800 dark:border-purple-500 scale-[1.05] shadow-2xl z-[9999]'
              : 'bg-white border-stone-200 hover:border-stone-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
        >
          {/* Header Row */}
          <div className='flex items-start justify-between gap-3'>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-base font-semibold wrap-break-word text-stone-800 dark:text-gray-100 leading-snug line-clamp-2">
                {task.title}
              </h4>
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-1 shrink-0 transition-opacity duration-200 ${snapshot.isDragging ? 'opacity-0' : 'md:opacity-0 group-hover:opacity-100 opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                disabled={isBusy}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Edit Task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                disabled={isBusy}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description Snippet */}
          {hasDescription && (
            <div className='mt-2.5 overflow-hidden'>
              <p className='text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-stone-500 dark:text-gray-400 line-clamp-2'>
                {task.description}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="h-[1px] w-full bg-stone-100 dark:bg-gray-700/50 my-2.5"></div>

          {/* Chips Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {/* Task Type Badge */}
              {typeInfo && (
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.bg} ${typeBadge.text}`}>
                  <span>{typeInfo.label}</span>
                </div>
              )}

              {/* Due Date chip */}
              {dueDateLabel && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-stone-100 text-stone-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                      {dueDateLabel} {isOverdue && '(Overdue)'}
                  </span>
              )}
          </div>

          {/* Footer Row */}
          <div className='flex items-center justify-between mt-auto'>
            {/* View More Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onView(task); }}
                disabled={isBusy}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                View details
            </button>

            <div className="flex items-center gap-2">
                {isBusy && (
                    <span className="w-4 h-4 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
                )}

                {/* Comments Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onComments(task); }}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-600/20 dark:text-purple-300 dark:hover:bg-purple-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="View Comments"
                >
                    <MessageCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    {/* <span>Comments</span> */}
                </button>

{/* Priority Icon */}
                <div title={`Priority: ${priority}`} className={`flex items-center ml-0.5 p-1 rounded-sm ${priority === 'high' ? 'bg-red-100 dark:bg-red-900/40' : priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}>
                    {priority === 'high' ? (
                        <SignalHigh className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={3} />
                    ) : priority === 'medium' ? (
                        <SignalMedium className="w-4 h-4 text-orange-600 dark:text-orange-400" strokeWidth={3} />
                    ) : (
                        <SignalLow className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={3} />
                    )}
                </div>

                {/* Assignee Avatar */}
                {task.assignedTo && (
                    <div className="flex -space-x-1 overflow-hidden" title={`Assigned to ${task.assignedToName || 'Unknown'}`}>
                        {task.assignedToImage ? (
                            <img src={task.assignedToImage} alt={task.assignedToName} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" />
                        ) : (
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-white dark:ring-slate-800 dark:bg-indigo-900">
                                <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                                    {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : '?'}
                                </span>
                            </div>
                        )}
                    </div>
                )}

            </div>
          </div>
        </article>
      )}
    </Draggable>
  )
}

export default TaskCard;
