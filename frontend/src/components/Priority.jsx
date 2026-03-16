import React from 'react'
import { useTheme } from '../context/useTheme'

const Priority = ({ name }) => {
  const { isDark } = useTheme();

  // Define colors based on priority level
  const getPriorityStyles = () => {
    switch (name?.toLowerCase()) {
      case 'high':
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-white/5";
      case 'medium':
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-white/5";
      case 'low':
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-white/5";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/5";
    }
  };

  return (
    <div className={`text-xs font-semibold border rounded-md py-1 px-2.5 capitalize inline-block ${getPriorityStyles()}`}>
      {name}
    </div>
  )
}

export default Priority