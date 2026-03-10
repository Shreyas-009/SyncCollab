import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import { Grid, Check, User, Filter, Inbox } from 'lucide-react';

const TaskColumn = ({ title, statusId, img, icon, tasks, onDelete, onEdit, onView, projectAssignees, isTaskBusy = () => false }) => {
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [showPriorityFilter, setShowPriorityFilter] = useState(false);
    const [showAssigneeFilter, setShowAssigneeFilter] = useState(false);

    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    const assigneeOptions = [
        { value: 'all', label: 'Everyone' },
        { value: 'unassigned', label: 'Unassigned' },
        ...(projectAssignees || []).map(a => ({ value: a.id, label: a.name }))
    ];

    const filteredTasks = tasks?.filter(task => {
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesAssignee = assigneeFilter === 'all' || 
            (assigneeFilter === 'unassigned' ? !task.assignedTo : task.assignedTo === assigneeFilter);
        return matchesPriority && matchesAssignee;
    });

    return (
        <section className="flex flex-col flex-1 min-w-[300px] max-w-sm rounded-[24px] bg-stone-100/50 border border-stone-200/60 shadow-sm dark:bg-slate-800/30 dark:border-slate-700/50 overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between p-5 bg-white/40 dark:bg-slate-800/40 border-b border-stone-200/50 dark:border-slate-700/50 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {icon ? (
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-stone-100 dark:border-slate-600 flex items-center justify-center">
                            {icon}
                        </div>
                    ) : img ? (
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-stone-100 dark:border-slate-600 flex items-center justify-center p-1.5">
                            <img className='w-full h-full object-contain' src={img} alt={title} />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-stone-100 dark:border-slate-600 flex items-center justify-center text-purple-600 dark:text-purple-400">
                           <Grid className="w-4 h-4" />
                        </div>
                    )}
                    <h3 className="font-bold text-lg text-stone-800 tracking-tight dark:text-gray-100">{title}</h3>
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-stone-200/80 text-stone-600 dark:bg-slate-700 dark:text-slate-300 shadow-inner">
                        {filteredTasks?.length || 0}
                    </span>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 relative">
                    {/* Assignee Filter */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowAssigneeFilter(!showAssigneeFilter); setShowPriorityFilter(false); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${assigneeFilter !== 'all'
                                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-800/50 shadow-sm'
                                : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 shadow-sm border border-stone-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                }`}
                            title="Filter by Assignee"
                        >
                            <User className="w-3.5 h-3.5" />
                        </button>

                        {showAssigneeFilter && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowAssigneeFilter(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 z-30 rounded-xl shadow-xl border overflow-hidden bg-white border-stone-100 dark:bg-slate-800 dark:border-slate-700">
                                    <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                        {assigneeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setAssigneeFilter(option.value);
                                                    setShowAssigneeFilter(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${assigneeFilter === option.value
                                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                                    : "text-stone-600 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                    }`}
                                            >
                                                <span className="truncate">{option.label}</span>
                                                {assigneeFilter === option.value && <Check className="w-3 h-3 flex-shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Priority Filter */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowPriorityFilter(!showPriorityFilter); setShowAssigneeFilter(false); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${priorityFilter !== 'all'
                                ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-800/50 shadow-sm'
                                : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 shadow-sm border border-stone-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                }`}
                            title="Filter by Priority"
                        >
                            <Filter className="w-3 h-3" />
                        </button>

                        {showPriorityFilter && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowPriorityFilter(false)} />
                                <div className="absolute right-0 top-full mt-2 w-36 z-30 rounded-xl shadow-xl border overflow-hidden bg-white border-stone-100 dark:bg-slate-800 dark:border-slate-700">
                                    <div className="p-1">
                                        {priorityOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setPriorityFilter(option.value);
                                                    setShowPriorityFilter(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${priorityFilter === option.value
                                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                                    : "text-stone-600 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                    }`}
                                            >
                                                {option.label}
                                                {priorityFilter === option.value && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={statusId}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 overflow-y-auto custom-scrollbar transition-colors duration-200 ${
                            snapshot.isDraggingOver 
                                ? 'bg-purple-50/50 dark:bg-purple-900/10' 
                                : ''
                        }`}
                        style={{ minHeight: '150px' }}
                    >
                        <div className="flex flex-col gap-0">
                            {filteredTasks && filteredTasks.length > 0 ? (
                                filteredTasks.map((task, index) => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task} 
                                        index={index}
                                        onDelete={onDelete} 
                                        onEdit={onEdit} 
                                        onView={onView} 
                                        isBusy={isTaskBusy(task._id)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 mt-4 text-stone-400 dark:text-slate-500 border-2 border-dashed border-stone-200 dark:border-slate-700 rounded-2xl bg-white/40 dark:bg-slate-800/20">
                                    <Inbox className="w-10 h-10 mb-2 opacity-40" />
                                    <p className='text-sm font-medium'>
                                        {(priorityFilter !== 'all' || assigneeFilter !== 'all') ? 'No tasks match filters' : 'Drop tasks here'}
                                    </p>
                                </div>
                            )}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        </section>
    )
}

export default TaskColumn;
