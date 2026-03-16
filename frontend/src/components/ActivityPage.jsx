import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { fetchActivityLogs } from '../utils/api';
import { useTheme } from '../context/useTheme';

const ACTION_STYLES = {
    'CREATED_TASK': { color: '#8B5CF6', bg: 'bg-violet-500', label: 'Created Task' },
    'UPDATED_STATUS': { color: '#10B981', bg: 'bg-emerald-500', label: 'Status' },
    'UPDATED_TASK': { color: '#3B82F6', bg: 'bg-blue-500', label: 'Updated' },
    'DELETED_TASK': { color: '#EF4444', bg: 'bg-red-500', label: 'Deleted' },
    'PROJECT_CREATED': { color: '#F59E0B', bg: 'bg-amber-500', label: 'Project' },
};

const getActionStyle = (action = '') => {
    return ACTION_STYLES[action] || { color: '#6B7280', bg: 'bg-gray-400', label: 'Activity' };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const ActivityPage = ({ selectedProject, onToggleSidebar }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDark, toggleTheme } = useTheme();

    const load = useCallback(async () => {
        if (!selectedProject?._id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchActivityLogs(selectedProject._id);
            setLogs(data || []);
        } catch (err) {
            console.error(err);
            setError('Could not load activity logs.');
        } finally {
            setLoading(false);
        }
    }, [selectedProject?._id]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50/30 dark:bg-[#0c0c0e] custom-scrollbar">
            {/* Page Header */}
            <div className="sticky top-0 z-10 px-4 md:px-10 h-[72px] flex items-center justify-between bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-stone-200/60 dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                        title="Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-slate-100 tracking-tight leading-tight">Activity Log</h1>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Recent project activity for {selectedProject.name}</p>
                    </div>
                </div>
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-stone-500 hover:bg-stone-100 dark:text-amber-400 dark:hover:bg-white/5"
                    title="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-10 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-stone-200 dark:bg-white/10 mt-2 shrink-0" />
                                <div className="flex-1 bg-white dark:bg-[#111114] rounded-2xl p-4 border border-stone-200/50 dark:border-white/5">
                                    <div className="h-3.5 bg-stone-100 dark:bg-white/5 rounded w-2/3 mb-2" />
                                    <div className="h-3 bg-stone-100 dark:bg-white/5 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <i className="bi bi-exclamation-triangle text-2xl text-red-500" />
                        </div>
                        <p className="text-stone-600 dark:text-slate-300 font-medium">{error}</p>
                        <button onClick={load} className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                            Retry
                        </button>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-[#111114] flex items-center justify-center mb-4 shadow-sm">
                            <i className="bi bi-activity text-3xl text-stone-400 dark:text-slate-500" />
                        </div>
                        <p className="text-lg font-bold text-stone-600 dark:text-slate-300">No activity yet</p>
                        <p className="text-sm text-stone-400 dark:text-slate-500 mt-1 max-w-xs">
                            Activity will appear here as your team creates and updates tasks.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[4px] top-2 bottom-2 w-px bg-stone-200 dark:bg-white/10" />

                        <div className="space-y-3 pl-6">
                            {logs.map((log, i) => {
                                const style = getActionStyle(log.action);
                                return (
                                    <div key={log._id || i} className="relative group">
                                        {/* Timeline dot */}
                                        <div
                                            className={`absolute -left-6 top-4 w-2.5 h-2.5 rounded-full ${style.bg} shadow-sm ring-2 ring-white dark:ring-[#0c0c0e] transition-transform group-hover:scale-125`}
                                        />

                                        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-stone-200/60 dark:border-white/5 px-4 py-3.5 hover:border-stone-300 dark:hover:border-white/10 hover:shadow-sm transition-all">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">
                                                            {log.userName || 'Unknown User'}
                                                        </span>
                                                        <span
                                                            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                            style={{ color: style.color, backgroundColor: `${style.color}18` }}
                                                        >
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                                        {log.taskSnapshot || 'No details available'}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-widest">{formatDate(log.createdAt)}</p>
                                                    <p className="text-[10px] text-stone-400 dark:text-slate-500 mt-0.5 font-medium">{formatTime(log.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityPage;
