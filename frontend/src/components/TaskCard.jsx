import React, { useState } from 'react';
import Priority from './Priority';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2 } from 'lucide-react';

const TaskCard = ({ task, index, onDelete, onEdit, onView }) => {
  const priority = task.priority;
  const hasDescription = task.description && task.description.trim() !== '';

  return (
    <Draggable draggableId={task._id} index={index}>
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
            <h4 className="text-base font-semibold wrap-break-word flex-1 text-stone-800 dark:text-gray-100 leading-snug">
              {task.title}
            </h4>
            
            {/* Action Buttons */}
            <div className={`flex gap-1 shrink-0 transition-opacity duration-200 ${snapshot.isDragging ? 'opacity-0' : 'md:opacity-0 group-hover:opacity-100 opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 transition-colors"
                title="Edit Task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors"
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

          {/* Footer Row */}
          <div className='flex items-center justify-between mt-auto'>
            {/* View More Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onView(task); }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 transition-colors"
            >
                View details
            </button>
            
            <div className="flex items-center gap-2">
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
                
                {/* Priority Badge */}
                <div className="scale-90 origin-right">
                  <Priority name={priority} />
                </div>
            </div>
          </div>
        </article>
      )}
    </Draggable>
  )
}

export default TaskCard;