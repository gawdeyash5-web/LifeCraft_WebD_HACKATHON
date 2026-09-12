import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Layers, BookOpen, Dumbbell, Settings, RotateCcw } from 'lucide-react';
import { REALMS } from '../worldConfig';

/**
 * Isolated Development Visual Test Widget for Realm Evolution
 * 
 * Allows Member 1 and the team to test Level 1, 2, and 3 transformations
 * and downgrades in real-time independently from backend wiring.
 */
export default function RealmEvolutionDevBar({
  realmLevels = { mind: 1, body: 1, craft: 1 },
  onSetLevel,
  activeRegion,
  onSelectRegion,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const realms = [
    {
      id: REALMS.MIND,
      name: 'Mind',
      icon: BookOpen,
      color: '#818cf8',
      level: realmLevels.mind || 1,
    },
    {
      id: REALMS.BODY,
      name: 'Body',
      icon: Dumbbell,
      color: '#34d399',
      level: realmLevels.body || 1,
    },
    {
      id: REALMS.CRAFT,
      name: 'Craft',
      icon: Settings,
      color: '#f59e0b',
      level: realmLevels.craft || 1,
    },
  ];

  return (
    <div
      className="relative pointer-events-auto select-none"
      aria-label="Realm Evolution Test Controls"
    >
      {/* Dev Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 backdrop-blur-md shadow-xl text-xs font-semibold transition-all group"
        title="Toggle Realm Evolution Test Controls"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide text-xs">Evolution Dev</span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded Dropdown Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl w-64 space-y-2.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            <span className="flex items-center space-x-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Realm Level Dev Mode</span>
            </span>
            <span className="text-[9px] text-indigo-400/80">Dev State</span>
          </div>

          {/* 3 Realm Level Controls */}
          <div className="space-y-2">
            {realms.map((realm) => {
              const Icon = realm.icon;
              const isFocused = activeRegion === realm.id;

              return (
                <div
                  key={realm.id}
                  className={`p-2 rounded-xl border transition-all ${
                    isFocused
                      ? 'bg-slate-800/80 border-indigo-500/50 shadow-inner'
                      : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectRegion?.(isFocused ? null : realm.id)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: realm.color }} />
                      <span>{realm.name} Realm</span>
                    </button>
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${realm.color}20`,
                        color: realm.color,
                      }}
                    >
                      Lvl {realm.level}
                    </span>
                  </div>

                  {/* Segmented Level Buttons: 1, 2, 3 */}
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((lvl) => {
                      const isCurrent = realm.level === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => onSetLevel?.(realm.id, lvl)}
                          className={`py-1 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102 border border-indigo-400/60'
                              : 'bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-700/50'
                          }`}
                        >
                          Lvl {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick All Reset / Preset Row */}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Set All:</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    onSetLevel?.('mind', lvl);
                    onSetLevel?.('body', lvl);
                    onSetLevel?.('craft', lvl);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono font-semibold"
                >
                  All {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
