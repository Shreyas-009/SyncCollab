import React, { useState } from "react";
import { useTheme } from "../context/useTheme";
import { Menu, Search, XCircle, Plus, Sun, Moon } from "lucide-react";

const Header = ({
  onOpen,
  onSearch,
  selectedProject,
  onToggleSidebar,
  currentPage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark, toggleTheme } = useTheme();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white border-stone-200/60 shadow-sm dark:bg-[#0c0c0e] dark:border-white/5 z-30 h-[72px] shrink-0">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors md:hidden"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          {selectedProject ? (
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedProject.color || "#8B5CF6" }}
              />
              <h1 className="text-lg font-bold text-stone-800 dark:text-slate-100 tracking-tight">
                {selectedProject.name}
              </h1>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg font-bold text-stone-800 dark:text-slate-100 tracking-tight">
                SyncCollab
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Center: Restored Search Bar */}
      <div className="flex-1 max-w-md hidden lg:flex items-center px-4">
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            className="w-full pl-10 pr-10 py-2 text-sm font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-stone-50 text-stone-800 border-stone-200/80 placeholder-stone-400 dark:bg-white/5 dark:text-gray-100 dark:border-white/5 dark:placeholder-slate-500 dark:focus:ring-purple-500/30 shadow-sm shadow-stone-200/20 dark:shadow-none"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={!selectedProject}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors text-stone-400 hover:text-stone-600 hover:bg-stone-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/10"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-stone-500 hover:bg-stone-100 dark:text-amber-400 dark:hover:bg-white/5"
          title="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Add Task Button */}
        <button
          onClick={onOpen}
          disabled={!selectedProject}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
