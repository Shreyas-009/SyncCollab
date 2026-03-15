import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

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

const MOCK_LOGS = [
    { _id: '1', action: 'UPDATED_STATUS', userName: 'Alex Rivera', taskSnapshot: 'Moved "Design Landing Page Hero" to Completed', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { _id: '2', action: 'CREATED_TASK', userName: 'Sam Chen', taskSnapshot: 'Created task "Setup Authentication"', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { _id: '3', action: 'UPDATED_TASK', userName: 'Jordan Lee', taskSnapshot: 'Updated description for "Write API Documentation"', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { _id: '4', action: 'PROJECT_CREATED', userName: 'Alex Rivera', taskSnapshot: 'Created project "SyncCollab V2"', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const ActivityPreview = () => {
    const { isDark } = useTheme();

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50/30 dark:bg-slate-950/30 custom-scrollbar">
            {/* Page Header */}
            <div className="sticky top-0 z-10 px-4 md:px-10 h-[72px] flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        disabled
                        className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-slate-300 opacity-50 cursor-not-allowed"
                        title="Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-slate-100 tracking-tight leading-tight">Activity Log</h1>
                    <p className="text-sm text-stone-500 dark:text-slate-400">Recent project activity for SyncCollab V2</p>
                    </div>
                </div>
                <button
                    disabled
                    className="w-10 h-10 flex items-center justify-center rounded-xl opacity-50 cursor-not-allowed text-stone-500 dark:text-amber-400"
                    title="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-10 py-8">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[4px] top-2 bottom-2 w-px bg-stone-200 dark:bg-slate-700/60" />

                    <div className="space-y-3 pl-6">
                        {MOCK_LOGS.map((log) => {
                            const style = getActionStyle(log.action);
                            return (
                                <div key={log._id} className="relative group">
                                    {/* Timeline dot */}
                                    <div
                                        className={`absolute -left-6 top-4 w-2.5 h-2.5 rounded-full ${style.bg} shadow-sm ring-2 ring-white dark:ring-slate-950 transition-transform group-hover:scale-125`}
                                    />

                                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-stone-200/60 dark:border-slate-700/40 px-4 py-3.5 hover:border-stone-300 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">
                                                        {log.userName}
                                                    </span>
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                        style={{ color: style.color, backgroundColor: `${style.color}18` }}
                                                    >
                                                        {style.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-stone-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                                    {log.taskSnapshot}
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
            </div>
        </div>
    );
};

export default ActivityPreview;
