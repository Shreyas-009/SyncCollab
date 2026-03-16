import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

const ROLES = ['Team Lead', 'Frontend Developer', 'Backend Developer', 'Tester', 'Designer', 'Member'];

const MOCK_PROJECT = {
    ownerName: "Alex Rivera",
    ownerEmail: "alex@example.com",
    collaborators: [
        { id: '1', name: "Sam Chen", email: "sam@example.com", role: "Frontend Developer" },
        { id: '2', name: "Jordan Lee", email: "jordan@example.com", role: "Designer" }
    ]
};

const MemberCard = ({ member, isOwner, isCurrentUser }) => {
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [currentRole, setCurrentRole] = useState(member.role);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowRoleMenu(false);
            }
        };

        if (showRoleMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRoleMenu]);

    const handleRoleUpdate = (newRole) => {
        setCurrentRole(newRole);
        setShowRoleMenu(false);
    };

    return (
        <div className="bg-white dark:bg-[#111114] border border-stone-200/60 dark:border-white/5 rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 group transition-all hover:shadow-md">
            <div className="relative shrink-0">
                {member.image ? (
                    <img src={member.image} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm" alt="" />
                ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-base md:text-lg font-bold text-stone-400 dark:text-slate-500">
                        {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white dark:border-[#111114] bg-green-500`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <h4 className="font-bold text-sm md:text-base text-stone-800 dark:text-slate-100 truncate">{member.name || 'Invited User'}</h4>
                    {isCurrentUser && (
                        <span className="text-[9px] md:text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">You</span>
                    )}
                </div>
                <p className="text-[10px] md:text-xs text-stone-400 dark:text-slate-500 truncate">{member.email}</p>
            </div>

            <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowRoleMenu(!showRoleMenu)}
                        className={`text-[9px] md:text-[11px] font-bold px-1.5 md:px-2.5 py-1 rounded-lg transition-all bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-600 dark:text-slate-100 whitespace-nowrap`}
                    >
                        <span className="max-w-[70px] md:max-w-none truncate inline-block align-bottom">{currentRole}</span>
                        <i className="bi bi-chevron-down ml-1 md:ml-1.5 text-[8px]" />
                    </button>

                    {showRoleMenu && (
                        <div className="absolute right-0 mt-2 w-40 md:w-48 max-h-[104px] overflow-y-auto custom-scrollbar bg-white dark:bg-[#111114] border border-stone-200 dark:border-white/5 shadow-xl rounded-xl z-50 p-1 animate-in fade-in zoom-in duration-200">
                            {ROLES.map(role => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleUpdate(role)}
                                    className={`w-full text-left px-3 py-2 text-[10px] md:text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors ${currentRole === role ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10' : 'text-stone-600 dark:text-slate-300'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    disabled
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-stone-100 dark:bg-white/5 text-stone-400 dark:text-slate-600 cursor-not-allowed shrink-0"
                    title="Remove member (disabled in preview)"
                >
                    <i className="bi bi-trash text-[10px] md:text-xs" />
                </button>
            </div>
        </div>
    );
};

const OwnerCard = ({ project }) => (
    <div className="bg-stone-50 dark:bg-white/5 border border-purple-100 dark:border-purple-600/20 rounded-2xl p-5 flex items-center gap-4 mb-6 shadow-sm">
        <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {project.ownerName?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-[#111114] rounded-full shadow-sm">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Project Owner" />
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-stone-800 dark:text-slate-100 text-base">{project.ownerName || 'Project Owner'}</h4>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Owner</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{project.ownerEmail}</p>
        </div>
    </div>
);

const MembersPreview = () => {
    const { isDark } = useTheme();

    return (
      <div className="flex-1 flex flex-col h-full bg-[#fafafa] dark:bg-[#0c0c0e] overflow-hidden">
        {/* Header Area */}
        <div className="shrink-0 px-4 md:px-10 py-3 md:py-0 min-h-[72px] md:h-[72px] flex items-center border-b border-stone-200/50 dark:border-white/5 bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-xl">
          <div className="flex flex-row md:items-center justify-between gap-3 md:gap-4 w-full">
            <div className="flex items-center md:items-center gap-3 min-w-0 flex-1 ">
              <button
                disabled
                className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-slate-300 opacity-50 cursor-not-allowed"
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
                disabled
                className="w-10 h-10 flex items-center justify-center rounded-xl opacity-50 cursor-not-allowed text-stone-500 dark:text-amber-400"
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
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-10 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-end mb-6">
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600/50 text-white rounded-xl text-sm font-bold shadow-none cursor-not-allowed"
              >
                <i className="bi bi-person-plus text-base" />
                Invite New Member
              </button>
            </div>
            {/* Owner Section */}
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-gray-500 mb-4 px-1">
              Organization
            </h3>
            <OwnerCard project={MOCK_PROJECT} />

            {/* Collaborators Section */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-gray-500">
                Team Members
              </h3>
              <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {MOCK_PROJECT.collaborators.length} Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_PROJECT.collaborators.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isOwner={true}
                  isCurrentUser={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
};

export default MembersPreview;
