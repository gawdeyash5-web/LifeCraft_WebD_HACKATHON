import React from 'react';
import { RotateCcw } from 'lucide-react';

export const REALM_TABS = [
  { id: 'all', label: 'All Realms' },
  { id: 'intelligence', label: 'Mind', alias: 'mind' },
  { id: 'strength', label: 'Body', alias: 'body' },
  { id: 'creativity', label: 'Craft', alias: 'craft' },
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'discipline', label: 'Discipline' },
];

/**
 * Modular Quest Filters component.
 * Allows filtering quests by status (active/completed/all) and realm category.
 */
export default function QuestFilters({
  statusFilter = 'active',
  setStatusFilter,
  realmFilter = 'all',
  setRealmFilter,
  activeCount = 0,
  completedCount = 0,
  totalCount = 0,
  onRefresh,
}) {
  return (
    <div className="pt-3 pb-2 space-y-2.5">
      {/* Status Tabs & Refresh Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              statusFilter === 'active'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh quests"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Realm / Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {REALM_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRealmFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition ${
              realmFilter === tab.id
                ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-300 bg-slate-900/40 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
