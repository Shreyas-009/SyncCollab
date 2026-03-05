import React from 'react'
import { useTheme } from '../context/useTheme'

const DeleteConfirmation = ({ show, onClose, onConfirm, taskTitle }) => {
    const { isDark } = useTheme();

    if (!show) return null;

    return (
        <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'
            onClick={onClose}
        >
            <div
                className={`flex flex-col w-[90%] max-w-sm rounded-2xl shadow-xl overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-stone-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-stone-100'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'
                        }`}>
                        <svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                        </svg>
                    </div>
                    <div>
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>Delete Task</h2>
                    </div>
                </div>

                {/* Content */}
                <div className={`px-6 py-5 ${isDark ? '' : 'bg-white'}`}>
                    <p className={isDark ? 'text-slate-300' : 'text-stone-600'}>
                        Are you sure you want to delete <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-stone-800'}`}>"{taskTitle}"</span>?
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                        This action cannot be undone.
                    </p>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-stone-50 border-stone-100'
                    }`}>
                    <button
                        type='button'
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${isDark
                            ? 'text-slate-300 bg-slate-800 border-slate-600 hover:bg-slate-700'
                            : 'text-stone-600 bg-white border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className='px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm'
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation
