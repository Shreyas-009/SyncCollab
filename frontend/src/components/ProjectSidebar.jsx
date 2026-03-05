import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/useTheme'
import { getPendingInvites } from '../utils/api'

const ProjectSidebar = ({ projects, selectedProject, onSelectProject, onCreateProject, isOpen, onToggle, onShowRequests }) => {
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#8B5CF6');
    const [pendingCount, setPendingCount] = useState(0);
    const { isDark } = useTheme();

    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

    useEffect(() => {
        loadPendingCount();
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPendingCount = async () => {
        try {
            const invites = await getPendingInvites();
            setPendingCount(invites?.length || 0);
        } catch (error) {
            console.error('Error loading invites:', error);
        }
    };

    const handleCreate = () => {
        if (newName.trim()) {
            onCreateProject({ name: newName, color: newColor });
            setNewName('');
            setNewColor('#8B5CF6');
            setShowForm(false);
        }
    };

    // Collapsed state
    if (!isOpen) {
        return (
            <aside className={`w-16 h-full flex flex-col items-center py-4 border-r ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'
                }`}>
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg mb-4 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-500'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Requests badge */}
                <button
                    onClick={onShowRequests}
                    className={`p-2 rounded-lg mb-4 relative ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-500'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </button>

                {/* Project dots */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    {projects.map(project => (
                        <button
                            key={project._id}
                            onClick={() => onSelectProject(project)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedProject?._id === project._id
                                    ? 'ring-2 ring-purple-500 ring-offset-2'
                                    : ''
                                }`}
                            style={{ backgroundColor: project.color || '#8B5CF6' }}
                            title={project.name}
                        >
                            <span className="text-white text-xs font-bold">
                                {project.name?.[0]?.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className={`w-64 h-full flex flex-col border-r ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'
            }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                    Projects
                </h2>
                <button
                    onClick={onToggle}
                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-500'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Requests Button */}
            <button
                onClick={onShowRequests}
                className={`mx-3 mt-3 flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-colors ${isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Requests
                {pendingCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        {pendingCount}
                    </span>
                )}
            </button>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-2 mt-2">
                {projects.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                        No projects yet
                    </p>
                ) : (
                    projects.map(project => (
                        <div
                            key={project._id}
                            onClick={() => onSelectProject(project)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 group transition-all ${selectedProject?._id === project._id
                                    ? isDark ? 'bg-slate-700' : 'bg-purple-50'
                                    : isDark ? 'hover:bg-slate-800' : 'hover:bg-stone-50'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: project.color || '#8B5CF6' }}
                            />
                            <span className={`flex-1 truncate text-sm font-medium ${selectedProject?._id === project._id
                                    ? isDark ? 'text-white' : 'text-purple-700'
                                    : isDark ? 'text-gray-300' : 'text-stone-700'
                                }`}>
                                {project.name}
                            </span>
                            {project.collaborators?.length > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-stone-200 text-stone-600'
                                    }`}>
                                    {project.collaborators.length}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Project Form */}
            {showForm ? (
                <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                    <input
                        type="text"
                        placeholder="Project name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className={`w-full px-3 py-2 text-sm rounded-lg border mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                ? 'bg-slate-800 text-gray-100 border-slate-600'
                                : 'bg-stone-50 text-stone-800 border-stone-200'
                            }`}
                        autoFocus
                    />
                    <div className="flex gap-1 mb-2">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform ${newColor === color ? 'scale-110 ring-2 ring-offset-2 ring-purple-500' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowForm(false)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-stone-100 text-stone-600'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex-1 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                            Create
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                    <button
                        onClick={() => setShowForm(true)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark
                                ? 'bg-slate-800 text-purple-400 hover:bg-slate-700'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>
            )}
        </aside>
    );
};

export default ProjectSidebar
