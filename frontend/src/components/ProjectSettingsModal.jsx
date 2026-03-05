import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import { removeProjectCollaborator, leaveProject, deleteProject } from '../utils/api'

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
                className={`flex flex-col w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-stone-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-md"
                            style={{ backgroundColor: project.color || '#8B5CF6' }}
                        />
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                            Project Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-stone-100 text-stone-400'}`}
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
                        <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                            Owner
                        </p>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full overflow-hidden ${isDark ? 'bg-purple-700' : 'bg-purple-500'}`}>
                                {project.ownerImage ? (
                                    <img src={project.ownerImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-medium">
                                        {project.ownerName?.[0] || project.ownerEmail?.[0]?.toUpperCase() || 'O'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                    {project.ownerName || 'Owner'}
                                    {isOwner && <span className="ml-2 text-xs text-purple-500">(You)</span>}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                    {project.ownerEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Collaborators */}
                    <div className="mb-5">
                        <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                            Collaborators ({project.collaborators?.length || 0})
                        </p>
                        {project.collaborators?.length > 0 ? (
                            <div className={`rounded-xl border ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                                {project.collaborators.map((c) => (
                                    <div
                                        key={c.id}
                                        className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isDark ? 'border-slate-700' : 'border-stone-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-stone-200'}`}>
                                                {c.image ? (
                                                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center text-sm font-medium ${isDark ? 'text-slate-200' : 'text-stone-600'}`}>
                                                        {c.name?.[0] || c.email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                                    {c.name || 'User'}
                                                    {c.id === user?.id && <span className="ml-2 text-xs text-purple-500">(You)</span>}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                                    {c.email}
                                                </p>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveCollaborator(c.id)}
                                                disabled={loading === c.id}
                                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${isDark
                                                        ? 'text-red-400 hover:bg-red-900/30'
                                                        : 'text-red-600 hover:bg-red-50'
                                                    } disabled:opacity-50`}
                                            >
                                                {loading === c.id ? '...' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-sm py-3 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                                No collaborators yet
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                        {isOwner ? (
                            // Owner: Delete project
                            confirmDelete ? (
                                <div className={`p-3 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                    <p className={`text-sm mb-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                        This will permanently delete the project and all its tasks. This cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-stone-100 text-stone-600'
                                                }`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteProject}
                                            disabled={loading === 'delete'}
                                            className='flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50'
                                        >
                                            {loading === 'delete' ? 'Deleting...' : 'Delete Project'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark
                                            ? 'text-red-400 hover:bg-red-900/20'
                                            : 'text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    Delete Project
                                </button>
                            )
                        ) : (
                            // Collaborator: Leave project
                            <button
                                onClick={handleLeaveProject}
                                disabled={loading === 'leave'}
                                className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark
                                        ? 'text-red-400 hover:bg-red-900/20'
                                        : 'text-red-600 hover:bg-red-50'
                                    } disabled:opacity-50`}
                            >
                                {loading === 'leave' ? 'Leaving...' : 'Leave Project'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsModal
