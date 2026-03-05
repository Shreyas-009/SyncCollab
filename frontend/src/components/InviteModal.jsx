import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import { searchUsers, sendProjectInvite, sendInvitation, createInviteLink } from '../utils/api'

const InviteModal = ({ show, onClose, project }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mode, setMode] = useState('search');
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const { isDark } = useTheme();
    const { user } = useUser();

    if (!show) return null;

    const handleSearch = async () => {
        if (!email.trim() || email.length < 3) {
            setMessage('Enter at least 3 characters to search');
            return;
        }

        setStatus('searching');
        setMessage('');
        setSearchResults([]);

        try {
            const users = await searchUsers(email);
            setSearchResults(users);
            if (users.length === 0) {
                setMessage('No users found. You can invite them instead!');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error searching users');
        } finally {
            setStatus('idle');
        }
    };

    const handleSendInvite = async (toUser) => {
        if (!project) {
            setMessage('No project selected');
            return;
        }

        setStatus('sending');
        try {
            await sendProjectInvite({
                projectId: project._id,
                toUserId: toUser.id,
                toUserEmail: toUser.email,
                fromUserEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                fromUserName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                fromUserImage: user?.imageUrl || ''
            });
            setStatus('success');
            setMessage(`Invite sent to ${toUser.firstName || toUser.email}! They need to accept it.`);
            setTimeout(() => handleClose(), 2000);
        } catch (error) {
            setStatus('error');
            const errorMsg = error.response?.data?.message || 'Failed to send invite';
            setMessage(errorMsg);
        }
    };

    const handleInviteNew = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address');
            return;
        }

        setStatus('sending');
        try {
            await sendInvitation(email);
            setStatus('success');
            setMessage(`Invitation sent to ${email}!`);
            setTimeout(() => handleClose(), 2000);
        } catch (error) {
            setStatus('error');
            const errorMsg = error.response?.data?.message || 'Failed to send invitation';
            setMessage(errorMsg);
        }
    };

    const handleGenerateLink = async () => {
        if (!project) {
            setMessage('No project selected');
            return;
        }

        setStatus('generating');
        setMessage('');
        try {
            const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
            const response = await createInviteLink(project._id, userName);
            setInviteLink(response.data.inviteUrl);
            setStatus('success');
            setMessage('Invite link generated! Share it with others.');
        } catch (error) {
            setStatus('error');
            const errorMsg = error.response?.data?.message || 'Failed to generate invite link';
            setMessage(errorMsg);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setMessage('Failed to copy link');
        }
    };

    const handleClose = () => {
        setEmail('');
        setStatus('idle');
        setMessage('');
        setSearchResults([]);
        setMode('search');
        setInviteLink('');
        setCopied(false);
        onClose();
    };

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={handleClose}
        >
            <div
                className={`flex flex-col w-[90%] max-w-lg rounded-2xl shadow-xl overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-stone-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-stone-100 bg-stone-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'
                            }`}>
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                Invite to Project
                            </h2>
                            {project && (
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                    <span className="font-medium">{project.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                            }`}
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                    <button
                        onClick={() => setMode('search')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'search'
                            ? isDark ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'
                            : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Find User
                    </button>
                    <button
                        onClick={() => setMode('invite')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'invite'
                            ? isDark ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'
                            : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Invite New
                    </button>
                    <button
                        onClick={() => setMode('link')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'link'
                            ? isDark ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'
                            : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Invite via Link
                    </button>
                </div>

                {/* Content */}
                <div className={`px-6 py-5 max-h-[60vh] overflow-y-auto ${isDark ? '' : 'bg-white'}`}>
                    {mode === 'search' && (
                        <>
                            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                Search for users. They will receive an invite to join this project.
                            </p>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="email"
                                    className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                        ? 'bg-slate-900 text-gray-100 border-slate-600 placeholder-slate-500'
                                        : 'bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400'
                                        }`}
                                    placeholder='Search by email...'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={status === 'searching'}
                                    className='px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50'
                                >
                                    {status === 'searching' ? '...' : 'Search'}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className={`rounded-xl border ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
                                    {searchResults.map(resultUser => (
                                        <div
                                            key={resultUser.id}
                                            className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-stone-100 hover:bg-stone-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {resultUser.imageUrl ? (
                                                    <img src={resultUser.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-600' : 'bg-stone-200'}`}>
                                                        <span className="text-sm font-medium">{resultUser.firstName?.[0] || resultUser.email[0].toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                                        {resultUser.firstName} {resultUser.lastName}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                                        {resultUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSendInvite(resultUser)}
                                                disabled={status === 'sending'}
                                                className='px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50'
                                            >
                                                Send Invite
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'invite' && (
                        <>
                            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                Send an email invitation to someone who doesn't have an account yet.
                            </p>

                            <input
                                type="email"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                    ? 'bg-slate-900 text-gray-100 border-slate-600 placeholder-slate-500'
                                    : 'bg-stone-50 text-stone-800 border-stone-200 placeholder-stone-400'
                                    }`}
                                placeholder='Enter email address...'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </>
                    )}

                    {mode === 'link' && (
                        <>
                            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                Generate a shareable link that anyone can use to join this project.
                            </p>

                            {!inviteLink ? (
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={status === 'generating'}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-colors ${isDark
                                        ? 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/50 text-slate-300'
                                        : 'border-stone-300 hover:border-purple-500 hover:bg-purple-50 text-stone-600'
                                        } disabled:opacity-50`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    {status === 'generating' ? 'Generating...' : 'Generate Invite Link'}
                                </button>
                            ) : (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600' : 'bg-stone-50 border-stone-200'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-stone-700'}`}>
                                            Invite Link
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={inviteLink}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg border ${isDark
                                                ? 'bg-slate-800 border-slate-700 text-gray-300'
                                                : 'bg-white border-stone-200 text-stone-600'
                                                }`}
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                }`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Status Message */}
                    {message && (
                        <div className={`mt-4 p-3 rounded-xl text-sm ${status === 'success'
                            ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                            : status === 'error'
                                ? isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'
                                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-stone-100 text-stone-600'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-stone-50 border-stone-100'
                    }`}>
                    <button
                        onClick={handleClose}
                        className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${isDark
                            ? 'text-slate-300 bg-slate-800 border-slate-600 hover:bg-slate-700'
                            : 'text-stone-600 bg-white border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        Cancel
                    </button>
                    {mode === 'invite' && (
                        <button
                            onClick={handleInviteNew}
                            disabled={status === 'sending'}
                            className='px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50'
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Invite'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteModal
