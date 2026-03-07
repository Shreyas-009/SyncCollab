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
            <aside className="w-16 h-full flex flex-col items-center py-4 border-r bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg mb-4 hover:bg-stone-100 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Requests badge */}
                <button
                    onClick={onShowRequests}
                    className="p-2 rounded-lg mb-4 relative hover:bg-stone-100 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400"
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
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-2 w-full items-center custom-scrollbar">
                    {projects.map(project => (
                        <div key={project._id} className="w-full flex justify-center py-1">
                            <button
                                onClick={() => onSelectProject(project)}
                                className={`w-8 h-8 rounded-lg flex flex-shrink-0 items-center justify-center transition-all ${selectedProject?._id === project._id
                                        ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900 border-none'
                                        : 'hover:scale-110'
                                    }`}
                                style={{ backgroundColor: project.color || '#8B5CF6' }}
                                title={project.name}
                            >
                                <span className="text-white text-xs font-bold">
                                    {project.name?.[0]?.toUpperCase()}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={onToggle}
                />
            )}

            <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 md:w-64 h-full flex flex-col border-r shadow-2xl md:shadow-none bg-stone-100/40 border-stone-200/60 dark:bg-slate-900/40 dark:border-slate-800 backdrop-blur-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-200/50 dark:border-slate-800 h-[72px]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm shadow-purple-600/20">
                            S
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-stone-800 dark:text-gray-100">
                            SyncCollab
                        </h2>
                    </div>
                    {/* Toggle Button (Mobile & Desktop) */}
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-stone-200/50 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {window.innerWidth >= 768 ? (
                           <i className="bi bi-layout-sidebar-inset text-lg"></i>
                        ) : (
                           <i className="bi bi-x-lg text-lg"></i>
                        )}
                    </button>
                </div>

                {/* Requests Button */}
                <button
                    onClick={onShowRequests}
                    className="mx-4 mt-5 flex items-center gap-3 p-3 rounded-2xl text-sm font-semibold transition-all bg-white hover:bg-stone-50 text-stone-700 shadow-sm border border-stone-200/50 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-200 hover:shadow-md"
                >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <i className="bi bi-inbox-fill text-lg"></i>
                    </div>
                    Requests
                    {pendingCount > 0 && (
                        <span className="ml-auto px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm shadow-red-500/30">
                            + {pendingCount}
                        </span>
                    )}
                </button>

                {/* Section Title */}
                <div className="px-5 mt-6 mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500">
                        Your Projects
                    </h3>
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-stone-400 dark:text-slate-500">
                            <i className="bi bi-folder-x text-3xl mb-2 opacity-50"></i>
                            <p className="text-sm font-medium">No projects yet</p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project._id}
                                onClick={() => {
                                    onSelectProject(project);
                                    if (window.innerWidth < 768) onToggle(); // auto-close on mobile
                                }}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer mb-1.5 group transition-all ${selectedProject?._id === project._id
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                                        : "hover:bg-white dark:hover:bg-slate-800/80 text-stone-600 dark:text-slate-300 hover:shadow-sm border border-transparent hover:border-stone-200/50 dark:hover:border-slate-700"
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${selectedProject?._id === project._id ? 'bg-white/20 text-white' : 'text-white'}`}
                                    style={{ 
                                        backgroundColor: selectedProject?._id === project._id ? 'rgba(255,255,255,0.2)' : (project.color || '#8B5CF6')
                                    }}
                                >
                                    {project.name[0].toUpperCase()}
                                </div>
                                <span className={`flex-1 truncate text-sm font-medium ${selectedProject?._id === project._id ? 'text-white' : ''}`}>
                                    {project.name}
                                </span>
                                {project.collaborators?.length > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                                        selectedProject?._id === project._id 
                                            ? 'bg-purple-500 text-purple-50' 
                                            : 'bg-stone-100 text-stone-500 dark:bg-slate-800 dark:text-slate-400'
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
                    <div className="p-4 mx-4 mb-4 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <input
                            type="text"
                            placeholder="Project name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-stone-200 dark:border-slate-600 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-stone-50/50 text-stone-800 dark:bg-slate-900/50 dark:text-gray-100 transition-all placeholder:font-normal"
                            autoFocus
                        />
                        <div className="flex gap-2 mb-4 justify-between">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewColor(color)}
                                    className={`w-6 h-6 rounded-full transition-all ${newColor === color ? 'scale-125 ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-slate-800 shadow-sm' : 'hover:scale-110 hover:shadow-sm'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-sm shadow-purple-600/30 transition-all"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 mt-auto">
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-sm dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-800/30"
                        >
                            <i className="bi bi-plus-lg text-lg line-height-1"></i>
                            New Project
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default ProjectSidebar
