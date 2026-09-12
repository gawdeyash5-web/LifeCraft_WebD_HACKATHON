import React from 'react';
import { CheckCircle, Zap, Coins, Edit3, Trash2 } from 'lucide-react';

/**
 * Modular Quest Card component.
 * Renders individual quest information, reward badges, and action buttons.
 */
export default function QuestCard({
  quest,
  onComplete,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const isCompleted = Boolean(quest.completed);
  const xpReward = quest.xp_reward ?? quest.xpReward ?? 50;
  const goldReward = quest.gold_reward ?? quest.goldReward ?? 25;

  return (
    <div
      className={`p-3.5 rounded-xl border transition flex items-start justify-between group ${
        isCompleted
          ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="space-y-1.5 flex-1 pr-3">
        {/* Category & Difficulty Badges */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
            {quest.category}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-950/40 border border-indigo-800/30">
            {quest.difficulty}
          </span>
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-semibold transition ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-indigo-200'
          }`}
        >
          {quest.title}
        </h4>

        {/* Description */}
        {quest.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {quest.description}
          </p>
        )}

        {/* Rewards Badges */}
        <div className="flex items-center space-x-3 text-xs pt-1">
          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
            <Zap className="w-3 h-3" />
            <span>+{xpReward} XP</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400 font-medium">
            <Coins className="w-3 h-3" />
            <span>+{goldReward} Gold</span>
          </span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center space-x-1.5 shrink-0 pt-0.5">
        {!isCompleted ? (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(quest)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Edit Quest"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(quest.id)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
                title="Delete Quest"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onComplete && (
              <button
                onClick={() => onComplete(quest)}
                className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10 transition"
                title="Complete Quest"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Done</span>
          </div>
        )}
      </div>
    </div>
  );
}
