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
    },
  ];

  return (
    <footer className="absolute left-4 right-4 bottom-3 z-20 flex items-center justify-between gap-3 pointer-events-none overflow-x-auto py-1 scrollbar-none">
      {/* Realm Cards Group (Left & Center) */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        {/* Dedicated Return to World Button (Appears only when a realm is selected) */}
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
          return (
            <button
              key={realm.id}
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
          );
        })}
      </div>

      {/* Quick Utility Tiles & Daily Quote (Right) */}
      <div className="hidden xl:flex items-center space-x-2.5 pointer-events-auto">
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
