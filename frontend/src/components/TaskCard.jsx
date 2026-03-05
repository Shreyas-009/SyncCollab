import React, { useState } from 'react'
import Priority from './Priority'
import Delete from '../assets/Delete.png'
import DeleteConfirmation from './DeleteConfirmation'
import UpdateForm from './UpdateForm'
import { useTheme } from '../context/useTheme'

const TaskCard = ({ task, onDelete, onUpdate }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();
  const priority = task.priority;

  const handleDelete = () => {
    onDelete(task._id);
  }

  const hasDescription = task.description && task.description.trim() !== '';

  return (
    <>
      <article className="w-full flex flex-col justify-between min-h-[110px] border rounded-xl p-4 my-3 mx-0 overflow-hidden bg-white border-stone-200 hover:border-stone-300 shadow-sm dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200">
        <div className='flex items-start justify-between gap-2'>
          <p className="text-base font-semibold wrap-break-word flex-1 text-stone-800 dark:text-gray-100">{task.title}</p>
          <div
            onClick={() => setShowEditDialog(true)}
            className="w-8 h-8 shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-lg group hover:bg-stone-100 dark:hover:bg-gray-700">
            <i className="bi bi-pencil-square text-base opacity-60 group-hover:opacity-100 transition-opacity text-stone-500 dark:text-gray-400"></i>
          </div>
        </div>

        {/* Description Section */}
        {hasDescription && (
          <div className='mt-2 overflow-hidden'>
            <p className={`text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-stone-500 dark:text-gray-400 ${!isExpanded ? 'line-clamp-2' : ''}`}>
              {task.description}
            </p>
            {task.description.length > 80 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs mt-1.5 font-medium transition-colors text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Creator/Updater Info */}
        {(task.createdByName || task.updatedByName) && (
          <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t text-xs border-stone-100 text-stone-500 dark:border-gray-700 dark:text-gray-400">
            {task.createdByName && (
              <div className='flex items-center gap-2'>
                {task.createdByImage ? (
                  <img src={task.createdByImage} alt={task.createdByName} className='w-5 h-5 rounded-full object-cover' />
                ) : (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                    {task.createdByName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>Created by <span className="font-medium text-stone-700 dark:text-gray-300">{task.createdByName}</span></span>
              </div>
            )}
            {task.updatedByName && (
              <div className='flex items-center gap-2'>
                {task.updatedByImage ? (
                  <img src={task.updatedByImage} alt={task.updatedByName} className='w-5 h-5 rounded-full object-cover' />
                ) : (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {task.updatedByName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>Updated by <span className="font-medium text-stone-700 dark:text-gray-300">{task.updatedByName}</span></span>
              </div>
            )}
          </div>
        )}

        <div className='flex items-center justify-between mt-3'>
          <Priority name={priority} />
          <div
            onClick={() => setShowDeleteDialog(true)}
            className="w-8 h-8 shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-lg group hover:bg-red-50 dark:hover:bg-red-900/40">
            <img src={Delete} className="w-4 opacity-60 group-hover:opacity-100 transition-opacity dark:invert" alt="Delete" />
          </div>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        taskTitle={task.title}
      />

      {/* Edit Dialog */}
      <UpdateForm
        show={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        task={task}
        onUpdate={onUpdate}
      />
    </>
  )
}

export default TaskCard