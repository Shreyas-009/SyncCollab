import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useTheme } from "../context/useTheme";
import { Link } from "react-router-dom";
import HeroSection from "../components/landing/HeroSection";
import KanbanPreview from "../components/landing/KanbanPreview";
import PricingSection from "../components/landing/PricingSection";
import ActivityPreview from "../components/landing/ActivityPreview";
import MembersPreview from "../components/landing/MembersPreview";
import NexusPreview from "../components/landing/NexusPreview";
import { Sun, Moon, Github, Linkedin } from "lucide-react";
import logo from "../assets/logo.svg";

const Logo = () => (
  <div className="w-10 h-10 flex items-center justify-center relative overflow-hidden group rounded-xl">
    <img
      src="/favicon.svg"
      alt="SyncCollab Logo"
      className="w-full h-full object-contain"
    />
  </div>
);

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-[#0c0c0e] selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-stone-200/50 dark:border-white/5 bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
              SyncCollab
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {!isLoaded ? (
              <div className="w-24 h-10 rounded-xl animate-pulse bg-stone-100 dark:bg-slate-800" />
            ) : isSignedIn ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white transition-colors hidden sm:block"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <HeroSection />

      {/* Actual UI Features Showcase */}
      <section
        id="features"
        className="py-24 px-6 bg-stone-50/50 dark:bg-[#0c0c0e] w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Feature 1: Kanban */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-widest">
                Task Management
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[1.1]">
                Visual Kanban Boards
              </h2>
              <p className="text-lg text-stone-600 dark:text-slate-400 font-medium leading-relaxed">
                Take control of your workflow with intuitive drag-and-drop
                boards. Organize tasks dynamically, set priorities, and see
                exactly what needs to be done.
              </p>
              <ul className="space-y-2.5 text-sm text-stone-600 dark:text-slate-400 font-medium">
                {[
                  "Drag & drop tasks across status columns",
                  "Assign tasks to team members with avatars",
                  "Task types: Feature, Bug Fix, Design, Docs & more",
                  "Priority levels with visual signal indicators",
                  "Filter by assignee, priority — simultaneously",
                  "Threaded comments on every task card",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7 relative rounded-2xl md:rounded-[3rem] border-4 md:border-8 border-white dark:border-white/5 shadow-2xl overflow-hidden">
              <KanbanPreview />
            </div>
          </div>

          {/* Feature 2: Nexus AI */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 relative rounded-2xl md:rounded-[3rem] border-4 md:border-8 border-white dark:border-white/5 shadow-2xl overflow-hidden h-[500px] flex">
              <NexusPreview />
            </div>
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2 pl-0 lg:pl-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-widest">
                Intelligence
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[1.1]">
                Meet Nexus AI
              </h2>
              <p className="text-lg text-stone-600 dark:text-slate-400 font-medium leading-relaxed">
                Your personal AI product manager — fully aware of your entire
                project context. Ask anything, get structured answers instantly.
              </p>
              <ul className="space-y-2.5 text-sm text-stone-600 dark:text-slate-400 font-medium">
                {[
                  "Full context of your entire project history",
                  "Ask in plain English — get structured markdown reports",
                  "Export any response as a formatted PDF instantly",
                  "Predefined smart prompts for common needs",
                  "Detects blockers and highlights critical risks",
                  "Works like chatting with your own PM, 24/7",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3: Members & Roles */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-widest">
                Collaboration
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[1.1]">
                Granular Role Control
              </h2>
              <p className="text-lg text-stone-600 dark:text-slate-400 font-medium leading-relaxed">
                Invite your team and enforce clear boundaries. Assign specific
                roles and control exactly who can do what across your workspace.
              </p>
              <ul className="space-y-2.5 text-sm text-stone-600 dark:text-slate-400 font-medium">
                {[
                  "Assign roles: Team Lead, Designer, Developer, Tester & more",
                  "Invite via shareable link with one click",
                  "Search by email if the user is already registered",
                  "In-app notification sent to existing members instantly",
                  "Email invite for users not yet on the platform",
                  "Remove or reassign members at any time",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7 relative rounded-2xl md:rounded-[3rem] border-4 md:border-8 border-white dark:border-white/5 shadow-2xl overflow-hidden h-[540px] flex">
              <MembersPreview />
            </div>
          </div>

          {/* Feature 4: Activity Trails */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 relative rounded-2xl md:rounded-[3rem] border-4 md:border-8 border-white dark:border-white/5 shadow-2xl overflow-hidden h-[500px] flex hide-scrollbar">
              <ActivityPreview />
            </div>
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2 pl-0 lg:pl-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-widest">
                Compliance & Transparency
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[1.1]">
                Complete Audit Trail
              </h2>
              <p className="text-lg text-stone-600 dark:text-slate-400 font-medium leading-relaxed">
                Never lose track of who changed what. Every action is
                permanently logged with author, timestamp, and full context.
              </p>
              <ul className="space-y-2.5 text-sm text-stone-600 dark:text-slate-400 font-medium">
                {[
                  "Timestamped logs for every task and project action",
                  "Visual timeline ordered from most recent to oldest",
                  "Filter by date ranges: 30, 60, or 90 day windows",
                  "See exactly who created, edited, or deleted what",
                  "Log retention configurable per project plan",
                  "Audit trail for role & member changes too",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0c0c0e] px-6 py-16 w-full border-t border-stone-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo />
                <span className="font-bold text-stone-900 dark:text-white tracking-tight text-xl">
                  SyncCollab
                </span>
              </div>
              <p className="text-sm text-stone-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mb-6">
                The AI-powered collaboration workspace built for modern,
                fast-moving teams. Designed to sync workflows and amplify
                outputs.
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Shreyas-009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-stone-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/shreyas-tungar-23878a252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-stone-600 dark:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-6 tracking-wide uppercase text-xs">
                Product
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <a
                    href="#features"
                    className="text-stone-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-stone-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-6 tracking-wide uppercase text-xs">
                Legal
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <a
                    href="#"
                    className="text-stone-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-stone-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-200/50 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-stone-500 dark:text-slate-400 font-medium text-center md:text-left">
              © {new Date().getFullYear()} SyncCollab Inc. All rights reserved.{" "}
              <br className="md:hidden" />
            </p>
            <p className="text-sm font-semibold text-stone-600 dark:text-slate-300">
              Created by{" "}
              <a
                href="https://www.linkedin.com/in/shreyas-tungar-23878a252"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Shreyas Tungar
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
