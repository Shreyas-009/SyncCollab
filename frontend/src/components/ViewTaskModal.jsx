import React from 'react';
import { X, User } from 'lucide-react';
import { TASK_TYPES } from './TaskForm';

const TASK_TYPE_STYLES = {
    'feature':       { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    'bug-fix':       { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300' },
    'design':        { bg: 'bg-pink-100 dark:bg-pink-900/30',     text: 'text-pink-700 dark:text-pink-300' },
    'refactor':      { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
    'testing':       { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    'documentation': { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-300' },
    'other':         { bg: 'bg-stone-100 dark:bg-slate-700',      text: 'text-stone-600 dark:text-slate-300' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ViewTaskModal = ({ show, onClose, task }) => {
    if (!show || !task) return null;

    const hasDescription = task.description && task.description.trim() !== '';
    const typeInfo = TASK_TYPES.find(t => t.value === task.taskType);
    const typeStyle = TASK_TYPE_STYLES[task.taskType] || TASK_TYPE_STYLES.other;

    const now = new Date();
    const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDateObj && dueDateObj < now && task.status !== 'completed';

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-200 dark:border-slate-700 flex justify-between items-start break-words gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-100 leading-tight">
                            {task.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
                    {/* Assignments & Status & Priority & Dates */}
                    <div className="flex flex-wrap gap-y-4 gap-x-6 items-start">
                        {/* Assigned To */}
                        <div className="flex flex-col gap-1 w-full sm:w-auto sm:pr-6 sm:border-r border-stone-100 dark:border-slate-700/50">
                            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Assigned To</span>
                            {task.assignedTo ? (
                                <div className="flex items-center gap-2">
                                    {task.assignedToImage ? (
                                        <img src={task.assignedToImage} alt={task.assignedToName} className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-slate-600" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                            {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-stone-800 dark:text-gray-200 flex items-center gap-1.5">
                                        {task.assignedToName || 'Unknown User'}
                                        {task.assignedToRole && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-stone-100 text-stone-500 dark:bg-slate-700 dark:text-slate-400">
                                                {task.assignedToRole}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-stone-400 italic dark:text-slate-500 flex items-center gap-2 h-6">
                                    <div className="w-6 h-6 rounded-full border border-dashed border-stone-300 dark:border-slate-600 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-stone-300 dark:text-slate-600" />
                                    </div>
                                    Unassigned
                                </span>
                            )}
                        </div>

                        {/* Status, Priority, Type */}
                        <div className="flex items-start gap-4 flex-nowrap overflow-x-auto custom-scrollbar pb-1 sm:pb-0 sm:pr-6 sm:border-r border-stone-100 dark:border-slate-700/50 w-full lg:w-auto">
                            {/* Status */}
                            <div className="flex flex-col gap-1 shrink-0">
                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Status</span>
                                <span className="px-3 py-1 bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-200 rounded-full text-sm font-medium capitalize flex max-w-max">
                                    {task.status || 'Pending'}
                                </span>
                            </div>

                            {/* Priority */}
                            <div className="flex flex-col gap-1 shrink-0">
                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Priority</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize max-w-max ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                    task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                }`}>
                                    {task.priority || 'Medium'}
                                </span>
                            </div>

                            {/* Task Type */}
                            {typeInfo && (
                                <div className="flex flex-col gap-1 shrink-0">
                                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Type</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize max-w-max ${typeStyle.bg} ${typeStyle.text}`}>
                                        {typeInfo.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        {(task.startDate || task.dueDate) && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Timeline</span>
                                <div className="flex items-center gap-2 text-sm">
                                    {task.startDate && (
                                        <span className="px-2.5 py-1 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 rounded-lg text-xs font-medium">
                                            {formatDate(task.startDate)}
                                        </span>
                                    )}
                                    {task.startDate && task.dueDate && (
                                        <span className="text-stone-300 dark:text-slate-600">→</span>
                                    )}
                                    {task.dueDate && (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                            isOverdue
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                                : 'bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {formatDate(task.dueDate)}
                                            {isOverdue && ' (Overdue)'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-slate-400">Description</span>
                        {hasDescription ? (
                            <div className="bg-stone-50 dark:bg-slate-900 p-4 rounded-xl border border-stone-100 dark:border-slate-700/50 max-h-[160px] overflow-y-auto custom-scrollbar">
                                <p className="text-stone-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-base break-words">
                                    {task.description}
                                </p>
                            </div>
                        ) : (
                            <p className="text-stone-400 italic text-sm dark:text-slate-500">No description provided.</p>
                        )}
                    </div>

                    {/* Metadata */}
                    {(task.createdByName || task.updatedByName) && (
                        <div className="mt-auto pt-4 border-t border-stone-100 dark:border-slate-700 flex flex-row flex-wrap justify-between items-center gap-3">
                            {task.createdByName && (
                                <div className="flex items-center gap-2">
                                    {task.createdByImage ? (
                                        <img src={task.createdByImage} alt={task.createdByName} className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-slate-600" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                            {task.createdByName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-wide dark:text-slate-400">Created by</span>
                                        <span className="text-sm font-medium text-stone-800 dark:text-slate-200">{task.createdByName}</span>
                                    </div>
                                </div>
                            )}

                            {task.updatedByName && (
                                <div className="flex items-center gap-2">
                                    {task.updatedByImage ? (
                                        <img src={task.updatedByImage} alt={task.updatedByName} className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-slate-600" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            {task.updatedByName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-wide dark:text-slate-400">Last updated by</span>
                                        <span className="text-sm font-medium text-stone-800 dark:text-slate-200">{task.updatedByName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewTaskModal;
