import React, { useState, useEffect, useRef } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { useTheme } from '../context/useTheme'
import InviteModal from './InviteModal'
import ProjectSettingsModal from './ProjectSettingsModal'
import { Menu, UserPlus, Settings, Search, XCircle, Sparkles, Plus, Sun, Moon } from 'lucide-react'

const Header = ({ onOpen, onSearch, selectedProject, onProjectsUpdated, onOpenChat, onToggleSidebar }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { user } = useUser();
    const debounceRef = useRef(null);

    const isOwner = selectedProject?.ownerId === user?.id;

    // Debounced auto-search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onSearch(searchQuery);
        }, 300); // 300ms delay

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery, onSearch]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <>
            <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 border-b bg-white border-stone-200/60 shadow-sm dark:bg-slate-900 dark:border-slate-800 z-30 h-[72px]">

                {/* Left: Hamburger Menu (Mobile) & Project Info */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Hamburger Menu - Mobile Only */}
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        title="Toggle Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {selectedProject ? (
                        <>
                            <div
                                className="w-5 h-5 rounded-lg shrink-0 shadow-sm"
                                style={{ backgroundColor: selectedProject.color || '#8B5CF6' }}
                            />
                            <h1 className="text-xl font-bold truncate tracking-tight text-stone-800 dark:text-gray-100 hidden sm:block">
                                {selectedProject.name}
                            </h1>

                            {/* Divider hidden on mobile */}
                            <div className="hidden sm:block w-px h-5 mx-2 bg-stone-200 dark:bg-slate-700" />

                            {/* Project Actions Grouped Together */}
                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                {/* Collaborator Avatars */}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="flex -space-x-3 hover:opacity-80 transition-opacity mr-1"
                                    title="Manage project members"
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm relative z-30">
                                        {selectedProject.ownerImage ? (
                                            <img src={selectedProject.ownerImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-purple-500 text-white dark:bg-purple-700">
                                                {selectedProject.ownerName?.[0] || selectedProject.ownerEmail?.[0]?.toUpperCase() || 'O'}
                                            </div>
                                        )}
                                    </div>
                                    {selectedProject.collaborators?.slice(0, 2).map((c, i) => (
                                        <div key={c.id || i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm relative z-[${20 - i}]`}>
                                            {c.image ? (
                                                <img src={c.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-stone-300 text-stone-700 dark:bg-slate-700 dark:text-slate-200">
                                                    {c.name?.[0] || c.email?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {selectedProject.collaborators?.length > 2 && (
                                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm border-white bg-stone-100 text-stone-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300 z-10">
                                            +{selectedProject.collaborators.length - 2}
                                        </div>
                                    )}
                                </button>

                                {/* Invite Button - Only owners */}
                                {isOwner && (
                                    <button
                                        onClick={() => setShowInvite(true)}
                                        className="h-8 px-2.5 rounded-lg transition-colors text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-purple-900/40 dark:hover:text-purple-400 hidden sm:flex items-center gap-1.5"
                                        title="Invite collaborators"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Invite
                                    </button>
                                )}

                                {/* Settings Button */}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                                    title="Project settings"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm font-medium text-stone-500 dark:text-slate-400">
                            Select project
                        </p>
                    )}
                </div>

                {/* Center: Search & Ask AI */}
                <div className="flex-1 max-w-md hidden lg:flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-2.5 text-sm font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-stone-50 text-stone-800 border-stone-200/80 placeholder-stone-400 dark:bg-slate-900/50 dark:text-gray-100 dark:border-slate-700 dark:placeholder-slate-500 dark:focus:ring-purple-500/30 shadow-sm shadow-stone-200/20 dark:shadow-none"
                            placeholder='Search tasks...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!selectedProject}
                        />
                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors text-stone-400 hover:text-stone-600 hover:bg-stone-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Ask AI - sleek secondary button */}
                    <button
                        onClick={onOpenChat}
                        disabled={!selectedProject}
                        className='flex items-center justify-center gap-2 w-10 h-10 shrink-0 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                        title="Ask AI"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Primary Call to Action & Profile */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    
                    {/* Add Task - Dominant CTA */}
                    <button
                        onClick={onOpen}
                        disabled={!selectedProject}
                        className='flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98]'
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Task</span>
                    </button>

                    <div className="w-px h-6 mx-0 sm:mx-1 bg-stone-200 dark:bg-slate-700 hidden sm:block" />

                    {/* Universal Layout Controls */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors text-stone-500 hover:bg-stone-100 dark:text-amber-400 dark:hover:bg-slate-800"
                            title="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User Profile */}
                        <div className="pl-1 relative z-50">
                            <UserButton
                                appearance={{
                                    baseTheme: isDark ? dark : undefined,
                                    elements: {
                                        avatarBox: "w-9 h-9 rounded-xl shadow-sm",
                                        userButtonPopoverCard: "bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-xl rounded-2xl",
                                        userButtonPopoverFooter: "hidden",
                                        userPreviewMainIdentifier: "text-stone-800 dark:text-gray-100 font-semibold",
                                        userPreviewSecondaryIdentifier: "text-stone-500 dark:text-slate-400 font-medium",
                                        userButtonPopoverActionButton: "hover:bg-stone-50 dark:hover:bg-slate-700/50 text-stone-600 dark:text-slate-300 font-medium rounded-xl transition-colors",
                                        userButtonPopoverActionButtonText: "text-stone-600 dark:text-slate-300",
                                        userButtonPopoverActionButtonIcon: "text-stone-500 dark:text-slate-400",
                                        userMenuOptionsBox: "dark:bg-slate-800",
                                        userMenuContent: "dark:bg-slate-800 font-sans",
                                        navbar: "dark:bg-slate-800/80 backdrop-blur-md border-r border-stone-200 dark:border-slate-700",
                                        navbarButton: "text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors",
                                        pageScrollBox: "bg-white dark:bg-slate-900/30",
                                        profileSectionTitle: "text-stone-800 dark:text-slate-100 font-bold",
                                        profileSectionPrimaryButton: "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg",
                                        profilePage: "bg-white dark:bg-slate-900 font-sans",
                                        headerTitle: "text-stone-800 dark:text-gray-100 font-bold text-xl",
                                        headerSubtitle: "text-stone-500 dark:text-slate-400",
                                        card: "bg-white dark:bg-slate-900 font-sans rounded-2xl border border-stone-200 dark:border-slate-800 shadow-2xl",
                                        profileSectionContent: "dark:text-slate-300",
                                        formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm",
                                        formFieldInput: "bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 rounded-xl text-stone-800 dark:text-slate-200 focus:ring-purple-500",
                                        badge: "bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-stone-200 dark:border-slate-700",
                                    }
                                }}
                            >
                            </UserButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Invite Modal */}
            <InviteModal
                show={showInvite}
                onClose={() => setShowInvite(false)}
                project={selectedProject}
            />

            {/* Project Settings Modal */}
            <ProjectSettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                project={selectedProject}
                onProjectUpdated={onProjectsUpdated}
            />
        </>
    )
}

export default Header