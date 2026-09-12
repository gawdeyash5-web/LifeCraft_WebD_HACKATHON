import React from 'react';
import { Award, Flame, Brain, Dumbbell, Sparkles, Compass, Target } from 'lucide-react';

/**
 * Player Profile & RPG Stats Module (Owned by Member 3)
 * 
 * Displays Level, XP progress bar, Streak counter, and 5 RPG Attributes.
 */
export default function PlayerStatsPlaceholder({ player }) {
  const {
    level = 1,
    xp = 35,
    nextLevelXp = 100,
    streak = 3,
    attributes = {
      intelligence: 12,
      strength: 10,
      creativity: 14,
      wisdom: 8,
      discipline: 11,
    }
  } = player || {};

  const xpPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const attributeIcons = [
    { key: 'intelligence', label: 'Intelligence', value: attributes.intelligence, icon: Brain, color: 'text-sky-400' },
    { key: 'strength', label: 'Strength', value: attributes.strength, icon: Dumbbell, color: 'text-rose-400' },
    { key: 'creativity', label: 'Creativity', value: attributes.creativity, icon: Sparkles, color: 'text-emerald-400' },
    { key: 'wisdom', label: 'Wisdom', value: attributes.wisdom, icon: Compass, color: 'text-amber-400' },
    { key: 'discipline', label: 'Discipline', value: attributes.discipline, icon: Target, color: 'text-indigo-400' },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col space-y-4">
      {/* Level & Streak Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-rpg font-bold text-xl text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            {level}
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Character Level</div>
            <div className="text-base font-bold text-slate-100">Level {level} Adventurer</div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold">{streak} Day Streak</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Experience Points</span>
          <span className="font-semibold text-slate-300">{xp} / {nextLevelXp} XP</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* 5 Core Attributes Grid */}
      <div className="pt-2 border-t border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Attributes</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {attributeIcons.map((attr) => {
            const Icon = attr.icon;
            return (
              <div
                key={attr.key}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${attr.color}`} />
                  <span className="text-xs text-slate-300">{attr.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-100">{attr.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 italic text-center pt-2">
        Owned by Member 3 &bull; Hook with `/api/player/me`
      </div>
    </div>
  );
}
