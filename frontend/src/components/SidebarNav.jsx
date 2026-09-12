import React from 'react';
import { Home, ScrollText, Backpack, Store, BarChart2, Award } from 'lucide-react';

/**
 * Floating Left RPG Sidebar Navigation
 * 
 * Directly matches the reference design:
 * Clean vertical glassmorphic pill menu framing the left of the 3D world.
 */
export default function SidebarNav({ activeTab, onTabSelect }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, isHome: true },
    { id: 'quests', label: 'Quests', icon: ScrollText },
    { id: 'inventory', label: 'Inventory', icon: Backpack },
    { id: 'shop', label: 'Shop', icon: Store },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <aside className="absolute left-4 top-4 bottom-24 z-20 hidden md:flex flex-col justify-between pointer-events-none">
      {/* Navigation Pills */}
      <div className="flex flex-col space-y-1.5 p-2 rounded-2xl bg-slate-900/75 backdrop-blur-xl border border-slate-700/50 shadow-2xl pointer-events-auto w-44">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabSelect(item.id)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inspirational Quote Card (Matching Reference) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-xl pointer-events-auto w-44">
        <p className="text-[11px] italic font-serif text-slate-300 leading-relaxed">
          "A Better You In A Bigger World"
        </p>
        <span className="block text-[9px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">
          LIFECRAFT
        </span>
      </div>
    </aside>
  );
}
