import React from 'react';

const DragConfirmModal = ({ show, taskName, currentStatus, newStatus, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 transition-colors shadow-sm shadow-purple-200 dark:shadow-none"
                        >
                            Yes, Move It
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DragConfirmModal;
