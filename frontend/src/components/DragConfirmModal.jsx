import React from 'react';

const DragConfirmModal = ({ show, taskName, newStatus, onConfirm, onCancel, isProcessing = false }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-stone-200 dark:border-white/5">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-lg font-bold text-center text-stone-800 dark:text-slate-100 mb-2">
                        Move Task?
                    </h3>
                    
                    <p className="text-sm text-center text-stone-600 dark:text-slate-400 mb-6">
                        Are you sure you want to move the task <span className="font-semibold text-stone-900 dark:text-slate-200">"{taskName}"</span> to <span className="font-semibold text-stone-900 dark:text-slate-200 capitalize">{newStatus}</span>?
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                            {isProcessing ? 'Moving...' : 'Yes, Move It'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DragConfirmModal;
