import React, { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useTheme } from '../context/useTheme';
import { getPendingInvites } from '../utils/api';
import { Settings, Monitor, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-stone-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm border border-transparent hover:border-stone-200/50 dark:hover:border-white/5'
        }`}
    >
        <i className={`bi ${icon} text-base leading-none`} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
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
    const { isDark, toggleTheme } = useTheme();
    const { user } = useUser();
    const { openUserProfile, signOut } = useClerk();
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [displayMenuOpen, setDisplayMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const navigate = useNavigate();

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
                setDisplayMenuOpen(false);
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
            <aside className="hidden md:flex w-16 h-full flex-col items-center pt-4 border-r bg-[#f8f9fa] dark:bg-[#0c0c0e] border-stone-200 dark:border-white/5 z-50 transition-colors">
                <button
                    onClick={onToggle}
                    className="p-2 px-3 rounded-xl mb-6 hover:bg-stone-200/50 text-stone-500 dark:hover:bg-white/5 dark:text-slate-400"
                    title="Expand"
                >
                    <i className="bi bi-layout-sidebar text-lg " size={24} />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col gap-2 px-2 items-center">
                    {selectedProject ? (
                        <>
                            <button
                                onClick={() => { onSelectProject(null); onNavigate('hub'); }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5 mb-2 shrink-0 group"
                                title="All Projects"
                            >
                                <i className="bi bi-chevron-left text-lg transition-transform" />
                            </button>
                            
                            <div className="relative group shrink-0 mb-2 w-10 h-10">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-md cursor-help"
                                    style={{ backgroundColor: selectedProject.color || '#8B5CF6' }}
                                    title={selectedProject.name}
                                >
                                    {selectedProject.name?.[0]?.toUpperCase()}
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate('board')}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${currentPage === 'board' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                                title="Board"
                            >
                                <i className="bi bi-kanban text-lg" />
                            </button>
                            <button
                                onClick={() => onNavigate('activity')}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${currentPage === 'activity' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                                title="Activity"
                            >
                                <i className="bi bi-activity text-lg" />
                            </button>
                            <button
                                onClick={() => onNavigate('members')}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${currentPage === 'members' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                                title="Members"
                            >
                                <i className="bi bi-people text-lg" />
                            </button>
                            <button
                                onClick={() => onNavigate('nexus')}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${currentPage === 'nexus' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                                title="Nexus AI"
                            >
                                <i className="bi bi-lightning-charge-fill text-lg" />
                            </button>
                            
                            <div className="w-6 h-px bg-stone-200 dark:bg-white/5 my-2 shrink-0" />
                            
                            <button
                                onClick={onShowInvite}
                                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5"
                                title="Invite People"
                            >
                                <i className="bi bi-person-plus text-lg" />
                            </button>
                            <button
                                onClick={onShowSettings}
                                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5"
                                title="Project Settings"
                            >
                                <i className="bi bi-gear text-lg" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onShowRequests}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative shrink-0 ${pendingCount > 0 ? 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5' : 'text-stone-500 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:bg-white/5'}`}
                                title="Requests"
                            >
                                <i className="bi bi-inbox-fill text-lg" />
                                {pendingCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-[#f8f9fa] dark:border-[#0c0c0e]" />
                                )}
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-auto p-2 relative" ref={accountMenuRef}>
                    <button 
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                        className={`w-10 h-10 rounded-xl overflow-hidden shadow-sm transition-all border ${accountMenuOpen ? 'border-purple-500 dark:border-purple-600 ring-2 ring-purple-500/20' : 'border-transparent'}`}
                        title={user?.fullName || 'User Profile'}
                    >
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <i className="bi bi-person text-purple-600 dark:text-purple-400 text-lg" />
                            </div>
                        )}
                    </button>
                    {accountMenuOpen && (
                        <div className="absolute left-full bottom-4 ml-3 w-56 rounded-xl border border-stone-200 dark:border-white/5 bg-white dark:bg-[#111114] shadow-xl py-2 px-1.5 z-[60] flex flex-col gap-0.5 animate-in fade-in zoom-in duration-200">
                                <button
                                onClick={() => { setAccountMenuOpen(false); openUserProfile(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors"
                            >
                                <Settings className="w-4 h-4 shrink-0" /> Settings
                            </button>
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDisplayMenuOpen(!displayMenuOpen); }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors"
                                >
                                    <div className="flex items-center gap-3"><Monitor className="w-4 h-4 shrink-0" /> Display</div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${displayMenuOpen ? 'rotate-90 text-stone-500' : 'text-stone-400'}`} />
                                </button>
                                {displayMenuOpen && (
                                    <div className="absolute left-full top-0 ml-3 w-32 rounded-xl border border-stone-200 dark:border-white/5 bg-white dark:bg-[#111114] shadow-xl py-2 px-1.5 z-[70] flex flex-col gap-0.5 animate-in fade-in zoom-in duration-200">
                                        <button onClick={() => { if(isDark) toggleTheme(); setDisplayMenuOpen(false); setAccountMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${!isDark ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200'}`}><Sun className="w-4 h-4 shrink-0" /> Light</button>
                                        <button onClick={() => { if(!isDark) toggleTheme(); setDisplayMenuOpen(false); setAccountMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isDark ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200'}`}><Moon className="w-4 h-4 shrink-0" /> Dark</button>
                                    </div>
                                )}
                            </div>
                            <div className="h-px bg-stone-200 dark:bg-white/5 my-1 mx-2" />
                             <button onClick={() => { setAccountMenuOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors group">
                                <LogOut className="w-4 h-4 shrink-0 group-hover:text-stone-900 dark:group-hover:text-white" /> Log Out
                            </button>
                        </div>
                    )}
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
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-600/20 shrink-0">
                            S
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-stone-800 dark:text-white">SyncCollab</h2>
                    </button>
                    <button
                        onClick={onToggle}
                        className="py-2 px-3 rounded-xl hover:bg-stone-200/50 text-stone-500 dark:hover:bg-white/5 dark:text-white/50 transition-colors md:flex hidden"
                        title="Collapse"
                    >
                        <i className="bi bi-layout-sidebar-inset text-lg" />
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-xl hover:bg-stone-200/50 text-stone-500 dark:hover:bg-white/5 dark:text-slate-400 transition-colors md:hidden"
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

                            <div className="px-3 py-3 mb-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/60 dark:border-white/5 shadow-sm">
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
                             <NavItem icon="bi-lightning-charge-fill" label="Nexus AI" active={currentPage === 'nexus'} onClick={() => { onNavigate('nexus'); if (window.innerWidth < 768) onToggle(); }} />
                            
                            <div className="h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600 px-3 mb-2">Management</p>
                            <NavItem icon="bi-person-plus" label="Invite People" onClick={() => { onShowInvite(); if (window.innerWidth < 768) onToggle(); }} />
                            <NavItem icon="bi-gear" label="Project Settings" onClick={() => { onShowSettings(); if (window.innerWidth < 768) onToggle(); }} />
                        </>
                    ) : (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600 px-3 mt-2 mb-2">Workspace</p>
                                   <NavItem icon="bi-inbox-fill" label="Requests" active={false} onClick={onShowRequests} badge={pendingCount > 0 ? pendingCount : null} />
                        </>
                    )}
                </div>

                {/* ── Footer / Account ── */}
                <div className="p-3 border-t border-stone-200/50 dark:border-white/5 bg-[#f8f9fa] dark:bg-[#0c0c0e]">
                    <div className="relative" ref={accountMenuRef}>
                        <button 
                            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group ${accountMenuOpen ? 'bg-stone-200/50 dark:bg-white/5' : 'hover:bg-stone-200/50 dark:hover:bg-white/5'}`}
                        >
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} className="w-10 h-10 rounded-xl shadow-sm object-cover group-hover:scale-105 transition-transform shrink-0" alt="" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                    <i className="bi bi-person text-purple-600 dark:text-purple-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 pr-1">
                                <h4 className="text-sm font-bold text-stone-800 dark:text-slate-100 truncate leading-tight text-left">
                                    {user?.fullName || 'User'}
                                </h4>
                                <p className="text-xs text-stone-400 dark:text-slate-500 truncate text-left">
                                    {user?.primaryEmailAddress?.emailAddress || 'Account Settings'}
                                </p>
                            </div>
                        </button>

                        {accountMenuOpen && (
                            <div className="absolute left-0 bottom-[calc(100%+8px)] w-full rounded-xl border border-stone-200 dark:border-white/5 bg-white dark:bg-[#111114] shadow-xl py-2 px-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <button
                                    onClick={() => {
                                        setAccountMenuOpen(false);
                                        openUserProfile();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors"
                                >
                                    <Settings className="w-4 h-4 shrink-0" />
                                    Settings
                                </button>
                                
                                <div className="relative">
                                         <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDisplayMenuOpen(!displayMenuOpen);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Monitor className="w-4 h-4 shrink-0" />
                                            Display
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${displayMenuOpen ? 'rotate-90 text-stone-500' : 'text-stone-400'}`} />
                                    </button>

                                     {displayMenuOpen && (
                                        <div className="absolute left-full bottom-0 ml-3 w-26 sm:w-32 rounded-xl border border-stone-200 dark:border-white/5 bg-white dark:bg-[#111114] shadow-xl py-2 px-1.5 z-[60] flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <button
                                                onClick={() => { if(isDark) toggleTheme(); setDisplayMenuOpen(false); setAccountMenuOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${!isDark ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200'}`}
                                            >
                                                <Sun className="w-4 h-4 shrink-0" />
                                                Light
                                            </button>
                                            <button
                                                onClick={() => { if(!isDark) toggleTheme(); setDisplayMenuOpen(false); setAccountMenuOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isDark ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200'}`}
                                            >
                                                <Sun className="w-4 h-4 shrink-0" />
                                                Dark
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-stone-200 dark:bg-white/5 my-1 mx-2" />
                                
                                 <button
                                    onClick={() => {
                                        setAccountMenuOpen(false);
                                        signOut();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-slate-200 transition-colors group"
                                >
                                    <LogOut className="w-4 h-4 shrink-0 group-hover:text-stone-900 dark:group-hover:text-white" />
                                    Log Out
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
