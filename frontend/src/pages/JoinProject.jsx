import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useAuth, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { getInviteLinkInfo, acceptInviteLink, setAuthFunctions } from '../utils/api';
import useMutationLocks from '../hooks/useMutationLocks';

const JoinProjectContent = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { runLocked, isLocked } = useMutationLocks();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const [success, setSuccess] = useState(false);

    const joinKey = `invite:link:accept:${token || 'none'}`;
    const joining = isLocked(joinKey);

    // Set up auth functions for API calls
    useEffect(() => {
        setAuthFunctions(
            () => getToken(),
            () => user?.id
        );
    }, [getToken, user]);

    useEffect(() => {
        const fetchLinkInfo = async () => {
            try {
                const response = await getInviteLinkInfo(token);
                setProjectInfo(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired invite link');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchLinkInfo();
        }
    }, [token]);

    const handleJoin = async () => {
        setError('');

        try {
            const { executed } = await runLocked(joinKey, async () => {
                await acceptInviteLink(token, {
                    userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                    userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    userImage: user?.imageUrl || ''
                });
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            });
            if (!executed) return;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join project');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Loading invite...</p>
                </div>
            </div>
        );
    }

    if (error && !projectInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-800">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 dark:bg-red-900/30">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-center mb-2 text-stone-800 dark:text-gray-100">
                        Invalid Invite Link
                    </h1>
                    <p className="text-center mb-6 text-stone-500 dark:text-slate-400">
                        {error}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-800">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 dark:bg-emerald-900/30">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-center mb-2 text-stone-800 dark:text-gray-100">
                        Successfully Joined!
                    </h1>
                    <p className="text-center text-stone-500 dark:text-slate-400">
                        You have joined <span className="font-medium">{projectInfo?.projectName}</span>. Redirecting...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
            <div className="max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-800">
                {/* Project Icon */}
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: projectInfo?.projectColor || '#8B5CF6' }}
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </div>

                <h1 className="text-xl font-semibold text-center mb-2 text-stone-800 dark:text-gray-100">
                    Join Project
                </h1>

                <p className="text-center mb-2 text-stone-500 dark:text-slate-400">
                    You've been invited to join
                </p>

                <p className="text-lg font-semibold text-center mb-1 text-stone-800 dark:text-gray-100">
                    {projectInfo?.projectName}
                </p>

                {projectInfo?.createdByName && (
                    <p className="text-sm text-center mb-6 text-stone-400 dark:text-slate-500">
                        Invited by {projectInfo.createdByName}
                    </p>
                )}

                {error && (
                    <div className="p-3 rounded-xl text-sm mb-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 mb-3"
                >
                    {joining ? 'Joining...' : 'Join Project'}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 font-medium rounded-xl transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

const JoinProject = () => {
    return (
        <>
            <SignedIn>
                <JoinProjectContent />
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
};

export default JoinProject;
