import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUser,
  useAuth,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import {
  getInviteLinkInfo,
  acceptInviteLink,
  setAuthFunctions,
} from "../utils/api";
import useMutationLocks from "../hooks/useMutationLocks";

const JoinProjectContent = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { runLocked, isLocked } = useMutationLocks();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectInfo, setProjectInfo] = useState(null);
  const [success, setSuccess] = useState(false);

  const joinKey = `invite:link:accept:${token || "none"}`;
  const joining = isLocked(joinKey);

  // Set up auth functions for API calls
  useEffect(() => {
    setAuthFunctions(
      () => getToken(),
      () => user?.id,
    );
  }, [getToken, user]);

  useEffect(() => {
    const fetchLinkInfo = async () => {
      try {
        const response = await getInviteLinkInfo(token);
        setProjectInfo(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired invite link",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLinkInfo();
    }
  }, [token]);

  const handleJoin = async () => {
    setError("");

    try {
      const { executed } = await runLocked(joinKey, async () => {
        await acceptInviteLink(token);
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 2000);
      });
      if (!executed) return;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-slate-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm font-bold text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse">
            Validating...
          </p>
        </div>
      </div>
    );
  }

  if (error && !projectInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-red-500/10 border border-stone-200/50 dark:border-slate-800 p-8 text-center ring-1 ring-black/5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-50 dark:bg-red-500/10">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-gray-100 tracking-tight">
            Invalid Invite Link
          </h1>
          <p className="mb-8 text-stone-500 dark:text-slate-400 leading-relaxed">
            {error || "This invitation link has expired or is no longer valid."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-emerald-500/10 border border-stone-200/50 dark:border-slate-800 p-8 text-center ring-1 ring-black/5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-emerald-50 dark:bg-emerald-500/10">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-gray-100 tracking-tight">
            Successfully Joined!
          </h1>
          <p className="text-stone-500 dark:text-slate-400 mb-8 px-4 leading-relaxed">
            You are now a member of <span className="font-bold text-stone-700 dark:text-slate-200">{projectInfo?.projectName}</span>. 
            Taking you to your dashboard...
          </p>
          <div className="w-full bg-stone-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full animate-[progress_2s_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/30 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-purple-500/5 border border-stone-200/50 dark:border-slate-800 overflow-hidden ring-1 ring-black/5">
        {/* Top Gradient Header */}
        <div 
           className="h-32 w-full relative overflow-hidden"
           style={{ backgroundColor: projectInfo?.projectColor || '#8B5CF6' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
        </div>

        <div className="px-8 pb-8 pt-0 -mt-10 relative">
          {/* Project Icon */}
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-2xl mb-6 mx-auto transition-transform hover:scale-105 duration-300"
            style={{ backgroundColor: projectInfo?.projectColor || '#8B5CF6' }}
          >
            <h1 className="text-4xl font-black uppercase text-white drop-shadow-sm">
              {projectInfo?.projectName?.charAt(0) || "P"}
            </h1>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-stone-800 dark:text-white tracking-tight mb-1">
              Join Project
            </h1>
            <p className="text-sm font-medium text-stone-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Collaboration Invite
            </p>
            
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-700/50">
               <div className="text-left">
                  <p className="text-[11px] text-stone-400 dark:text-slate-500 font-bold uppercase">Project Name</p>
                  <p className="text-sm font-bold text-stone-700 dark:text-slate-200">{projectInfo?.projectName}</p>
               </div>
               <div className="w-px h-6 bg-stone-200 dark:bg-slate-700 mx-1"></div>
               <div className="text-left">
                  <p className="text-[11px] text-stone-400 dark:text-slate-500 font-bold uppercase">Invited By</p>
                  <p className="text-sm font-bold text-stone-700 dark:text-slate-200">{projectInfo?.createdByName || "Owner"}</p>
               </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleJoin}
              disabled={joining}
              className="group relative w-full py-4 bg-purple-600 text-white font-bold rounded-2xl overflow-hidden hover:bg-purple-700 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:active:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Joining Project...
                </span>
              ) : "Accept Invitation"}
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-4 text-sm font-bold text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
            >
              Decline Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JoinProject = () => {
  const { token } = useParams();
  return (
    <>
      <SignedIn>
        <JoinProjectContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={token ? `/join/${token}` : "/"} />
      </SignedOut>
    </>
  );
};

export default JoinProject;
