import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import { removeProjectCollaborator, leaveProject, deleteProject, updateProjectCollaboratorRole } from '../utils/api'

const ProjectSettingsModal = ({ show, onClose, project, onProjectUpdated }) => {
    const [loading, setLoading] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { isDark } = useTheme();
    const { user } = useUser();

    if (!show || !project) return null;

    const isOwner = project.ownerId === user?.id;

    const handleRemoveCollaborator = async (collaboratorId) => {
        if (!confirm('Remove this collaborator from the project?')) return;

        setLoading(collaboratorId);
        try {
            await removeProjectCollaborator(project._id, collaboratorId);
            if (onProjectUpdated) onProjectUpdated();
        } catch (error) {
            alert(error.response?.data?.message || 'Error removing collaborator');
        } finally {
            setLoading(null);
        }
    };

    const handleRoleChange = async (collaboratorId, newRole) => {
        setLoading(`role-${collaboratorId}`);
        try {
            await updateProjectCollaboratorRole(project._id, collaboratorId, newRole);
            if (onProjectUpdated) onProjectUpdated();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating role');
        } finally {
            setLoading(null);
        }
    };

    const handleLeaveProject = async () => {
        if (!confirm('Are you sure you want to leave this project? You will lose access to all its tasks.')) return;

        setLoading('leave');
        try {
            await leaveProject(project._id);
            onClose();
            if (onProjectUpdated) onProjectUpdated();
        } catch (error) {
            alert(error.response?.data?.message || 'Error leaving project');
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteProject = async () => {
        setLoading('delete');
        try {
            await deleteProject(project._id);
            onClose();
            if (onProjectUpdated) onProjectUpdated();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting project');
        } finally {
            setLoading(null);
            setConfirmDelete(false);
        }
    };

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={onClose}
        >
            <div
                className="flex flex-col w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-md"
                            style={{ backgroundColor: project.color || '#8B5CF6' }}
                        />
                        <h2 className="text-lg font-semibold text-stone-800 dark:text-gray-100">
                            Project Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 dark:hover:bg-slate-700 dark:text-slate-400"
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Owner Info */}
                    <div className="mb-5">
                        <p className="text-xs font-medium uppercase tracking-wide mb-2 text-stone-500 dark:text-slate-400">
                            Owner
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 dark:bg-purple-700">
                                {project.ownerImage ? (
                                    <img src={project.ownerImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-medium">
                                        {project.ownerName?.[0] || project.ownerEmail?.[0]?.toUpperCase() || 'O'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-800 dark:text-gray-100">
                                    {project.ownerName || 'Owner'}
                                    {isOwner && <span className="ml-2 text-xs text-purple-500">(You)</span>}
                                </p>
                                <p className="text-xs text-stone-500 dark:text-slate-400">
                                    {project.ownerEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Collaborators */}
                    <div className="mb-5">
                        <p className="text-xs font-medium uppercase tracking-wide mb-2 text-stone-500 dark:text-slate-400">
                            Collaborators ({project.collaborators?.length || 0})
                        </p>
                        {project.collaborators?.length > 0 ? (
                            <div className="rounded-xl border border-stone-200 dark:border-slate-700">
                                {project.collaborators.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 border-b last:border-b-0 border-stone-100 dark:border-slate-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-slate-600">
                                                {c.image ? (
                                                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-medium text-stone-600 dark:text-slate-200">
                                                        {c.name?.[0] || c.email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-stone-800 dark:text-gray-100 flex items-center gap-2">
                                                    {c.name || 'User'}
                                                    {c.id === user?.id && <span className="text-xs text-purple-500">(You)</span>}
                                                    {isOwner ? (
                                                        <div className="relative inline-flex items-center">
                                                            <select
                                                                disabled={loading === `role-${c.id}`}
                                                                value={c.role || 'Member'}
                                                                onChange={(e) => handleRoleChange(c.id, e.target.value)}
                                                                className={`text-[10px] uppercase font-bold tracking-wider ml-1 bg-stone-100 text-stone-600 border-none rounded p-1 cursor-pointer focus:ring-1 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-300 outline-none transition-opacity ${loading === `role-${c.id}` ? 'opacity-50' : 'opacity-100'}`}
                                                            >
                                                                <option value="Team Lead">Team Lead</option>
                                                                <option value="Frontend Developer">Frontend Developer</option>
                                                                <option value="Backend Developer">Backend Developer</option>
                                                                <option value="Tester">Tester</option>
                                                                <option value="Designer">Designer</option>
                                                                <option value="Member">Member</option>
                                                            </select>
                                                            {loading === `role-${c.id}` && (
                                                                <div className="absolute right-1 w-3 h-3 rounded-full border border-purple-600/30 border-t-purple-600 animate-spin pointer-events-none"></div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded dark:bg-slate-700 dark:text-slate-400">
                                                            {c.role || 'Member'}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                                                    {c.email}
                                                </p>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveCollaborator(c.id)}
                                                disabled={loading === c.id}
                                                className="px-2 py-1 text-[11px] font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50 ml-2 flex items-center justify-center gap-1.5 min-w-[65px]"
                                            >
                                                {loading === c.id ? (
                                                    <>
                                                        <div className="w-3 h-3 rounded-full border border-red-600/30 border-t-red-600 dark:border-red-400/30 dark:border-t-red-400 animate-spin"></div>
                                                        Removing...
                                                    </>
                                                ) : (
                                                    'Remove'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm py-3 text-stone-400 dark:text-slate-500">
                                No collaborators yet
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-stone-200 dark:border-slate-700">
                        {isOwner ? (
                            // Owner: Delete project
                            confirmDelete ? (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                                    <p className="text-sm mb-3 text-red-700 dark:text-red-300">
                                        This will permanently delete the project and all its tasks. This cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className="flex-1 py-2 text-sm font-medium rounded-lg bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteProject}
                                            disabled={loading === 'delete'}
                                            className='flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors'
                                        >
                                            {loading === 'delete' ? (
                                                <>
                                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                    Deleting...
                                                </>
                                            ) : (
                                                'Delete Project'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full py-2.5 text-sm font-medium rounded-xl transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    Delete Project
                                </button>
                            )
                        ) : (
                            // Collaborator: Leave project
                            <button
                                onClick={handleLeaveProject}
                                disabled={loading === 'leave'}
                                className="w-full py-2.5 text-sm font-medium rounded-xl transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === 'leave' ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-red-600/30 border-t-red-600 dark:border-red-400/30 dark:border-t-red-400 animate-spin"></div>
                                        Leaving...
                                    </>
                                ) : (
                                    'Leave Project'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsModal
