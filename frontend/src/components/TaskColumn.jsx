import React, { useState } from 'react'
import TaskCard from './TaskCard'
import { useTheme } from '../context/useTheme'

const TaskColumn = ({ title, img, tasks, onDelete, onUpdate }) => {
    const { isDark } = useTheme();
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    // Filter tasks based on selected priority
    const filteredTasks = priorityFilter === 'all'
        ? tasks
        : tasks?.filter(task => task.priority === priorityFilter);

    const currentFilterLabel = priorityOptions.find(opt => opt.value === priorityFilter)?.label || 'All Priorities';

    return (
        <section className={`flex-1 max-w-md border rounded-2xl p-5 transition-colors duration-300 ${isDark
            ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
            : 'bg-white/80 border-stone-200 shadow-sm'
            }`}>
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-4 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                <div className="flex items-center">
                    <img className='mr-2 w-7 h-7' src={img} alt={title} />
                    <span className={`font-semibold text-lg ${isDark ? 'text-gray-200' : 'text-stone-700'}`}>{title}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-stone-100 text-stone-600'
                        }`}>
                        {filteredTasks?.length || 0}
                    </span>
                </div>

                {/* Priority Filter Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${priorityFilter !== 'all'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : isDark
                                ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {priorityFilter !== 'all' && <span>{currentFilterLabel}</span>}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilter && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
                            <div className={`absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-lg shadow-lg border ${isDark
                                ? 'bg-slate-800 border-slate-700'
                                : 'bg-white border-stone-200'
                                }`}>
                                {priorityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setPriorityFilter(option.value);
                                            setShowFilter(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors ${priorityFilter === option.value
                                            ? isDark
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-purple-600 text-white'
                                            : isDark
                                                ? 'text-slate-300 hover:bg-slate-700'
                                                : 'text-stone-700 hover:bg-stone-100'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className='max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin pr-2 -mr-2'>
                {filteredTasks && filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => <TaskCard key={task._id} task={task} onDelete={onDelete} onUpdate={onUpdate} />)
                ) : (
                    <div className={`flex flex-col items-center justify-center py-12 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className='text-base font-medium'>
                            {priorityFilter !== 'all' ? `No ${priorityFilter} priority tasks` : 'No tasks yet'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default TaskColumn