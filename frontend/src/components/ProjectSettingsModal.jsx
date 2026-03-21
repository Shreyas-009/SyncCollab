import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { removeProjectCollaborator, leaveProject, deleteProject, updateProjectCollaboratorRole, updateProject } from '../utils/api'
import useMutationLocks from '../hooks/useMutationLocks'
import { Settings, User, AlertTriangle, Trash2, ChevronDown, LogOut } from 'lucide-react'
import DeleteConfirmation from './DeleteConfirmation'

const ROLES = ['Team Lead', 'Frontend Developer', 'Backend Developer', 'Tester', 'Designer', 'Member'];

const COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#EC4899', '#6366F1'];

const ProjectSettingsModal = ({ show, onClose, project, onProjectUpdated }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const { user } = useUser();
    const { runLocked, isLocked } = useMutationLocks()

    // Project Info State
    const [activeTab, setActiveTab] = useState('general');
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [color, setColor] = useState(project?.color || COLORS[0]);
    const [activityRetentionDays, setActivityRetentionDays] = useState(project?.activityRetentionDays ?? 30);

    // Custom Dropdown State
    const [openRoleMenuId, setOpenRoleMenuId] = useState(null);

    const currentUserId = user?.id;

    if (!show || !project) return null;

    const isOwner = project.ownerId === user?.id;

    const getRemoveCollaboratorKey = (collaboratorId) => `project:collaborator:remove:${project._id}:${collaboratorId}`
    const getRoleUpdateKey = (collaboratorId) => `project:collaborator:role:${project._id}:${collaboratorId}`
    const leaveProjectKey = `project:leave:${project._id}`
    const deleteProjectKey = `project:delete:${project._id}`
    const updateProjectKey = `project:update:${project._id}`

    const isUpdating = isLocked(updateProjectKey);
    const isDeleting = isLocked(deleteProjectKey);
    const isLeaving = isLocked(leaveProjectKey);
    const isRemoving = memberToDelete && isLocked(getRemoveCollaboratorKey(memberToDelete));

    const isAnyModalActionRunning =
        isUpdating ||
        isLeaving ||
        isDeleting ||
        isRemoving ||
        (project.collaborators || []).some((c) => (
            isLocked(getRoleUpdateKey(c.id))
        ))

    const handleRemoveCollaborator = async (collaboratorId) => {
        const actionKey = getRemoveCollaboratorKey(collaboratorId)
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await removeProjectCollaborator(project._id, collaboratorId)
                if (onProjectUpdated) onProjectUpdated()
                setMemberToDelete(null)
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
        try {
            const { executed } = await runLocked(leaveProjectKey, async () => {
                await leaveProject(project._id)
                onClose()
                if (onProjectUpdated) onProjectUpdated()
                setConfirmLeave(false)
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

    const handleGeneralUpdate = async () => {
        if (!name.trim()) return;
        try {
            const { executed } = await runLocked(updateProjectKey, async () => {
                await updateProject(project._id, {
                    name: name.trim(),
                    description: description.trim(),
                    activityRetentionDays,
                    color
                })
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
                className="flex flex-col w-[95%] sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[500px] rounded-2xl shadow-2xl overflow-hidden transition-all bg-white border border-stone-200 dark:bg-[#0c0c0e] dark:border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-stone-50 dark:border-white/5 dark:bg-[#0c0c0e]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
                            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-100">
                                Project Settings
                            </h2>
                            <p className="text-[10px] text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest">Workspace configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isAnyModalActionRunning}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 dark:hover:bg-white/10 dark:text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="bi bi-x-lg text-sm"></i>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                    {/* Sidebar Tabs */}
                    <div className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-[#0c0c0e] p-2 md:p-4 overflow-x-auto custom-scrollbar">
                        <nav className="flex md:flex-col gap-1 min-w-max md:min-w-0">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex-1 md:w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center md:justify-start gap-2.5 ${activeTab === 'general' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-white/5'}`}
                            >
                                <Settings className="w-4 h-4" /> <span className="whitespace-nowrap">General</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex-1 md:w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center md:justify-start gap-2.5 ${activeTab === 'members' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" /> <span className="whitespace-nowrap">Members</span>
                            </button>
                            {isOwner && (
                                <button
                                    onClick={() => setActiveTab('danger')}
                                    className={`flex-1 md:w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center md:justify-start gap-2.5 ${activeTab === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 shadow-sm' : 'text-stone-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/10'}`}
                                >
                                    <AlertTriangle className="w-4 h-4" /> <span className="whitespace-nowrap">Danger Zone</span>
                                </button>
                            )}
                            {!isOwner && (
                                <button
                                    onClick={() => setActiveTab('leave')}
                                    className={`flex-1 md:w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center md:justify-start gap-2.5 ${activeTab === 'leave' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 shadow-sm' : 'text-stone-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/10'}`}
                                >
                                    <LogOut className="w-4 h-4" /> <span className="whitespace-nowrap">Leave Project</span>
                                </button>
                            )}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0c0c0e]">
                        <div className="px-5 md:px-8 py-6">
                            {activeTab === 'general' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-widest mb-2">Project Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={!isOwner}
                                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-white/5 text-stone-800 dark:text-gray-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Enter project name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={!isOwner}
                                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-white/5 text-stone-800 dark:text-gray-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[100px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Project description (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-widest mb-2">Project Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColor(c)}
                                                    disabled={!isOwner}
                                                    className={`w-8 h-8 rounded-xl transition-all ${color === c ? 'scale-110 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-[#0c0c0e]' : 'hover:scale-105'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Activity Log Retention */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-stone-500 dark:text-slate-400 ml-1 block">Activity Log Retention</label>
                                        <p className="text-[10px] text-stone-400 dark:text-slate-500 ml-1">How many days of activity history to keep.</p>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[{ label: '30 days', value: 30 }, { label: '60 days', value: 60 }, { label: '90 days', value: 90 }, { label: 'Never', value: -1 }].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setActivityRetentionDays(opt.value)}
                                                    disabled={!isOwner}
                                                    className={`py-2 rounded-xl text-[10px] font-bold transition-all ${activityRetentionDays === opt.value
                                                            ? 'bg-purple-600 text-white shadow-sm'
                                                            : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-white/10'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-600">Project Members</h3>
                                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                                            {(project.collaborators?.length || 0) + 1} Total
                                        </span>
                                    </div>

                                    {/* Owner */}
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
                                        <div className="relative shrink-0">
                                            {project.ownerImage ? (
                                                <img src={project.ownerImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-500">
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

                                    {/* Collaborator List */}
                                    <div className="space-y-2 pr-1">
                                        {project.collaborators?.length > 0 ? (
                                            project.collaborators.map((m, index) => {
                                                const isRoleUpdating = isLocked(getRoleUpdateKey(m.id))
                                                const isRemoving = isLocked(getRemoveCollaboratorKey(m.id))
                                                const isBusy = isRoleUpdating || isRemoving

                                                return (
                                                    <div
                                                        key={m.id}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-[#111114]"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {m.image ? (
                                                                <img src={m.image} className="w-9 h-9 rounded-xl object-cover shadow-sm" alt="" />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-200 dark:bg-white/10">
                                                                    <User className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-stone-800 dark:text-gray-100">{m.name}</p>
                                                                <p className="text-xs text-stone-400 dark:text-slate-500">{m.role || 'Member'}</p>
                                                            </div>
                                                        </div>
                                                        {isOwner && m.id !== currentUserId && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setOpenRoleMenuId(openRoleMenuId === m.id ? null : m.id)}
                                                                        disabled={isBusy}
                                                                        className={`relative flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${openRoleMenuId === m.id
                                                                                ? 'bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-slate-200'
                                                                                : 'bg-white dark:bg-white/5 border border-stone-200 dark:border-white/5 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-white/10'
                                                                            }`}
                                                                    >
                                                                        <span className="line-clamp-1 max-w-[100px]">{m.role || 'Member'}</span>
                                                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openRoleMenuId === m.id ? 'rotate-180' : ''}`} />
                                                                        {isRoleUpdating && (
                                                                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-purple-200 dark:border-purple-900/50 border-t-purple-600 dark:border-t-purple-400 animate-spin bg-white dark:bg-[#111114]" />
                                                                        )}
                                                                    </button>

                                                                    {openRoleMenuId === m.id && (
                                                                        <>
                                                                            <div
                                                                                className="fixed inset-0 z-40"
                                                                                onClick={() => setOpenRoleMenuId(null)}
                                                                            />
                                                                            <div className={`absolute right-0 ${index >= (project.collaborators.length - 1) ? 'bottom-full mb-2' : 'mt-2'} w-40 bg-white dark:bg-[#111114] border border-stone-200 dark:border-white/10 shadow-2xl rounded-xl z-50 p-1 animate-in ${index >= (project.collaborators.length - 1) ? 'slide-in-from-bottom-2' : 'fade-in zoom-in'} duration-200`}>
                                                                                <div className="max-h-[120px] overflow-y-auto custom-scrollbar">
                                                                                    {ROLES.map(role => (
                                                                                        <button
                                                                                            key={role}
                                                                                            onClick={() => {
                                                                                                handleRoleChange(m.id, role);
                                                                                                setOpenRoleMenuId(null);
                                                                                            }}
                                                                                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors ${m.role === role ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10' : 'text-stone-600 dark:text-slate-300'}`}
                                                                                        >
                                                                                            {role}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => setMemberToDelete(m.id)}
                                                                    disabled={isBusy}
                                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                                                    title="Remove member"
                                                                >
                                                                    {isRemoving ? (
                                                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
                                                                    ) : <Trash2 className="w-4 h-4" />}
                                                                </button>
                                                            </div>
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
                                </div>
                            )}

                            {activeTab === 'danger' && isOwner && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl border border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-white/5">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-gray-200 mb-2">
                                            <Trash2 className="w-4 h-4 text-red-500" /> Delete Project
                                        </h4>
                                        <p className="text-xs text-stone-500 dark:text-slate-400 mb-5 leading-relaxed">
                                            This action is permanent and cannot be undone. All project data, including tasks and files, will be permanently removed.
                                        </p>
                                        <button
                                            onClick={() => setConfirmDelete(true)}
                                            className="w-full md:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Delete Project...
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'leave' && !isOwner && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl border border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-white/5">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-gray-200 mb-2">
                                            <LogOut className="w-4 h-4 text-red-500" /> Leave Project
                                        </h4>
                                        <p className="text-xs text-stone-500 dark:text-slate-400 mb-5 leading-relaxed">
                                            Are you sure you want to leave this project? You will lose access to all tasks, discussions, and shared resources.
                                        </p>
                                        <button
                                            onClick={() => setConfirmLeave(true)}
                                            className="w-full md:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Leave Project...
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-stone-50 border-stone-100 dark:border-white/5 dark:bg-[#0c0c0e]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium border rounded-xl transition-colors text-stone-600 bg-white border-stone-200 hover:bg-stone-50 dark:text-slate-300 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
                    >
                        Close
                    </button>
                    {activeTab === 'general' && isOwner && (
                        <button
                            onClick={handleGeneralUpdate}
                            disabled={isUpdating || (
                                name.trim() === project.name &&
                                description.trim() === (project.description || '') &&
                                activityRetentionDays === (project.activityRetentionDays ?? 30) &&
                                color === (project.color || COLORS[0])
                            )}
                            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm shadow-purple-600/20 disabled:opacity-50"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>

            {/* Confirmations */}
            <DeleteConfirmation
                show={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message={
                    <>
                        Are you sure you want to delete <span className="font-bold text-stone-900 dark:text-white">"{project.name}"</span>?
                        This action is permanent and all data will be lost.
                    </>
                }
                confirmLabel="Delete Project"
                isProcessing={isDeleting}
            />

            <DeleteConfirmation
                show={confirmLeave}
                onClose={() => setConfirmLeave(false)}
                onConfirm={handleLeaveProject}
                title="Leave Project"
                message={
                    <>
                        Are you sure you want to leave <span className="font-bold text-stone-900 dark:text-white">"{project.name}"</span>?
                        You will lose access to all tasks and files.
                    </>
                }
                confirmLabel="Leave Project"
                isProcessing={isLeaving}
                processingLabel="Leaving..."
            />

            {memberToDelete && (
                <DeleteConfirmation
                    show={true}
                    onClose={() => setMemberToDelete(null)}
                    onConfirm={() => handleRemoveCollaborator(memberToDelete)}
                    title="Remove Member"
                    message="Are you sure you want to remove this member from the project?"
                    confirmLabel="Remove"
                    isProcessing={isRemoving}
                />
            )}
        </div>
    );
};

export default ProjectSettingsModal;
