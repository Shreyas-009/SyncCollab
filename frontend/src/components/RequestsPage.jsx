import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import { getPendingInvites, acceptInvite, declineInvite } from '../utils/api'

const RequestsPage = ({ onClose, onInviteAccepted }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const { isDark } = useTheme();
    const { user } = useUser();

    useEffect(() => {
        loadInvites();
    }, []);

    const loadInvites = async () => {
        try {
            const data = await getPendingInvites();
            setInvites(data || []);
        } catch (error) {
            console.error('Error loading invites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (inviteId) => {
        setProcessingId(inviteId);
        try {
            await acceptInvite(inviteId, {
                userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                userImage: user?.imageUrl || ''
            });
            await loadInvites();
            if (onInviteAccepted) onInviteAccepted();
        } catch (error) {
            console.error('Error accepting invite:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (inviteId) => {
        setProcessingId(inviteId);
        try {
            await declineInvite(inviteId);
            await loadInvites();
        } catch (error) {
            console.error('Error declining invite:', error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4.5 border-b border-stone-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-stone-800 dark:text-gray-100">
                    Project Invites
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors text-stone-400 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <p className="text-center py-8 text-stone-500 dark:text-slate-400">
                        Loading...
                    </p>
                ) : invites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="w-12 h-12 mb-3 opacity-30 text-stone-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                        <p className="text-sm text-stone-500 dark:text-slate-400">
                            No pending invites
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invites.map(invite => (
                            <div
                                key={invite._id}
                                className="p-4 rounded-xl border bg-stone-50 border-stone-200 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    {invite.fromUserImage ? (
                                        <img src={invite.fromUserImage} alt="" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-200 dark:bg-slate-600">
                                            <span className="text-sm font-medium">
                                                {invite.fromUserName?.[0] || invite.fromUserEmail?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-800 dark:text-gray-100">
                                            {invite.fromUserName || 'Someone'}
                                        </p>
                                        <p className="text-xs truncate text-stone-500 dark:text-slate-400">
                                            {invite.fromUserEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white dark:bg-slate-700/50">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: invite.projectColor || '#8B5CF6' }}
                                    />
                                    <span className="text-sm font-medium text-stone-700 dark:text-gray-200">
                                        {invite.projectName}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecline(invite._id)}
                                        disabled={processingId === invite._id}
                                        className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleAccept(invite._id)}
                                        disabled={processingId === invite._id}
                                        className='flex-1 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50'
                                    >
                                        {processingId === invite._id ? '...' : 'Accept'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsPage
