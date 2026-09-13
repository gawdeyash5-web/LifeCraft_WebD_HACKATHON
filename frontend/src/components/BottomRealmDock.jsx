import React from 'react';
import { BookOpen, Dumbbell, Settings, ChevronRight, Store, Backpack, Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { REALMS } from '../features/world/worldConfig';

/**
 * Bottom Realm Selector & Utility Dock
 * 
 * Directly matches the reference image composition:
 * 3 Realm preview cards + utility buttons floating at the bottom of the viewport.
 */
export default function BottomRealmDock({
  activeRegion,
  onSelectRegion,
  realmLevels = { mind: 1, body: 1, craft: 1 },
  masteryExpansions = [],
  onOpenShop,
  onOpenInventory,
  onOpenAchievements,
}) {
  const realms = [
    {
      id: REALMS.MIND,
      title: 'MIND REALM',
      ethos: 'Knowledge • Focus • Growth',
      icon: BookOpen,
      color: '#a855f7', // purple
      bgGrad: 'from-purple-950/50 to-slate-900/80',
      borderActive: 'border-purple-500/80',
      badge: 'Mind',
      expansionId: 'mind_library',
      expansionName: 'Celestial Library',
      expansionIcon: '📖',
    },
    {
      id: REALMS.BODY,
      title: 'BODY REALM',
      ethos: 'Strength • Health • Discipline',
      icon: Dumbbell,
      color: '#ef4444', // red
      bgGrad: 'from-red-950/50 to-slate-900/80',
      borderActive: 'border-red-500/80',
      badge: 'Body',
      expansionId: 'body_coliseum',
      expansionName: 'Coliseum Wing',
      expansionIcon: '⚔️',
    },
    {
      id: REALMS.CRAFT,
      title: 'CRAFT REALM',
      ethos: 'Create • Build • Innovate',
      icon: Settings,
      color: '#06b6d4', // cyan
      bgGrad: 'from-cyan-950/50 to-slate-900/80',
      borderActive: 'border-cyan-500/80',
      badge: 'Craft',
      expansionId: 'craft_foundry',
      expansionName: 'Foundry Wing',
      expansionIcon: '⚙️',
    },
  ];

  return (
    <footer className="absolute left-4 right-4 bottom-3 z-20 flex items-center justify-between gap-3 pointer-events-none overflow-x-auto py-1 scrollbar-none">
      {/* Realm Cards Group (Left & Center) */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        {/* Dedicated Return to World Button (Appears only when a realm or sub-island is selected) */}
        {activeRegion && (
          <button
            type="button"
            onClick={() => onSelectRegion(null)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold border border-indigo-400/50 shadow-xl shadow-indigo-600/25 backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-shrink-0 group"
            title="Return to World Overview"
          >
            <RotateCcw className="w-4 h-4 text-indigo-200 group-hover:-rotate-45 transition-transform" />
            <span>Return to World</span>
          </button>
        )}

        {realms.map((realm) => {
          const Icon = realm.icon;
          const isActive = activeRegion === realm.id;
          const hasExpansion = masteryExpansions?.includes(realm.expansionId);
          const isExpansionActive = activeRegion === realm.expansionId;

          return (
            <div key={realm.id} className="flex items-center space-x-1.5 flex-shrink-0">
              {/* Primary Realm Card */}
              <button
                onClick={() => onSelectRegion(isActive ? null : realm.id)}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border transition-all duration-300 text-left group shadow-xl ${
                  isActive
                    ? `${realm.borderActive} ring-2 ring-${realm.id === 'mind' ? 'purple' : realm.id === 'body' ? 'red' : 'cyan'}-500/30 scale-105`
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 flex-shrink-0"
                  style={{ backgroundColor: `${realm.color}25`, color: realm.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-white tracking-wide">
                      {realm.title}
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: `${realm.color}25`, color: realm.color }}
                    >
                      Lvl {realmLevels?.[realm.id] || 1}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {realm.ethos}
                  </p>
                </div>
              </button>

              {/* Accessible Mastery Sub-Island Travel Chip */}
              {hasExpansion && (
                <button
                  type="button"
                  onClick={() => onSelectRegion(isExpansionActive ? null : realm.expansionId)}
                  className={`flex items-center space-x-1 px-2.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-lg backdrop-blur-xl border ${
                    isExpansionActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400'
                  }`}
                  title={`Travel to ${realm.expansionName}`}
                >
                  <span className="text-xs">{realm.expansionIcon}</span>
                  <span className="hidden md:inline text-[11px] font-mono tracking-tight">
                    {realm.expansionName}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Utility Tiles & Daily Quote (Right - 2XL+ screens) */}
      <div className="hidden 2xl:flex items-center space-x-2.5 pointer-events-auto flex-shrink-0">
        <button
          onClick={onOpenShop}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold transition shadow-lg"
          title="Open Shop"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>Shop</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 text-xs font-semibold transition shadow-lg"
          title="Open Inventory"
        >
          <Backpack className="w-4 h-4 text-indigo-400" />
          <span>Inventory</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-semibold transition shadow-lg"
          title="Achievements"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Achievements</span>
        </button>

        {/* Small Inspirational Quote Box (Matching Reference) */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-right shadow-lg">
          <p className="text-[10px] italic font-serif text-slate-300">
            "Discipline today, a better tomorrow."
          </p>
          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">
            — LIFECRAFT
          </span>
        </div>
      </div>
    </footer>
  );
}
