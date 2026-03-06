import React, { useState } from 'react';
import Priority from './Priority';
import { Draggable } from '@hello-pangea/dnd';

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
          className={`w-full flex flex-col justify-between min-h-[110px] border rounded-xl p-4 my-3 mx-0 overflow-hidden shadow-sm transition-all duration-200 group 
            ${snapshot.isDragging 
              ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/30 dark:border-purple-500 scale-[1.02] shadow-xl z-50' 
              : 'bg-white border-stone-200 hover:border-stone-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
        >
          {/* Header Row */}
          <div className='flex items-start justify-between gap-3'>
            <h4 className="text-base font-semibold wrap-break-word flex-1 text-stone-800 dark:text-gray-100 leading-snug">
              {task.title}
            </h4>
            
            {/* Action Buttons */}
            <div className={`flex gap-1 shrink-0 transition-opacity duration-200 ${snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 transition-colors"
                title="Edit Task"
              >
                <i className="bi bi-pencil-square text-sm"></i>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors"
                title="Delete Task"
              >
                <i className="bi bi-trash text-sm"></i>
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
          <div className="h-[1px] w-full bg-stone-100 dark:bg-gray-700/50 my-3"></div>

          {/* Footer Row */}
          <div className='flex items-center justify-between mt-auto'>
            {/* View More Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onView(task); }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 transition-colors"
            >
                View details
            </button>
            
            {/* Priority Badge */}
            <div className="scale-90 origin-right">
              <Priority name={priority} />
            </div>
          </div>
        </article>
      )}
    </Draggable>
  )
}

export default TaskCard;