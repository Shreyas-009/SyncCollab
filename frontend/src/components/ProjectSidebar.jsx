import React, { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useTheme } from '../context/useTheme';
import { getPendingInvites } from '../utils/api';

const NavItem = ({ icon, label, active, onClick, badge, variant = 'default' }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active
                ? variant === 'special' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-stone-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-sm border border-transparent hover:border-stone-200/50 dark:hover:border-slate-700'
        }`}
    >
        <i className={`bi ${icon} text-base leading-none`} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
                {badge}
            </span>
        )}
    </button>
);

const ProjectSidebar = ({
    projects,
    selectedProject,
    onSelectProject,
    onCreateProject,
    isOpen,
    onToggle,
    onShowRequests,
    currentPage,
    onNavigate,
    onShowSettings,
    onShowInvite,
}) => {
    const [pendingCount, setPendingCount] = useState(0);
    const { isDark } = useTheme();
    const { user } = useUser();
    const { openUserProfile, signOut } = useClerk();
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    useEffect(() => {
        loadPendingCount();
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!accountMenuRef.current) return;
            if (!accountMenuRef.current.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const loadPendingCount = async () => {
        try {
            const invites = await getPendingInvites();
            setPendingCount(invites?.length || 0);
        } catch (e) { /* ignore */ }
    };

    // ── COLLAPSED sidebar (16) ──────────────────────────────────────────
    if (!isOpen) {
        return (
            <aside className="hidden md:flex w-16 h-full flex-col items-center py-4 border-r bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 z-50">
                <button
                    onClick={onToggle}
                    className="p-2 rounded-xl mb-6 hover:bg-stone-100 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400"
                >
                    <i className="bi bi-layout-sidebar text-lg" />
                </button>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => onNavigate('hub')}
                        className={`p-2.5 rounded-xl transition-all ${currentPage === 'hub' ? 'bg-purple-600 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                        title="Projects Hub"
                    >
                        <i className="bi bi-grid-fill text-lg" />
                    </button>
                    {selectedProject && (
                        <>
                            <div className="w-8 h-px bg-stone-200 dark:bg-slate-800 my-1 mx-auto" />
                            <button
                                onClick={() => onNavigate('board')}
                                className={`p-2.5 rounded-xl transition-all ${currentPage === 'board' ? 'bg-purple-600 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                                title="Board"
                            >
                                <i className="bi bi-kanban text-lg" />
                            </button>
                            <button
                                onClick={() => onNavigate('nexus')}
                                className={`p-2.5 rounded-xl transition-all ${currentPage === 'nexus' ? 'bg-indigo-600 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                                title="Nexus AI"
                            >
                                <i className="bi bi-lightning-charge-fill text-lg" />
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-auto pb-4">
                    <button onClick={() => openUserProfile()} className="w-10 h-10 rounded-xl overflow-hidden shadow-sm hover:scale-105 transition-transform">
                        <img src={user?.imageUrl} className="w-full h-full object-cover" alt="" />
                    </button>
                </div>
            </aside>
        );
    }

    // ── EXPANDED sidebar (Drawer) ───────────────────────────────────────
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onToggle}
            />

            <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-72 h-full flex flex-col border-r bg-[#f8f9fa] dark:bg-[#0c0c0e] border-stone-200 dark:border-white/5 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 h-[72px] border-b border-stone-200/50 dark:border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-600/20 shrink-0">
                            S
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-stone-800 dark:text-slate-100">SyncCollab</h2>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-xl hover:bg-stone-200/50 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors md:flex hidden"
                        title="Collapse"
                    >
                        <i className="bi bi-layout-sidebar-inset text-lg" />
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-xl hover:bg-stone-200/50 text-stone-500 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors md:hidden"
                    >
                        <i className="bi bi-x-lg text-lg" />
                    </button>
                </div>

                {/* ── Main Nav Area ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 flex flex-col gap-1">
                    
                    {selectedProject ? (
                        <>
                            <button
                                onClick={() => { onSelectProject(null); onNavigate('hub'); if(window.innerWidth < 768) onToggle(); }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group mb-2"
                            >
                                <i className="bi bi-chevron-left text-[10px] group-hover:-translate-x-0.5 transition-transform" />
                                ALL PROJECTS
                            </button>

                            <div className="px-3 py-3 mb-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-stone-200/60 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-md"
                                        style={{ backgroundColor: selectedProject.color || '#8B5CF6' }}
                                    >
                                        {selectedProject.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-stone-800 dark:text-slate-100 truncate leading-tight">
                                            {selectedProject.name}
                                        </h3>
                                        <p className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Active Workspace</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600 px-3 mb-2">Navigation</p>
                            <NavItem icon="bi-kanban" label="Board" active={currentPage === 'board'} onClick={() => { onNavigate('board'); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-activity" label="Activity" active={currentPage === 'activity'} onClick={() => { onNavigate('activity'); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-people" label="Members" active={currentPage === 'members'} onClick={() => { onNavigate('members'); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-lightning-charge-fill" label="Nexus AI" active={currentPage === 'nexus'} onClick={() => { onNavigate('nexus'); if (window.innerWidth < 768) onToggle(); }} variant="special" />
                            
                            <div className="h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600 px-3 mb-2">Management</p>
                            <NavItem icon="bi-person-plus" label="Invite People" onClick={() => { onShowInvite(); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-gear" label="Project Settings" onClick={() => { onShowSettings(); if (window.innerWidth < 768) onToggle(); }} />
                        </>
                    ) : (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600 px-3 mt-2 mb-2">Workspace</p>
                            <NavItem icon="bi-grid-fill" label="Projects Hub" active={currentPage === 'hub'} onClick={() => { onNavigate('hub'); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-inbox-fill" label="Requests" active={false} onClick={onShowRequests} badge={pendingCount > 0 ? pendingCount : null} />
                        </>
                    )}
                </div>

                {/* ── Footer / Account ── */}
                <div className="px-3 pb-6 pt-4 border-t border-stone-200/50 dark:border-white/5 bg-[#f8f9fa] dark:bg-[#0c0c0e]">
                    <div className="relative" ref={accountMenuRef}>
                        <button 
                            onClick={() => openUserProfile()}
                            className="w-full flex items-center gap-3 p-2.5 pr-10 rounded-2xl border border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-stone-200/50 dark:hover:border-white/5 transition-all group"
                        >
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} className="w-10 h-10 rounded-xl shadow-sm object-cover group-hover:scale-105 transition-transform" alt="" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <i className="bi bi-person text-purple-600 dark:text-purple-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-stone-800 dark:text-slate-100 truncate leading-tight text-left">
                                    {user?.fullName || 'User'}
                                </h4>
                                <p className="text-xs text-stone-400 dark:text-slate-500 truncate text-left">
                                    {user?.primaryEmailAddress?.emailAddress || 'Account Settings'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setAccountMenuOpen((prev) => !prev);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            title="Profile menu"
                        >
                            <i className="bi bi-three-dots-vertical" />
                        </button>

                        {accountMenuOpen && (
                            <div className="absolute right-0 bottom-[60px] w-44 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1 z-50">
                                <button
                                    onClick={() => {
                                        setAccountMenuOpen(false);
                                        openUserProfile();
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-200 transition-colors"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setAccountMenuOpen(false);
                                        signOut();
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ProjectSidebar;
