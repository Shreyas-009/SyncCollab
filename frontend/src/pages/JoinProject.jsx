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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-stone-500 dark:text-slate-400">
            Loading invite...
          </p>
        </div>
      </div>
    );
  }

  if (error && !projectInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
        <div className="max-w-md w-full mx-4 p-4 rounded-2xl shadow-xl bg-white dark:bg-slate-800">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 dark:bg-red-900/30">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-center mb-2 text-stone-800 dark:text-gray-100">
            Invalid Invite Link
          </h1>
          <p className="text-center mb-6 text-stone-500 dark:text-slate-400">
            {error}
          </p>
          <button
            onClick={() => navigate("/")}
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
        <div className="max-w-md w-full mx-4 p-4 rounded-2xl shadow-xl bg-white dark:bg-slate-800">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 dark:bg-emerald-900/30">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-center mb-2 text-stone-800 dark:text-gray-100">
            Successfully Joined!
          </h1>
          <p className="text-center text-stone-500 dark:text-slate-400">
            You have joined{" "}
            <span className="font-medium">{projectInfo?.projectName}</span>.
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-900">
      <div className="max-w-md w-full mx-4 p-4 rounded-2xl shadow-xl bg-white dark:bg-slate-800 flex flex-col items-start gap-2">
        {/* Project Icon */}
        <div className="flex gap-2 justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: projectInfo?.projectColor || "#8B5CF6" }}
          >
            <h1 className="text-3xl flont-bold">
              {projectInfo?.projectName?.charAt(0).toUpperCase() || "P"}
            </h1>
          </div>

          <div className="flex flex-col gap-1 justify-start">
            {" "}
            <p className="text-lg font-semibold text-center text-stone-800 dark:text-gray-100 text-start">
              {projectInfo?.projectName}
            </p>
            {projectInfo?.createdByName && (
              <p className="text-sm text-center text-stone-400 dark:text-slate-500">
                Invited by {projectInfo.createdByName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-center  text-stone-800 dark:text-gray-100 text-start">
            Join Project
          </h1>

          <p className="text-center  text-stone-500 dark:text-slate-400">
            You've been invited to join
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm mb-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex p-1 gap-2 w-full">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 "
          >
            {joining ? "Joining..." : "Join Project"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 font-medium rounded-xl transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Decline Invite
          </button>
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
