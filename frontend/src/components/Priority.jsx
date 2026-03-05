import React from 'react'
import { useTheme } from '../context/useTheme'

const Priority = ({ name }) => {
  const { isDark } = useTheme();

  // Define colors based on priority level
  const getPriorityStyles = () => {
    switch (name?.toLowerCase()) {
      case 'high':
        return isDark
          ? 'bg-red-900/40 text-red-300 border-red-700'
          : 'bg-red-50 text-red-600 border-red-200';
      case 'medium':
        return isDark
          ? 'bg-amber-900/40 text-amber-300 border-amber-700'
          : 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low':
        return isDark
          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
          : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default:
        return isDark
          ? 'bg-slate-700 text-slate-300 border-slate-600'
          : 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className={`text-xs font-semibold border rounded-md py-1 px-2.5 capitalize inline-block ${getPriorityStyles()}`}>
      {name}
    </div>
  )
}

export default Priority