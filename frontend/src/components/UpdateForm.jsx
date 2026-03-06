import React, { useState } from 'react'
import { useTheme } from '../context/useTheme'

const UpdateForm = ({ show, onClose, task, onUpdate, project }) => {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [status, setStatus] = useState(task?.status || 'pending');
    const [assignedTo, setAssignedTo] = useState(task?.assignedTo || '');
    const { isDark } = useTheme();

    if (!show) return null;

    // Build assignee list (owner + collaborators)
    const assignees = project ? [
        { id: project.ownerId, name: project.ownerName || 'Owner', image: project.ownerImage, role: 'Owner' },
        ...(project.collaborators || []).map(c => ({
            id: c.id,
            name: c.name || c.email,
            image: c.image,
            role: c.role || 'Member'
        }))
    ] : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const selectedAssignee = assignees.find(a => a.id === assignedTo);
        const updatedData = { 
            title, 
            description, 
            priority, 
            status,
            assignedTo: selectedAssignee ? selectedAssignee.id : '',
            assignedToName: selectedAssignee ? selectedAssignee.name : '',
            assignedToImage: selectedAssignee ? selectedAssignee.image : '',
            assignedToRole: selectedAssignee ? selectedAssignee.role : ''
        };
        
        await onUpdate(task._id, updatedData);
        onClose();
    }

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={onClose}
        >
            <div
                className="flex flex-col w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden transition-colors bg-white border border-stone-200 dark:bg-slate-800 dark:border dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-stone-50 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-100">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>

                {/* Form Content */}
                <form className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-white custom-scrollbar dark:bg-slate-900">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300">
                            Task Title
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-600 dark:placeholder-slate-500"
                            placeholder='Enter your task...'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300">
                            Description <span className="text-xs font-normal text-stone-400 dark:text-slate-500">(optional)</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-600 dark:placeholder-slate-500"
                            placeholder='Add more details...'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300">
                            Assign To
                        </label>
                        <select
                            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer bg-stone-50 text-stone-700 border-stone-200 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-600"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {assignees.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name} ({a.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300">
                                Priority
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer bg-stone-50 text-stone-700 border-stone-200 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-600"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value='low'>Low</option>
                                <option value='medium'>Medium</option>
                                <option value='high'>High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300">
                                Status
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer bg-stone-50 text-stone-700 border-stone-200 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-600"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value='pending'>Pending</option>
                                <option value='in progress'>In Progress</option>
                                <option value='testing'>Testing</option>
                                <option value='completed'>Completed</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-stone-50 border-stone-100 dark:bg-slate-900/50 dark:border-slate-700">
                    <button
                        type='button'
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium border rounded-xl transition-colors text-stone-600 bg-white border-stone-200 hover:bg-stone-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={handleSubmit}
                        className='px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm'
                    >
                        Update Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateForm