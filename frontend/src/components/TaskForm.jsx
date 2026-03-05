import React, { useState } from 'react'
import { useTheme } from '../context/useTheme'

const TaskForm = ({ show, onClose, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('pending');
    const { isDark } = useTheme();

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newTask = { title, description, priority, status };
        await onAddTask(newTask);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
    }

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={onClose}
        >
            <div
                className={`flex flex-col w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-stone-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-stone-100 bg-stone-50'
                    }`}>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>Add New Task</h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                            }`}
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <form className={`px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto ${isDark ? '' : 'bg-white'}`}>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                            Task Title
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${isDark
                                ? 'bg-slate-900 text-gray-100 border-slate-600 placeholder-slate-500'
                                : 'bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400'
                                }`}
                            placeholder='Enter your task...'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                            Description <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>(optional)</span>
                        </label>
                        <textarea
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${isDark
                                ? 'bg-slate-900 text-gray-100 border-slate-600 placeholder-slate-500'
                                : 'bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400'
                                }`}
                            placeholder='Add more details...'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                                Priority
                            </label>
                            <select
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer ${isDark
                                    ? 'bg-slate-900 text-gray-100 border-slate-600'
                                    : 'bg-stone-50 text-stone-700 border-stone-200'
                                    }`}
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value='low'>Low</option>
                                <option value='medium'>Medium</option>
                                <option value='high'>High</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
                                Status
                            </label>
                            <select
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer ${isDark
                                    ? 'bg-slate-900 text-gray-100 border-slate-600'
                                    : 'bg-stone-50 text-stone-700 border-stone-200'
                                    }`}
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value='pending'>Pending</option>
                                <option value='in progress'>In Progress</option>
                                <option value='completed'>Completed</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-stone-50 border-stone-100'
                    }`}>
                    <button
                        type='button'
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${isDark
                            ? 'text-slate-300 bg-slate-800 border-slate-600 hover:bg-slate-700'
                            : 'text-stone-600 bg-white border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        onClick={handleSubmit}
                        className='px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm'
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};


export default TaskForm