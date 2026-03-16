import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, disabled, placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    useEffect(() => {
        // Auto-detect if there is enough space below to open downwards
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If less than 250px space below, open upwards
            setOpenUpwards(spaceBelow < 250);
        }
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative w-full">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{ height: '44px' }}
                className={`w-full flex items-center justify-between px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all bg-stone-50 text-stone-700 border-stone-200 dark:bg-[#111114] dark:text-gray-100 dark:border-white/10 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isOpen ? 'ring-2 ring-purple-500/50 border-purple-500/50 dark:border-purple-500/50' : 'focus:border-transparent'}`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute z-[9999] ${openUpwards ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'} left-0 right-0 bg-white dark:bg-[#0c0c0e] border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-32 overflow-y-auto custom-scrollbar`}>
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center ${
                                    value === option.value
                                        ? 'bg-purple-600 text-white font-medium shadow-sm'
                                        : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/5'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
