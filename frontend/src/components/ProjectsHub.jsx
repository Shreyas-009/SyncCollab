import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import ProjectSettingsModal from './ProjectSettingsModal';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const ProjectCard = ({ project, onClick, onEdit }) => {
    const members = [
        ...(project.ownerName || project.ownerImage ? [{ image: project.ownerImage, name: project.ownerName || project.ownerEmail }] : []),
        ...(project.collaborators || []),
    ].slice(0, 4);
    const extraCount = Math.max(0, ((project.collaborators?.length || 0) + 1) - members.length);

    return (
        <div className="group relative bg-white dark:bg-slate-800/70 rounded-2xl border border-stone-200/60 dark:border-slate-700/50 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-stone-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-0.5 transition-all duration-200 ">
            <div className="h-1.5 w-full" style={{ backgroundColor: project.color || '#8B5CF6' }} />
            <div className="p-5" onClick={onClick}>
                <div className="flex items-start gap-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
                        style={{ backgroundColor: project.color || '#8B5CF6' }}
                    >
                        {project.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-800 dark:text-slate-100 truncate text-base leading-tight">{project.name}</h3>
                        {project.description && (
                            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {members.map((m, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm" style={{ zIndex: members.length - i }}>
                                    {m.image ? (
                                        <img src={m.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: project.color || '#8B5CF6' }}>
                                            {m.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {extraCount > 0 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-stone-100 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-stone-500 dark:text-slate-300">
                                    +{extraCount}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-stone-400 dark:text-slate-500">
                            {(project.collaborators?.length || 0) + 1} member{(project.collaborators?.length || 0) !== 0 ? 's' : ''}
                        </span>
                    </div>
                    {project.updatedAt && (
                        <span className="text-[11px] text-stone-400 dark:text-slate-500">{timeAgo(project.updatedAt)}</span>
                    )}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                className="absolute top-3 right-3 md:opacity-0 opacity-100 group-hover:opacity-100 p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-stone-200/60 dark:border-slate-600/50"
                title="Edit project"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        </div>
    );
};

const CreateCard = ({ onCreateProject, isCreatingProject = false }) => {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#8B5CF6');

    const handleCreate = async () => {
        if (!name.trim() || isCreatingProject) return;
        const created = await onCreateProject({ name: name.trim(), color });
        if (created) {
            setName('');
            setColor('#8B5CF6');
            setShowForm(false);
        }
    };

    if (showForm) {
        return (
            <div className="bg-white dark:bg-slate-800/70 rounded-2xl border-2 border-purple-300 dark:border-purple-700/60 p-5 shadow-sm">
                <h3 className="font-bold text-stone-800 dark:text-slate-100 mb-4 text-sm">New Project</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="Project name..."
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-900/60 text-stone-800 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 mb-3 transition-all"
                />
                <div className="flex gap-2.5 mb-4">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setShowForm(false); setName(''); }} disabled={isCreatingProject} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Cancel
                    </button>
                    <button onClick={handleCreate} disabled={!name.trim() || isCreatingProject} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-purple-600/20">
                        {isCreatingProject ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowForm(true)}
            className="group bg-stone-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-stone-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center gap-3 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200 min-h-[120px]"
        >
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-stone-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <span className="text-sm font-semibold text-stone-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                New Project
            </span>
        </button>
    );
};

const ProjectsHub = ({ projects, onSelectProject, onCreateProject, onProjectsUpdated, loading, isCreatingProject = false }) => {
    const { user } = useUser();
    const [editProject, setEditProject] = useState(null);

    const greeting = () => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return 'Good morning';
        if (h >= 12 && h < 17) return 'Good afternoon';
        if (h >= 17 && h < 22) return 'Good evening';
        return 'Good night';
    };

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50/30 dark:bg-slate-950/30 custom-scrollbar">
            {/* Hero Banner */}
            <div className="px-6 md:px-12 pt-10 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-1">
                        {user?.imageUrl && (
                            <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-xl shadow-sm" />
                        )}
                        <div>
                            <p className="text-sm text-stone-500 dark:text-slate-400 font-medium">{greeting()},</p>
                            <h1 className="text-2xl font-bold text-stone-800 dark:text-slate-100 tracking-tight leading-tight">
                                {user?.firstName || 'User'}
                            </h1>
                        </div>
                    </div>
                    <p className="text-stone-400 dark:text-slate-500 text-sm mt-3">
                        Select a project below to get started, or create a new one.
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="px-6 md:px-12 pb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">
                            Your Projects
                        </h2>
                        {projects.length > 0 && (
                            <span className="text-xs font-semibold text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                {projects.length}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-stone-200/60 dark:border-slate-700/50 overflow-hidden animate-pulse">
                                    <div className="h-1.5 bg-stone-200 dark:bg-slate-700" />
                                    <div className="p-5">
                                        <div className="flex gap-3 mb-4">
                                            <div className="w-10 h-10 bg-stone-100 dark:bg-slate-700 rounded-xl" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-stone-100 dark:bg-slate-700 rounded w-2/3 mb-1.5" />
                                                <div className="h-3 bg-stone-100 dark:bg-slate-700 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="h-3 bg-stone-100 dark:bg-slate-700 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map(project => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onClick={() => onSelectProject(project)}
                                    onEdit={setEditProject}
                                />
                            ))}
                            <CreateCard onCreateProject={onCreateProject} isCreatingProject={isCreatingProject} />
                        </div>
                    )}

                    {!loading && projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-purple-400 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <p className="text-base font-bold text-stone-600 dark:text-slate-300 mb-1">No projects yet</p>
                            <p className="text-sm text-stone-400 dark:text-slate-500">Create your first project to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Project Modal */}
            {editProject && (
                <ProjectSettingsModal
                    show={true}
                    onClose={() => setEditProject(null)}
                    project={editProject}
                    onProjectUpdated={() => { setEditProject(null); onProjectsUpdated(); }}
                />
            )}
        </div>
    );
};

export default ProjectsHub;
