import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const HeroSection = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-[#0a0a0c]">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 inset-x-0 h-[600px] w-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 dark:bg-white/5 border border-stone-200/50 dark:border-white/5 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-stone-600 dark:text-slate-300">
            SyncCollab 2.0 is Live
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] text-stone-900 dark:text-white mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Sync Your Team,<br />
          <span className="text-purple-600 dark:text-purple-500 drop-shadow-sm">
            Amplify Your Output
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-stone-600 dark:text-slate-400 mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          The ultimate workspace bridging intelligent task management, real-time collaboration, and powerful AI analysis. Stop switching tabs, start shipping.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          {!isLoaded ? (
            <div className="w-40 h-14 rounded-2xl bg-stone-100 dark:bg-white/5 animate-pulse" />
          ) : isSignedIn ? (
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10 transition-all duration-300 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10 transition-all duration-300 active:scale-95"
            >
              Get Started for Free
            </Link>
          )}

          <a href="#features" className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-white/5 text-stone-900 dark:text-white font-bold rounded-2xl border border-stone-200 dark:border-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
            Explore Features
          </a>
        </div>

        {/* Realistic App Preview Mockup */}
        <div className="mt-20 relative mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 perspective-2000">
          <div className="relative rounded-2xl md:rounded-3xl border border-stone-300/40 dark:border-white/5 bg-slate-100/50 dark:bg-[#0c0c0e] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden transform-gpu">
            {/* Window chrome / Title bar */}
            <div className="h-10 border-b border-stone-200 dark:border-white/5 bg-white/90 dark:bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1" />
            </div>

            <div className="flex h-[500px] md:h-[600px]">
              {/* Sidebar Mock - Hidden on mobile */}
              <div className="hidden md:flex md:w-56 shrink-0 border-r border-stone-200 dark:border-white/5 bg-white/60 dark:bg-white/5 flex-col p-4">
                 {/* Logo Area */}
                <div className="flex items-center gap-3 mb-10 px-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="w-24 h-4 bg-slate-300 dark:bg-white/10 rounded-full" />
                </div>

                {/* Nav Items */}
                <div className="space-y-6">
                  <div>
                    <div className="px-3 mb-4">
                      <div className="w-12 h-2 bg-slate-300 dark:bg-white/10 rounded-full opacity-60" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-white/10 shadow-sm border border-stone-200 dark:border-white/5">
                        <div className="w-5 h-5 rounded-lg bg-indigo-600/40 dark:bg-indigo-400/30 shrink-0" />
                        <div className="w-20 h-3 bg-indigo-600/40 dark:bg-indigo-400/30 rounded-full" />
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 opacity-50">
                          <div className="w-5 h-5 rounded-lg bg-slate-300 dark:bg-white/10 shrink-0" />
                          <div className="w-16 h-3 bg-slate-300 dark:bg-white/10 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="px-3 mb-4">
                      <div className="w-16 h-2 bg-slate-300 dark:bg-white/10 rounded-full opacity-60" />
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 opacity-50">
                      <div className="w-5 h-5 rounded-lg bg-slate-300 dark:bg-white/10 shrink-0" />
                      <div className="w-20 h-3 bg-slate-300 dark:bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Profile Section Added at Bottom */}
                <div className="mt-auto pt-4 border-t border-stone-200 dark:border-white/10">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="w-20 h-2.5 bg-slate-400 dark:bg-white/20 rounded-full mb-1.5" />
                      <div className="w-24 h-2 bg-slate-300 dark:bg-white/10 rounded-full opacity-60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area Mock */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header Mock */}
                <div className="h-16 border-b border-stone-200/50 dark:border-white/5 bg-white/40 dark:bg-transparent flex items-center px-8 gap-4">
                  <div className="w-32 md:w-56 h-9 bg-slate-200 dark:bg-white/5 rounded-xl border border-stone-200 dark:border-white/5" />
                  <div className="flex-1" />
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-white/5 shrink-0" />
                    <div className="w-28 h-9 rounded-xl bg-indigo-600/40 dark:bg-indigo-500/20 shrink-0 hidden sm:block" />
                  </div>
                </div>

                {/* Kanban Content Mock */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="flex gap-6 h-full">
                    {/* Columns */}
                    {['Pending', 'In Progress', 'Completed'].map((col, idx) => (
                      <div key={idx} className={`flex-1 min-w-[240px] flex flex-col bg-slate-200/40 dark:bg-[#111114] rounded-2xl border border-stone-200/40 dark:border-white/5 ${idx > 1 ? 'hidden xl:flex' : idx > 0 ? 'hidden md:flex' : ''}`}>
                         <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-indigo-500/60' : idx === 1 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} />
                               <div className="w-16 h-3 bg-slate-400 dark:bg-white/10 rounded-full" />
                            </div>
                            <div className="w-6 h-4 bg-slate-300 dark:bg-white/5 rounded-full opacity-40" />
                         </div>
                         <div className="p-3 space-y-3 flex-1 overflow-hidden">
                            {/* Card Mocks */}
                            {[1, 2, 3].map((card, cidx) => (
                              <div key={idx + '-' + cidx} className="bg-white dark:bg-[#16161a] p-5 rounded-2xl border border-stone-200/60 dark:border-white/5 shadow-sm">
                                 <div className="space-y-3">
                                    <div className="w-full h-3 bg-slate-200 dark:bg-white/5 rounded-full" />
                                    <div className="w-2/3 h-2.5 bg-slate-100 dark:bg-white/5 rounded-full" />
                                 </div>
                                 <div className="mt-5 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex gap-1">
                                       <div className="w-12 h-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20" />
                                       <div className="w-12 h-4 rounded-lg bg-amber-50 dark:bg-amber-900/20" />
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
        
      </div>
    </section>
  );
};

export default HeroSection;
