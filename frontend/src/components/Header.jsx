import React, { useState, useEffect, useRef } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import InviteModal from './InviteModal'
import ProjectSettingsModal from './ProjectSettingsModal'

const Header = ({ onOpen, onSearch, selectedProject, onProjectsUpdated }) => {
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
            <header className={`flex items-center justify-between gap-4 px-6 py-4 border-b transition-colors duration-300 ${isDark
                ? 'bg-slate-900 border-slate-700'
                : 'bg-white border-stone-200'
                }`}>

                {/* Left: Project Info */}
                <div className="flex items-center gap-3 min-w-0">
                    {selectedProject ? (
                        <>
                            <div
                                className="w-4 h-4 rounded-md shrink-0"
                                style={{ backgroundColor: selectedProject.color || '#8B5CF6' }}
                            />
                            <h1 className={`text-xl font-bold truncate ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                {selectedProject.name}
                            </h1>

                            {/* Owner + Collaborators avatars - clickable to open settings */}
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex -space-x-3 ml-3 shrink-0 hover:opacity-80 transition-opacity"
                                title="Manage project members"
                            >
                                {/* Owner avatar */}
                                <div className={`w-9 h-9 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} overflow-hidden shadow-sm`}>
                                    {selectedProject.ownerImage ? (
                                        <img src={selectedProject.ownerImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'}`}>
                                            {selectedProject.ownerName?.[0] || selectedProject.ownerEmail?.[0]?.toUpperCase() || 'O'}
                                        </div>
                                    )}
                                </div>

                                {/* Collaborator avatars */}
                                {selectedProject.collaborators?.slice(0, 3).map((c, i) => (
                                    <div key={c.id || i} className={`w-9 h-9 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} overflow-hidden shadow-sm`}>
                                        {c.image ? (
                                            <img src={c.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-stone-300 text-stone-700'}`}>
                                                {c.name?.[0] || c.email?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* +N badge if more than 3 collaborators */}
                                {selectedProject.collaborators?.length > 3 && (
                                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold shadow-sm ${isDark ? 'border-slate-900 bg-slate-700 text-slate-200' : 'border-white bg-stone-800 text-white'}`}>
                                        +{selectedProject.collaborators.length - 3}
                                    </div>
                                )}
                            </button>
                        </>
                    ) : (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                            Select a project
                        </p>
                    )}
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            className={`w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${isDark
                                ? 'bg-slate-800 text-gray-100 border-slate-700 placeholder-slate-500'
                                : 'bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400'
                                }`}
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
                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full transition-colors ${isDark
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Add Task Button */}
                    <button
                        onClick={onOpen}
                        disabled={!selectedProject}
                        className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Task
                    </button>

                    {/* Invite Button - Only for owners */}
                    {selectedProject && isOwner && (
                        <button
                            onClick={() => setShowInvite(true)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                                }`}
                            title="Invite collaborators"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </button>
                    )}

                    {/* Settings Button */}
                    {selectedProject && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                                }`}
                            title="Project settings"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-colors ${isDark
                            ? 'text-amber-400 hover:bg-slate-800'
                            : 'text-stone-500 hover:bg-stone-100'
                            }`}
                        title="Toggle theme"
                    >
                        {isDark ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    {/* Divider */}
                    <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-700' : 'bg-stone-200'}`} />

                    {/* User Profile */}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                                userButtonPopoverCard: isDark ? "bg-slate-800 border-slate-700" : "",
                                userButtonPopoverFooter: isDark ? "hidden" : ""
                            }
                        }}
                    />
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