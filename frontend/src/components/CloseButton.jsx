import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable RPG HUD Panel Close Button
 * 
 * - 40x40px touch target (exceeds 40-44px requirement)
 * - Directly belongs to the panel header container
 * - Consistent with LIFECRAFT dark glass aesthetic
 * - Smooth hover and focus states with subtle indigo accent glow
 * - Full keyboard accessibility (Tab, Enter, Space)
 */
export default function CloseButton({ onClick, onClose, className = '', title = 'Close panel' }) {
  const handleClick = onClick || onClose;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={title}
      title={title}
      className={`relative z-10 w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center bg-slate-800/70 hover:bg-slate-700/90 active:bg-slate-600/90 border border-slate-700/70 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 cursor-pointer group ${className}`}
    >
      <X className="w-5 h-5 transition-transform group-hover:scale-110" />
    </button>
  );
}
