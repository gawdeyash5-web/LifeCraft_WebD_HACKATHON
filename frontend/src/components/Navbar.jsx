import React from 'react';
import { Sparkles, Coins, Flame, Shield } from 'lucide-react';

/**
 * Shared Navbar / HUD Header (Owned by Member 1)
 */
export default function Navbar({ player, onTabSelect, activeTab }) {
  const { level = 1, gold = 75, streak = 3 } = player || {};

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-6 py-3 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-rpg text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-slate-200">
            LIFECRAFT
          </h1>
          <span className="text-[10px] text-indigo-400 tracking-widest font-semibold uppercase">
            Productivity RPG
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onTabSelect('quests')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'quests'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Quests
        </button>
        <button
          onClick={() => onTabSelect('shop')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'shop'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => onTabSelect('stats')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'stats'
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Character
        </button>
      </nav>

      {/* Player Quick Stats HUD */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Lvl {level}</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{gold}</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>{streak}d</span>
        </div>
      </div>
    </header>
  );
}
