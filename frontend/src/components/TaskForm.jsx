import React, { useId, useState } from 'react'
import { X } from 'lucide-react'
import CustomDropdown from './CustomDropdown'

const TASK_TYPES = [
    { value: 'feature',       label: 'New Feature',    color: 'text-purple-600 dark:text-purple-400' },
    { value: 'bug-fix',       label: 'Bug Fix',        color: 'text-red-600 dark:text-red-400' },
    { value: 'design',        label: 'Design / UI',    color: 'text-pink-600 dark:text-pink-400' },
    { value: 'refactor',      label: 'Refactoring',    color: 'text-amber-600 dark:text-amber-400' },
    { value: 'testing',       label: 'Testing / QA',   color: 'text-emerald-600 dark:text-emerald-400' },
    { value: 'documentation', label: 'Documentation',  color: 'text-sky-600 dark:text-sky-400' },
    { value: 'other',         label: 'Other',          color: 'text-stone-500 dark:text-slate-400' },
];

export { TASK_TYPES };

const TaskForm = ({ show, onClose, onAddTask, project, isSubmitting = false }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('pending');
    const [assignedTo, setAssignedTo] = useState('');
    const [taskType, setTaskType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const formId = useId();

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
        if (isSubmitting) return;
        
        const selectedAssignee = assignees.find(a => a.id === assignedTo);
        const newTask = { 
            title, 
            description, 
            priority, 
            status,
            taskType,
            startDate: startDate || null,
            dueDate: dueDate || null,
            assignedTo: selectedAssignee?.id || ''
        };
        
        const created = await onAddTask(newTask);
        if (!created) return;
        
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
        setAssignedTo('');
        setTaskType('');
        setStartDate('');
        setDueDate('');
    }

    const inputCls = "w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400 dark:bg-[#111114] dark:text-gray-100 dark:border-white/10 dark:placeholder-slate-500 dark:[color-scheme:dark]";
    const labelCls = "block text-sm font-medium mb-2 text-stone-700 dark:text-slate-300";

    const TASK_TYPE_OPTIONS = [
        { value: '', label: 'No Type' },
        ...TASK_TYPES.map(t => ({ value: t.value, label: t.label }))
    ];

    const ASSIGNEE_OPTIONS = [
        { value: '', label: 'Unassigned' },
        ...assignees.map(a => ({ value: a.id, label: `${a.name} (${a.role})` }))
    ];

    const PRIORITY_OPTIONS = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    const STATUS_OPTIONS = [
        { value: 'pending', label: 'Pending' },
        { value: 'in progress', label: 'In Progress' },
        { value: 'testing', label: 'Testing' },
        { value: 'completed', label: 'Completed' }
    ];

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={isSubmitting ? undefined : onClose}
        >
            <div
                className="flex flex-col w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden transition-colors bg-white border border-stone-200 dark:bg-[#0c0c0e] dark:border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-stone-50 dark:border-white/5 dark:bg-white/5">
                    <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-100">Add New Task</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg transition-colors text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    id={formId}
                    onSubmit={handleSubmit}
                    className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto bg-white custom-scrollbar dark:bg-[#111114]"
                >
                    {/* Title */}
                    <div>
                        <label className={labelCls}>Task Title</label>
                        <input
                            type="text"
                            className={inputCls}
                            placeholder='Enter your task...'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelCls}>
                            Description <span className="text-xs font-normal text-stone-400 dark:text-slate-500">(optional)</span>
                        </label>
                        <textarea
                            className={`${inputCls} resize-none`}
                            placeholder='Add more details...'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                            rows={3}
                        />
                    </div>

                    {/* Task Type */}
                    <div>
                        <label className={labelCls}>Task Type</label>
                        <CustomDropdown options={TASK_TYPE_OPTIONS} value={taskType} onChange={setTaskType} disabled={isSubmitting} />
                    </div>

                    {/* Assign To */}
                    <div>
                        <label className={labelCls}>Assign To</label>
                        <CustomDropdown options={ASSIGNEE_OPTIONS} value={assignedTo} onChange={setAssignedTo} disabled={isSubmitting} />
                    </div>

                    {/* Priority + Status */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className={labelCls}>Priority</label>
                            <CustomDropdown options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} disabled={isSubmitting} />
                        </div>
                        <div>
                            <label className={labelCls}>Status</label>
                            <CustomDropdown options={STATUS_OPTIONS} value={status} onChange={setStatus} disabled={isSubmitting} />
                        </div>
                    </div>

                    {/* Start Date + Due Date */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className={labelCls}>Start Date <span className="text-xs font-normal text-stone-400 dark:text-slate-500">(optional)</span></label>
                            <input
                                type="date"
                                className={inputCls}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Due Date <span className="text-xs font-normal text-stone-400 dark:text-slate-500">(optional)</span></label>
                            <input
                                type="date"
                                className={inputCls}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-stone-50 border-stone-100 dark:bg-[#0c0c0e] dark:border-white/5">
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium border rounded-xl transition-colors text-stone-600 bg-white border-stone-200 hover:bg-stone-50 dark:text-slate-300 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        form={formId}
                        disabled={isSubmitting}
                        className='px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                        {isSubmitting ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskForm
