import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { getPendingRequests, acceptRequest, declineRequest } from '../utils/api'
import useMutationLocks from '../hooks/useMutationLocks'

const PendingRequests = ({ onRequestHandled }) => {
    const [requests, setRequests] = useState([]);
    // const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const { runLocked, isLocked } = useMutationLocks()

    useEffect(() => {
        loadRequests();
        // Poll for new requests every 30 seconds
        const interval = setInterval(loadRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getPendingRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleAccept = async (requestId) => {
        const actionKey = `request:accept:${requestId}`
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await acceptRequest(requestId, {
                    userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                    userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    userImage: user?.imageUrl || ''
                });
                await loadRequests();
                if (onRequestHandled) onRequestHandled();
            });
            if (!executed) return
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleDecline = async (requestId) => {
        const actionKey = `request:decline:${requestId}`
        try {
            const { executed } = await runLocked(actionKey, async () => {
                await declineRequest(requestId);
                await loadRequests();
            });
            if (!executed) return
        } catch (error) {
            console.error('Error declining request:', error);
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className="fixed top-20 right-6 w-80 rounded-2xl shadow-xl overflow-hidden z-40 bg-white border border-stone-200 dark:bg-[#0c0c0e] dark:border-white/5">
            <div className="px-4 py-3 border-b flex items-center gap-2 border-stone-100 bg-stone-50 dark:border-white/5 dark:bg-white/5">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-stone-800 dark:text-gray-100">
                    Collaboration Requests ({requests.length})
                </h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {requests.map(request => {
                    const isAccepting = isLocked(`request:accept:${request._id}`)
                    const isDeclining = isLocked(`request:decline:${request._id}`)
                    const isProcessing = isAccepting || isDeclining

                    return (
                    <div
                        key={request._id}
                        className="p-4 border-b last:border-b-0 border-stone-100 dark:border-white/5"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {request.fromUserImage ? (
                                <img src={request.fromUserImage} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-200 dark:bg-white/10">
                                    <span className="text-sm font-medium">
                                        {request.fromUserName?.[0] || request.fromUserEmail?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-stone-800 dark:text-gray-100">
                                    {request.fromUserName || 'Someone'}
                                </p>
                                <p className="text-xs truncate text-stone-500 dark:text-slate-400">
                                    {request.fromUserEmail}
                                </p>
                                <p className="text-xs mt-1 text-stone-600 dark:text-slate-300">
                                    wants to share: <span className="font-medium">"{request.taskTitle}"</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDecline(request._id)}
                                disabled={isProcessing}
                                className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                                {isDeclining ? 'Declining...' : 'Decline'}
                            </button>
                            <button
                                onClick={() => handleAccept(request._id)}
                                disabled={isProcessing}
                                className='flex-1 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50'
                            >
                                {isAccepting ? 'Accepting...' : 'Accept'}
                            </button>
                        </div>
                    </div>
                    )
                })}
            </div>
        </div>
    );
};

export default PendingRequests
