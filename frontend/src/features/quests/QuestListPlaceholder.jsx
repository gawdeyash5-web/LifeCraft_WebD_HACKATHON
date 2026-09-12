import React from 'react';
import { CheckCircle, Plus, Shield, Zap } from 'lucide-react';

/**
 * Quests Feature Module (Owned by Member 2)
 * 
 * Boundary: Quest CRUD, active quest list, completion actions, and category filtering.
 */
export default function QuestListPlaceholder({ activeRegion, onCompleteQuest }) {
  // Sample initial quests for skeleton demo
  const sampleQuests = [
    {
      id: 'q1',
      title: 'Deep Focus: Read Architecture Docs (45m)',
      category: 'mind',
      difficulty: 'medium',
      xpReward: 50,
      goldReward: 20,
    },
    {
      id: 'q2',
      title: 'Physical Vitality: 30 Min Workout',
      category: 'body',
      difficulty: 'hard',
      xpReward: 100,
      goldReward: 40,
    },
    {
      id: 'q3',
      title: 'Build Feature: Implement React Three Fiber Scene',
      category: 'craft',
      difficulty: 'epic',
      xpReward: 150,
      goldReward: 60,
    },
  ];

  const filteredQuests = activeRegion
    ? sampleQuests.filter((q) => q.category === activeRegion)
    : sampleQuests;

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>Active Quests</span>
          </h2>
          <p className="text-xs text-slate-400">
            {activeRegion ? `Filtered for ${activeRegion.toUpperCase()} realm` : 'All available missions'}
          </p>
        </div>

        {/* TODO (Member 2): Hook up Create Quest Modal */}
        <button
          onClick={() => alert('TODO (Member 2): Open New Quest Modal')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quest</span>
        </button>
      </div>

      {/* Quest Cards List */}
      <div className="space-y-3 mt-4 overflow-y-auto flex-1 pr-1">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No quests found in this realm. Create one to begin leveling!
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition">
                  {quest.title}
                </p>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <Zap className="w-3 h-3" />
                    <span>+{quest.xpReward} XP</span>
                  </span>
                  <span className="text-amber-400">+{quest.goldReward} Gold</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300">
                    {quest.difficulty}
                  </span>
                </div>
              </div>

              {/* Complete Action Button */}
              <button
                onClick={() => onCompleteQuest?.(quest)}
                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition"
                title="Complete Quest"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 italic text-center">
        Owned by Member 2 &bull; Hook with `/api/quests`
      </div>
    </div>
  );
}
