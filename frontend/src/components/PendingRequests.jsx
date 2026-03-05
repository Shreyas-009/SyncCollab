import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'
import { getPendingRequests, acceptRequest, declineRequest } from '../utils/api'

const PendingRequests = ({ onRequestHandled }) => {
    const [requests, setRequests] = useState([]);
    // const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const { isDark } = useTheme();
    const { user } = useUser();

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
        setProcessingId(requestId);
        try {
            await acceptRequest(requestId, {
                userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                userImage: user?.imageUrl || ''
            });
            await loadRequests();
            if (onRequestHandled) onRequestHandled();
        } catch (error) {
            console.error('Error accepting request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (requestId) => {
        setProcessingId(requestId);
        try {
            await declineRequest(requestId);
            await loadRequests();
        } catch (error) {
            console.error('Error declining request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className={`fixed top-20 right-6 w-80 rounded-2xl shadow-xl overflow-hidden z-40 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-stone-200'
            }`}>
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-stone-100 bg-stone-50'
                }`}>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                    Collaboration Requests ({requests.length})
                </h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {requests.map(request => (
                    <div
                        key={request._id}
                        className={`p-4 border-b last:border-b-0 ${isDark ? 'border-slate-700' : 'border-stone-100'
                            }`}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {request.fromUserImage ? (
                                <img src={request.fromUserImage} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-600' : 'bg-stone-200'
                                    }`}>
                                    <span className="text-sm font-medium">
                                        {request.fromUserName?.[0] || request.fromUserEmail?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>
                                    {request.fromUserName || 'Someone'}
                                </p>
                                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                    {request.fromUserEmail}
                                </p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                                    wants to share: <span className="font-medium">"{request.taskTitle}"</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDecline(request._id)}
                                disabled={processingId === request._id}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${isDark
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleAccept(request._id)}
                                disabled={processingId === request._id}
                                className='flex-1 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50'
                            >
                                {processingId === request._id ? '...' : 'Accept'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingRequests
