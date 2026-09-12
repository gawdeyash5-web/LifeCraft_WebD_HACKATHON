import React from 'react';
import { Mountain, Coins, Flame, ChevronDown, Sparkles } from 'lucide-react';

/**
 * Premium RPG Navbar & HUD Header
 * 
 * Matching the exact visual reference header:
 * Mountain crest, "LIFECRAFT / Level Up Your Real Life", Level & XP bar,
 * Gold coin, Streak flame, and User Avatar.
 */
export default function Navbar({ player = {}, onTabSelect, activeTab }) {
  const {
    level = 12,
    xp = 420,
    nextLevelXp = 1000,
    gold = 840,
    streak = 14,
    username = 'Yash',
  } = player;

  const xpPercent = Math.min(100, Math.round((xp / (nextLevelXp || 1000)) * 100));

  return (
    <header className="relative z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xl">
      {/* 1. Brand & Mountain Logo (Matching Reference) */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600/50 flex items-center justify-center text-emerald-400 shadow-md">
          <Mountain className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-rpg text-base md:text-lg font-bold tracking-wider text-white flex items-center space-x-2">
            <span>LIFECRAFT</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            Level Up Your Real Life
          </p>
        </div>
      </div>

      {/* 2. Right RPG Stats HUD (Matching Reference) */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Level & XP Progress Bar */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-200">Lv. {level}</span>
          <div className="w-24 md:w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 font-medium">
            {xp} / {nextLevelXp} XP
          </span>
        </div>

        {/* Gold Counter */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-amber-300 text-xs font-semibold">
          <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-[10px]">
            🪙
          </div>
          <span className="font-mono">{gold}</span>
        </div>

        {/* Streak Flame */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-orange-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500/20 animate-pulse" />
          <span className="font-mono">{streak}</span>
        </div>

        {/* User Profile Avatar Dropdown */}
        <div
          onClick={() => onTabSelect && onTabSelect('stats')}
          className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-800 cursor-pointer transition"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600/80 border border-indigo-400 flex items-center justify-center text-white text-xs font-bold">
            {username[0]}
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-slate-200">
            {username}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
