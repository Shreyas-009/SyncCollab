import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { removeProjectCollaborator, leaveProject, deleteProject, updateProjectCollaboratorRole, updateProject } from '../utils/api'
import useMutationLocks from '../hooks/useMutationLocks'

const ProjectSettingsModal = ({ show, onClose, project, onProjectUpdated }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { user } = useUser();
    const { runLocked, isLocked } = useMutationLocks()
    
    // Project Info State
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');

    if (!show || !project) return null;

    const isOwner = project.ownerId === user?.id;

    const getRemoveCollaboratorKey = (collaboratorId) => `project:collaborator:remove:${project._id}:${collaboratorId}`
    const getRoleUpdateKey = (collaboratorId) => `project:collaborator:role:${project._id}:${collaboratorId}`
    const leaveProjectKey = `project:leave:${project._id}`
    const deleteProjectKey = `project:delete:${project._id}`
    const updateProjectKey = `project:update:${project._id}`

    const isAnyModalActionRunning =
        isLocked(updateProjectKey) ||
        isLocked(leaveProjectKey) ||
        isLocked(deleteProjectKey) ||
        (project.collaborators || []).some((c) => (
            isLocked(getRemoveCollaboratorKey(c.id)) ||
            isLocked(getRoleUpdateKey(c.id))
        ))

    const handleRemoveCollaborator = async (collaboratorId) => {
        if (!confirm('Remove this collaborator from the project?')) return;

        const actionKey = getRemoveCollaboratorKey(collaboratorId)
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await removeProjectCollaborator(project._id, collaboratorId)
                if (onProjectUpdated) onProjectUpdated()
            })
            if (!executed) return
        } catch (error) {
            alert(error.response?.data?.message || 'Error removing collaborator');
        }
    };

    const handleRoleChange = async (collaboratorId, newRole) => {
        const actionKey = getRoleUpdateKey(collaboratorId)
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await updateProjectCollaboratorRole(project._id, collaboratorId, newRole)
                if (onProjectUpdated) onProjectUpdated()
            })
            if (!executed) return
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating role');
        }
    };

    const handleLeaveProject = async () => {
        if (!confirm('Are you sure you want to leave this project? You will lose access to all its tasks.')) return;

        try {
            const { executed } = await runLocked(leaveProjectKey, async () => {
                await leaveProject(project._id)
                onClose()
                if (onProjectUpdated) onProjectUpdated()
            })
            if (!executed) return
        } catch (error) {
            alert(error.response?.data?.message || 'Error leaving project');
        }
    };

    const handleDeleteProject = async () => {
        try {
            const { executed } = await runLocked(deleteProjectKey, async () => {
                await deleteProject(project._id)
                onClose()
                if (onProjectUpdated) onProjectUpdated()
                setConfirmDelete(false)
            })
            if (!executed) return
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting project');
        }
    };

    const handleUpdateProject = async () => {
        if (!name.trim()) return;
        try {
            const { executed } = await runLocked(updateProjectKey, async () => {
                await updateProject(project._id, { name: name.trim(), description: description.trim() })
                if (onProjectUpdated) onProjectUpdated()
            })
            if (!executed) return
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating project');
        }
    };

    return (
        <div
            className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={isAnyModalActionRunning ? undefined : onClose}
        >
            <div
                className="flex flex-col w-[95%] max-w-lg h-auto max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: project.color || '#8B5CF6' }}
                        >
                            <i className="bi bi-gear-fill text-lg"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100 tracking-tight">
                                Project Settings
                            </h2>
                            <p className="text-[10px] text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest">Workspace configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isAnyModalActionRunning}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 dark:hover:bg-slate-800 dark:text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="bi bi-x-lg text-sm"></i>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {/* Project Details */}
                        {isOwner && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-600 mb-4 ml-1">Properties</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-500 dark:text-slate-400 ml-1">Title</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Project name"
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-slate-800/50 text-stone-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-500 dark:text-slate-400 ml-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Project goal or notes"
                                            rows={3}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-slate-800/50 text-stone-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all resize-none font-medium"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateProject}
                                        disabled={isLocked(updateProjectKey) || (name.trim() === project.name && description.trim() === (project.description || ''))}
                                        className="w-full py-3 bg-slate-900 dark:bg-purple-600 hover:opacity-90 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {isLocked(updateProjectKey) ? (
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        ) : 'Update Information'}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* People Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-600">Permissions</h3>
                                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {(project.collaborators?.length || 0) + 1} Total
                                </span>
                            </div>

                            {/* Owner */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 mb-3">
                                <div className="relative shrink-0">
                                    {project.ownerImage ? (
                                        <img src={project.ownerImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                                            {project.ownerName?.[0] || 'O'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                                        <i className="bi bi-star-fill text-[8px] text-white"></i>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-stone-900 dark:text-slate-100 truncate">
                                            {project.ownerName || 'Owner'}
                                        </p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-500 uppercase tracking-tighter">Owner</span>
                                        {isOwner && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 uppercase tracking-tighter">You</span>}
                                    </div>
                                    <p className="text-xs text-stone-500 dark:text-slate-500 truncate">{project.ownerEmail}</p>
                                </div>
                            </div>

                            {/* Collaborator List with limited scroll */}
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                {project.collaborators?.length > 0 ? (
                                    project.collaborators.map((c) => {
                                        const isRoleUpdating = isLocked(getRoleUpdateKey(c.id))
                                        const isRemoving = isLocked(getRemoveCollaboratorKey(c.id))
                                        const isBusy = isRoleUpdating || isRemoving

                                        return (
                                            <div
                                                key={c.id}
                                                className="flex items-center justify-between p-4 rounded-2xl border border-stone-100 dark:border-white/5 bg-white dark:bg-slate-800/30 group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-stone-400 overflow-hidden shrink-0">
                                                        {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : c.name?.[0] || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center lg:gap-2 gap-1 flex-wrap">
                                                            <p className="text-sm font-bold text-stone-800 dark:text-slate-100 truncate">{c.name || 'User'}</p>
                                                            {isOwner ? (
                                                                <div className="relative">
                                                                    <select
                                                                        disabled={isBusy}
                                                                        value={c.role || 'Member'}
                                                                        onChange={(e) => handleRoleChange(c.id, e.target.value)}
                                                                        className="text-[9px] font-black uppercase tracking-widest bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 px-2 py-0.5 rounded-md cursor-pointer hover:bg-stone-200 dark:hover:bg-slate-700 focus:outline-none appearance-none pr-5 transition-colors"
                                                                    >
                                                                        <option value="Team Lead">Team Lead</option>
                                                                        <option value="Frontend Developer">Frontend Developer</option>
                                                                        <option value="Backend Developer">Backend Developer</option>
                                                                        <option value="Tester">Tester</option>
                                                                        <option value="Designer">Designer</option>
                                                                        <option value="Member">Member</option>
                                                                    </select>
                                                                    <i className="bi bi-chevron-down absolute right-1.5 top-1/2 -translate-y-1/2 text-[7px] pointer-events-none text-stone-400" />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-stone-50 dark:bg-slate-800 text-stone-400 px-2 py-0.5 rounded">
                                                                    {c.role || 'Member'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-stone-400 dark:text-slate-600 truncate">{c.email}</p>
                                                    </div>
                                                </div>

                                                {isOwner && (
                                                    <button
                                                        onClick={() => handleRemoveCollaborator(c.id)}
                                                        disabled={isBusy}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shrink-0"
                                                        title="Remove member"
                                                    >
                                                        {isRemoving ? (
                                                            <div className="w-3 h-3 rounded-full border border-red-500/30 border-t-red-500 animate-spin" />
                                                        ) : <i className="bi bi-trash-fill text-xs" />}
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-stone-100 dark:border-white/5 rounded-2xl">
                                        <p className="text-xs font-bold text-stone-300 dark:text-slate-600 uppercase tracking-widest">Team is empty</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="px-6 py-5 border-t border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-slate-900/50 shrink-0">
                    {isOwner ? (
                        confirmDelete ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <p className="text-[11px] font-bold text-red-500 dark:text-red-400 text-center mb-4 uppercase tracking-tighter">
                                    Caution: Delete Project and all tasks?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        disabled={isLocked(deleteProjectKey)}
                                        className="flex-1 py-3 text-xs font-bold rounded-xl bg-white 
                                        dark:bg-slate-600
                                        border border-stone-200 dark:border-white/5 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700  transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteProject}
                                        disabled={isLocked(deleteProjectKey)}
                                        className='flex-1 py-3 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]'
                                    >
                                        {isLocked(deleteProjectKey) ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : 'Confirm Delete'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full py-3 text-xs font-bold rounded-xl text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/5 border border-red-400/20 transition-all uppercase tracking-widest"
                            >
                                Danger Zone: Delete Project
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleLeaveProject}
                            disabled={isLocked(leaveProjectKey)}
                            className="w-full py-3.5 text-xs font-bold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLocked(leaveProjectKey) ? <div className="w-4 h-4 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin"></div> : 'Exit Project'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsModal
