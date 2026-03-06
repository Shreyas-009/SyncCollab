import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';

const TaskColumn = ({ title, statusId, img, tasks, onDelete, onEdit, onView }) => {
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    const filteredTasks = priorityFilter === 'all'
        ? tasks
        : tasks?.filter(task => task.priority === priorityFilter);

    const currentFilterLabel = priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'All Priorities';

    return (
        <section className="flex flex-col flex-1 min-w-[300px] max-w-sm rounded-[24px] bg-stone-100/50 border border-stone-200/60 shadow-sm dark:bg-slate-800/30 dark:border-slate-700/50 overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between p-5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-b border-stone-200/50 dark:border-slate-700/50 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {img ? (
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-stone-100 dark:border-slate-600 flex items-center justify-center p-1.5">
                            <img className='w-full h-full object-contain' src={img} alt={title} />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-stone-100 dark:border-slate-600 flex items-center justify-center text-purple-600 dark:text-purple-400">
                           <i className="bi bi-ui-radios-grid text-lg"></i>
                        </div>
                    )}
                    <h3 className="font-bold text-lg text-stone-800 tracking-tight dark:text-gray-100">{title}</h3>
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-stone-200/80 text-stone-600 dark:bg-slate-700 dark:text-slate-300 shadow-inner">
                        {filteredTasks?.length || 0}
                    </span>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${priorityFilter !== 'all'
                            ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-800/50 shadow-sm'
                            : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 shadow-sm border border-stone-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        <i className="bi bi-funnel"></i>
                    </button>

                    {showFilter && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setShowFilter(false)} />
                            <div className="absolute right-0 top-full mt-2 w-40 z-30 rounded-xl shadow-xl border overflow-hidden bg-white border-stone-100 dark:bg-slate-800 dark:border-slate-700">
                                <div className="p-1">
                                    {priorityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setPriorityFilter(option.value);
                                                setShowFilter(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${priorityFilter === option.value
                                                ? "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                                : "text-stone-600 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                                }`}
                                        >
                                            {option.label}
                                            {priorityFilter === option.value && <i className="bi bi-check2"></i>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={statusId}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 overflow-y-auto custom-scrollbar transition-colors duration-200 ${
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
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 mt-4 text-stone-400 dark:text-slate-500 border-2 border-dashed border-stone-200 dark:border-slate-700 rounded-2xl bg-white/40 dark:bg-slate-800/20">
                                    <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <p className='text-sm font-medium'>
                                        {priorityFilter !== 'all' ? `No ${priorityFilter} tasks` : 'Drop tasks here'}
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