import React from 'react';
import { createPortal } from 'react-dom';

const DeleteConfirmation = ({ show, onClose, onConfirm, taskTitle, isProcessing = false, title = 'Delete Task', message, confirmLabel = 'Delete', processingLabel = 'Deleting...' }) => {
    if (!show) return null;

    const modalContent = (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[99999]'
            onClick={isProcessing ? undefined : onClose}
        >
            <div
                className="flex flex-col w-[90%] max-w-sm rounded-2xl shadow-xl overflow-hidden transition-colors bg-white border border-stone-200 dark:bg-[#0c0c0e] dark:border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10">
                        <svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-stone-800 dark:text-gray-100">{title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 bg-white dark:bg-[#0c0c0e]">
                    <p className={"text-stone-600 dark:text-slate-300"}>
                        {message || (
                            <>
                                Are you sure you want to delete <span className="font-semibold text-stone-800 dark:text-gray-100">"{taskTitle}"</span>?
                            </>
                        )}
                    </p>
                    <p className="text-sm mt-2 text-stone-400 dark:text-slate-500">
                        This action cannot be undone.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-stone-50 border-stone-100 dark:bg-white/5 dark:border-white/5">
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm font-medium border rounded-xl transition-colors text-stone-600 bg-white border-stone-200 hover:bg-stone-50 dark:text-slate-300 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className='px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {isProcessing && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                        {isProcessing ? processingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default DeleteConfirmation
