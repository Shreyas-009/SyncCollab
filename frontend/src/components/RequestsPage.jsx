import React, { useState, useEffect } from 'react'
import { getPendingInvites, acceptInvite, declineInvite } from '../utils/api'
import useMutationLocks from '../hooks/useMutationLocks'

const RequestsPage = ({ onClose, onInviteAccepted }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { runLocked, isLocked } = useMutationLocks();

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
        const actionKey = `invite:accept:${inviteId}`;
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await acceptInvite(inviteId);
                await loadInvites();
                if (onInviteAccepted) onInviteAccepted();
            });
            if (!executed) return;
        } catch (error) {
            console.error('Error accepting invite:', error);
        }
    };

    const handleDecline = async (inviteId) => {
        const actionKey = `invite:decline:${inviteId}`;
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await declineInvite(inviteId);
                await loadInvites();
            });
            if (!executed) return;
        } catch (error) {
            console.error('Error declining invite:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0c0c0e] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-white/5">
                <div>
                    <h2 className="text-xl font-bold text-stone-800 dark:text-slate-100 tracking-tight">
                        Project Invites
                    </h2>
                    <p className="text-xs text-stone-400 dark:text-slate-500 font-medium">
                        Management of collaboration requests
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-all duration-200 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-stone-50/30 dark:bg-[#0c0c0e]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-stone-400 dark:text-slate-500">
                            Loading your invites...
                        </p>
                    </div>
                ) : invites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#111114] shadow-sm border border-stone-100 dark:border-white/5 flex items-center justify-center mb-5 opacity-40 group hover:opacity-100 transition-opacity">
                            <svg className="w-10 h-10 text-stone-400 dark:text-slate-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                            </svg>
                        </div>
                        <p className="text-base font-bold text-stone-600 dark:text-slate-300 mb-1">
                            Inbox is clear
                        </p>
                        <p className="text-sm text-stone-400 dark:text-slate-500">
                            No pending collaboration requests found.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {invites.map(invite => {
                            const isAccepting = isLocked(`invite:accept:${invite._id}`);
                            const isDeclining = isLocked(`invite:decline:${invite._id}`);
                            const isProcessing = isAccepting || isDeclining;

                            return (
                                <div
                                    key={invite._id}
                                    className="group relative bg-white dark:bg-[#111114] rounded-2xl border border-stone-200/50 dark:border-white/5 overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-black/40 transition-all duration-300"
                                >
                                    {/* Accent strip */}
                                    <div 
                                        className="h-1 w-full absolute top-0 left-0" 
                                        style={{ backgroundColor: invite.projectColor || '#8B5CF6' }}
                                    />

                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex items-start gap-4">
                                            {/* User Avatar */}
                                            <div className="relative shrink-0">
                                                {invite.fromUserImage ? (
                                                    <img src={invite.fromUserImage} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-slate-300 font-bold text-lg shadow-inner">
                                                        {invite.fromUserName?.[0] || invite.fromUserEmail?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#111114] flex items-center justify-center shadow-sm">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111114]" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-stone-800 dark:text-slate-100 truncate text-base leading-tight">
                                                    {invite.fromUserName || 'Invitation'}
                                                </h4>
                                                <p className="text-xs font-medium text-stone-400 dark:text-slate-500 truncate mb-2">
                                                    {invite.fromUserEmail}
                                                </p>
                                                
                                                <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                                                    <div
                                                        className="w-2 h-2 rounded-full shadow-sm animate-pulse"
                                                        style={{ backgroundColor: invite.projectColor || '#8B5CF6' }}
                                                    />
                                                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-tight">
                                                        {invite.projectName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2.5 mt-1">
                                            <button
                                                onClick={() => handleDecline(invite._id)}
                                                disabled={isProcessing}
                                                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 border border-transparent hover:border-stone-300/50 dark:hover:border-white/10"
                                            >
                                                {isDeclining ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <div className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                                                        Declining
                                                    </span>
                                                ) : 'Ignore'}
                                            </button>
                                            <button
                                                onClick={() => handleAccept(invite._id)}
                                                disabled={isProcessing}
                                                className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-200 dark:shadow-purple-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                            >
                                                {isAccepting ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Accepting
                                                    </span>
                                                ) : 'Accept Invite'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsPage
