import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from './../context/useTheme';

const LandingPage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen font-sans transition-colors duration-500 ease-in-out bg-slate-50 text-slate-900 selection:bg-indigo-300/30 dark:bg-slate-950 dark:text-slate-50 dark:selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 flex justify-center items-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] rounded-full blur-[140px] mix-blend-screen animate-pulse duration-10000 bg-indigo-300/40 dark:bg-indigo-600/20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000 bg-violet-300/40 dark:bg-violet-600/20"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="w-full sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 border-slate-200 bg-white/80 dark:border-white/5 dark:bg-slate-950/80">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 p-2 flex-shrink-0">
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                 </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:bg-gradient-to-r dark:from-white dark:to-slate-400">Task Collab</span>
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Theme Toggle Button */}
              <button onClick={toggleTheme} className="p-2.5 rounded-full transition-all duration-300 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-yellow-400">
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {!isLoaded ? (
                <div className="w-32 h-10 rounded-full animate-pulse bg-slate-200 dark:bg-slate-800"></div>
              ) : isSignedIn ? (
                <Link to="/dashboard" className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-105 bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-50 dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2.5 rounded-full font-medium text-sm transition-colors duration-300 hidden sm:block text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    Log in
                  </Link>
                  <Link to="/signup" className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-105 bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-50 dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 pb-20 pt-16 md:pt-24 max-w-7xl mx-auto flex flex-col items-center text-center flex-1 w-full shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold mb-10 animate-fade-in-up bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Task Collab is Now Available For Teams
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto drop-shadow-sm">
            Manage your workflow. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 animate-gradient-x p-1">
               In sync, seamlessly.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium text-slate-600 dark:text-slate-400">
            A striking, intuitive Kanban task manager designed to help modern engineering and product teams collaborate effortlessly in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full max-w-md mx-auto sm:max-w-none">
             {!isLoaded ? null : isSignedIn ? (
               <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl hover:scale-105 hover:shadow-[0_10px_40px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-3">
                 Go to Dashboard
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             ) : (
               <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl hover:scale-105 hover:shadow-[0_10px_40px_rgba(99,102,241,0.5)] active:scale-95 flex items-center justify-center gap-3">
                 Get Started for Free
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             )}
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-20 sm:mt-24 relative w-full max-w-6xl mx-auto px-4 sm:px-0">
             <div className="absolute -inset-1 sm:-inset-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-20 sm:opacity-30"></div>
             
             {/* Mockup Container */}
             <div className="relative rounded-2xl border backdrop-blur-xl overflow-hidden shadow-2xl transition-transform hover:-translate-y-2 duration-700 ease-out z-20 border-slate-200/60 bg-white/90 shadow-indigo-500/10 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-indigo-500/10">
               
               {/* Mockup Header */}
               <div className="h-14 border-b flex items-center px-6 gap-2 border-slate-100 bg-slate-50/70 dark:border-white/5 dark:bg-slate-950/70">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium px-4 py-1.5 rounded-md flex items-center gap-2 bg-white shadow-sm border border-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    taskcollab.com/dashboard
                  </div>
               </div>
               
               {/* Mockup Body Content */}
               <div className="p-6 md:p-10 flex gap-6 md:gap-8 h-[350px] md:h-[450px]">
                  
                  {/* Sidebar mockup */}
                  <div className="w-1/4 hidden md:flex flex-col gap-5">
                    <div className="h-8 w-32 rounded-lg mb-4 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="space-y-3">
                      <div className="h-10 w-full rounded-xl border flex items-center px-4 gap-3 bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300">
                        <div className="w-4 h-4 rounded bg-current"></div>
                        <div className="h-2.5 w-16 bg-current rounded opacity-70"></div>
                      </div>
                      <div className="h-10 w-full rounded-xl flex items-center px-4 gap-3 bg-slate-100 dark:bg-slate-800/60">
                        <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700"></div>
                        <div className="h-2.5 w-20 rounded bg-slate-300 dark:bg-slate-700"></div>
                      </div>
                      <div className="h-10 w-full rounded-xl flex items-center px-4 gap-3 bg-slate-100 dark:bg-slate-800/60">
                        <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700"></div>
                        <div className="h-2.5 w-14 rounded bg-slate-300 dark:bg-slate-700"></div>
                      </div>
                    </div>
                  </div>

                  {/* Kanban View mockup */}
                  <div className="flex-1 flex gap-5 md:gap-6 overflow-hidden">
                     {['Pending', 'In Progress', 'Done'].map((colName, index) => (
                       <div key={colName} className="flex-1 rounded-2xl p-5 flex flex-col gap-4 border bg-slate-50 border-slate-200/60 dark:bg-slate-800/40 dark:border-white/5">
                         <div className="flex justify-between items-center mb-2">
                           <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                           <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{3 - index}</div>
                         </div>
                         
                         {/* Card 1 */}
                         <div className="w-full rounded-xl p-4 shadow-sm border transition-transform hover:-translate-y-1 bg-white border-slate-100 shadow-slate-200/50 dark:bg-slate-800 dark:border-white/5">
                           <div className={`h-2 w-12 rounded-full mb-3 ${index === 0 ? 'bg-red-400' : index === 1 ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                           <div className="h-4 w-3/4 rounded mb-2 bg-slate-200 dark:bg-slate-600"></div>
                           <div className="h-3 w-1/2 rounded mb-4 bg-slate-100 dark:bg-slate-700"></div>
                           <div className="flex justify-between items-center mt-auto">
                             <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-slate-600"></div>
                             <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-700"></div>
                           </div>
                         </div>
                         
                         {/* Card 2 */}
                         {index < 2 && (
                           <div className="w-full rounded-xl p-4 shadow-sm border transition-transform hover:-translate-y-1 bg-white border-slate-100 shadow-slate-200/50 dark:bg-slate-800 dark:border-white/5">
                             <div className={`h-2 w-12 rounded-full mb-3 ${index === 0 ? 'bg-blue-400' : 'bg-fuchsia-400'}`}></div>
                             <div className="h-4 w-full rounded mb-2 bg-slate-200 dark:bg-slate-600"></div>
                             <div className="h-3 w-2/3 rounded mb-4 bg-slate-100 dark:bg-slate-700"></div>
                             <div className="flex justify-between items-center mt-auto">
                               <div className="flex -space-x-2">
                                 <div className="h-6 w-6 rounded-full border-2 bg-indigo-100 border-white dark:bg-slate-600 dark:border-slate-800"></div>
                                 <div className="h-6 w-6 rounded-full border-2 bg-violet-100 border-white dark:bg-slate-500 dark:border-slate-800"></div>
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 w-full relative z-30 flex-shrink-0 bg-slate-50/80 border-y border-slate-200 dark:bg-slate-950/80 dark:border-y dark:border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Everything you need to ship faster</h2>
              <p className="max-w-2xl mx-auto text-xl font-medium text-slate-600 dark:text-slate-400">
                Powerful features wrapped in an elegant interface, tailored for dynamic teams wanting zero friction.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="group p-10 rounded-3xl border transition-all duration-300 hover:-translate-y-3 shadow-xl bg-white border-slate-200 hover:shadow-indigo-500/10 hover:border-indigo-300 dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04] dark:hover:shadow-indigo-500/20 dark:hover:border-indigo-500/30">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Visual Kanban Boards</h3>
                  <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                    Organize tasks intuitively via Pending, In Progress, and Completed stages. Instantly shift priorities and conquer your backlog effortlessly.
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="group p-10 rounded-3xl border transition-all duration-300 hover:-translate-y-3 shadow-xl bg-white border-slate-200 hover:shadow-violet-500/10 hover:border-violet-300 dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04] dark:hover:shadow-violet-500/20 dark:hover:border-violet-500/30">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Team Collaboration</h3>
                  <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                    Create dedicated project scopes and seamlessly invite colleagues via link. Work in sync without stepping on each other's toes.
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="group p-10 rounded-3xl border transition-all duration-300 hover:-translate-y-3 shadow-xl bg-white border-slate-200 hover:shadow-fuchsia-500/10 hover:border-fuchsia-300 dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04] dark:hover:shadow-fuchsia-500/20 dark:hover:border-fuchsia-500/30">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Real-time Subsystems</h3>
                  <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                    Engineered with a responsive stack to guarantee your board updates instantly and state converges globally avoiding conflicts.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 flex-1 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="max-w-5xl w-full mx-auto relative group">
             {/* Glowing orb behind CTA */}
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
             
             <div className="relative rounded-3xl p-12 md:p-20 text-center border overflow-hidden bg-white border-slate-200 dark:bg-slate-900 dark:border-white/10">
               
               <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 text-slate-900 dark:text-white">Ready to elevate your teamwork?</h2>
               <p className="text-xl mb-12 max-w-2xl mx-auto relative z-10 font-medium text-slate-600 dark:text-indigo-200">
                 Join elite professionals organizing their tasks with Task Collab. Sign up in seconds and deploy your first board immediately.
               </p>
               
               <div className="relative z-10 flex justify-center">
                 {!isLoaded ? null : isSignedIn ? (
                   <Link to="/dashboard" className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:shadow-white/10">
                     Proceed to Dashboard
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                   </Link>
                 ) : (
                   <Link to="/signup" className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:shadow-white/10">
                     Create Account for Free
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                   </Link>
                 )}
               </div>
             </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t py-12 px-6 mt-auto border-slate-200 bg-white dark:border-white/5 dark:bg-slate-950">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center p-1.5 opacity-90">
                   <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                   </svg>
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">Task Collab</span>
              </div>
              <div className="flex gap-8 text-sm md:text-base font-medium flex-wrap text-center justify-center text-slate-500 dark:text-slate-400">
                <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">Features</a>
                <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">Pricing</a>
                <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">Privacy</a>
                <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">Terms</a>
              </div>
              <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
                 © {new Date().getFullYear()} Task Collab. All rights reserved.
              </div>
           </div>
        </footer>
        
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LandingPage;
