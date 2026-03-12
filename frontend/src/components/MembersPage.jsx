import React, { useState } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { updateCollaboratorRole, removeCollaborator } from '../utils/api';
import useMutationLocks from '../hooks/useMutationLocks';
import DeleteConfirmation from './DeleteConfirmation';
import { useTheme } from '../context/useTheme';

const ROLES = ['Team Lead', 'Frontend Developer', 'Backend Developer', 'Tester', 'Designer', 'Member'];

const MemberCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800/80 border border-stone-200/60 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-slate-700" />
        <div className="flex-1 min-w-0">
            <div className="h-4 bg-stone-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
            <div className="h-3 bg-stone-100 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-stone-100 dark:bg-slate-700 rounded-lg" />
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-700" />
        </div>
    </div>
);

const MemberCard = ({ member, isOwner, isCurrentUser, onUpdateRole, onRequestRemove, isUpdatingRole, isRemoving }) => {
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const isBusy = isUpdatingRole || isRemoving;

    const handleRoleUpdate = async (newRole) => {
        setShowRoleMenu(false);
        await onUpdateRole(member.id, newRole);
    };

    const handleRemove = async () => {
        if (isBusy) return;
        onRequestRemove(member);
    };

    return (
        <div className="bg-white dark:bg-slate-800/80 border border-stone-200/60 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 group transition-all hover:shadow-md">
            <div className="relative shrink-0">
                {member.image ? (
                    <img src={member.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-stone-400 dark:text-slate-500">
                        {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${member.id ? 'bg-green-500' : 'bg-stone-300'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-800 dark:text-slate-100 truncate">{member.name || 'Invited User'}</h4>
                    {isCurrentUser && (
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>
                    )}
                </div>
                <p className="text-xs text-stone-400 dark:text-slate-500 truncate">{member.email}</p>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                <div className="relative">
                    <button
                        onClick={() => isOwner && !isCurrentUser && setShowRoleMenu(!showRoleMenu)}
                        disabled={isBusy || !isOwner || isCurrentUser}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                            isOwner && !isCurrentUser 
                                ? 'bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-stone-600 dark:text-slate-300' 
                                : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        }`}
                    >
                        {member.role || 'Member'}
                        {isOwner && !isCurrentUser && <i className="bi bi-chevron-down ml-1.5 text-[8px]" />}
                    </button>
                    {isUpdatingRole && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-purple-200 dark:border-purple-900/50 border-t-purple-600 dark:border-t-purple-400 animate-spin bg-white dark:bg-slate-800" />
                    )}

                    {showRoleMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-xl rounded-xl z-50 p-1 animate-in fade-in zoom-in duration-200">
                            {ROLES.map(role => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleUpdate(role)}
                                    disabled={isBusy}
                                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors ${member.role === role ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10' : 'text-stone-600 dark:text-slate-300'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isOwner && !isCurrentUser && (
                    <button
                        onClick={handleRemove}
                        disabled={isBusy}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove member"
                    >
                        {isRemoving ? (
                            <span className="w-3.5 h-3.5 rounded-full border border-red-300 border-t-red-600 animate-spin" />
                        ) : (
                            <i className="bi bi-trash text-xs" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const OwnerCardSkeleton = () => (
    <div className="bg-white/70 dark:bg-slate-800/60 border border-stone-200/60 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 mb-6 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-slate-700" />
        <div className="flex-1 min-w-0">
            <div className="h-4 bg-stone-100 dark:bg-slate-700 rounded w-40 mb-2" />
            <div className="h-3 bg-stone-100 dark:bg-slate-700 rounded w-56" />
        </div>
    </div>
);

const OwnerCard = ({ project, isCurrentUser }) => (
    <div className="bg-gradient-to-br from-purple-600/5 to-indigo-600/5 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-5 flex items-center gap-4 mb-6 shadow-sm">
        <div className="relative shrink-0">
            {project.ownerImage ? (
                <img src={project.ownerImage} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
            ) : (
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {project.ownerName?.[0]?.toUpperCase() || 'P'}
                </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Project Owner" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-stone-800 dark:text-slate-100 text-base">{project.ownerName || 'Project Owner'}</h4>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Owner</span>
                {isCurrentUser && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>}
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{project.ownerEmail}</p>
        </div>
    </div>
);

const MembersPage = ({ selectedProject, onProjectUpdated, onShowInvite, onToggleSidebar, isLoading = false }) => {
    const { user } = useUser();
    const isOwner = selectedProject.ownerId === user?.id;
    const { runLocked, isLocked } = useMutationLocks();
    const [memberToRemove, setMemberToRemove] = useState(null);
    const showSkeletons = isLoading || !selectedProject || !Array.isArray(selectedProject.collaborators);
    const { isDark, toggleTheme } = useTheme();

    const getRoleUpdateKey = (collaboratorId) => `member:update-role:${selectedProject._id}:${collaboratorId}`;
    const getRemoveMemberKey = (collaboratorId) => `member:remove:${selectedProject._id}:${collaboratorId}`;

    const handleUpdateRole = async (collaboratorId, role) => {
        const actionKey = getRoleUpdateKey(collaboratorId);
        try {
            const { executed } = await runLocked(actionKey, async () => {
                const updatedProject = await updateCollaboratorRole(selectedProject._id, collaboratorId, role);
                if (onProjectUpdated) await onProjectUpdated(updatedProject);
            });
            if (!executed) return;
        } catch {
            alert('Failed to update role');
        }
    };

    const handleRemoveMember = async (collaboratorId) => {
        const actionKey = getRemoveMemberKey(collaboratorId);
        try {
            const { executed } = await runLocked(actionKey, async () => {
                const updatedProject = await removeCollaborator(selectedProject._id, collaboratorId);
                if (onProjectUpdated) await onProjectUpdated(updatedProject);
            });
            if (!executed) return;
            setMemberToRemove(null);
        } catch {
            alert('Failed to remove member');
        }
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-[#fafafa] dark:bg-[#0c0c0e] overflow-hidden">
        {/* Header Area */}
        <div className="shrink-0 px-4 md:px-10 py-3 md:py-0 min-h-[72px] md:h-[72px] flex items-center border-b border-stone-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="flex flex-row md:items-center justify-between gap-3 md:gap-4 w-full">
            <div className="flex items-center md:items-center gap-3 min-w-0 flex-1 ">
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-stone-800 dark:text-slate-100 tracking-tight">
                  Project Members
                </h2>
                <p className="text-xs text-stone-400 dark:text-slate-500 font-medium">
                  Manage team access and control permissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-stone-500 hover:bg-stone-100 dark:text-amber-400 dark:hover:bg-slate-800"
                title="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-end mb-6">
              <button
                onClick={onShowInvite}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
              >
                <i className="bi bi-person-plus text-base" />
                Invite New Member
              </button>
            </div>
            {/* Owner Section */}
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-600 mb-4 px-1">
              Organization
            </h3>
            {showSkeletons ? (
              <OwnerCardSkeleton />
            ) : (
              <OwnerCard project={selectedProject} isCurrentUser={isOwner} />
            )}

            {/* Collaborators Section */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-600">
                Team Members
              </h3>
              {showSkeletons ? (
                <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <span className="inline-block w-6 h-3 rounded bg-stone-200/80 dark:bg-slate-600/70 animate-pulse" />
                </span>
              ) : (
                selectedProject.collaborators?.length > 0 && (
                  <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {selectedProject.collaborators.length} Total
                  </span>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showSkeletons ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <MemberCardSkeleton key={`member-skeleton-${i}`} />
                  ))}
                </>
              ) : selectedProject.collaborators?.length > 0 ? (
                selectedProject.collaborators.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isOwner={isOwner}
                    isCurrentUser={member.id === user?.id}
                    onUpdateRole={handleUpdateRole}
                    onRequestRemove={(member) => setMemberToRemove(member)}
                    isUpdatingRole={isLocked(getRoleUpdateKey(member.id))}
                    isRemoving={isLocked(getRemoveMemberKey(member.id))}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800/40 border border-dashed border-stone-200 dark:border-slate-700 rounded-2xl text-center">
                  <div className="w-12 h-12 bg-stone-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <i className="bi bi-people text-stone-300 dark:text-slate-600 text-2xl" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-600 dark:text-slate-400 mb-1">
                    No collaborators yet
                  </h4>
                  <p className="text-xs text-stone-400 dark:text-slate-500 mb-4">
                    Start by inviting team members to this project.
                  </p>
                  <button
                    onClick={onShowInvite}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Send invitations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {memberToRemove && (
          <DeleteConfirmation
            show={true}
            onClose={() => setMemberToRemove(null)}
            onConfirm={() => handleRemoveMember(memberToRemove.id)}
            title="Remove Member"
            message={
              <>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-stone-800 dark:text-gray-100">
                  "{memberToRemove.name || memberToRemove.email}"
                </span>{" "}
                from this project?
              </>
            }
            confirmLabel="Remove"
            processingLabel="Removing..."
            isProcessing={isLocked(getRemoveMemberKey(memberToRemove.id))}
          />
        )}
      </div>
    );
};

export default MembersPage;
