import React, { useEffect } from 'react';
import { Sparkles, Zap, Coins, Flame, Award, X } from 'lucide-react';

/**
 * Modular Quest Completion Celebration Toast.
 * Displays rewards awarded, level-up celebration, and streak updates.
 */
export default function QuestCompletion({ rewardData, onClose }) {
  useEffect(() => {
    if (!rewardData) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [rewardData, onClose]);

  if (!rewardData) return null;

  const { quest, rewardsAwarded, player, progression } = rewardData;
  const leveledUp = progression?.leveledUp ?? player?.leveledUp;
  const newLevel = progression?.level ?? player?.level;
  const streak = progression?.streak ?? player?.streak;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp">
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 relative overflow-hidden backdrop-blur-md">
        {/* Glow Header */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            leveledUp
              ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 animate-pulse'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
          }`}
        />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          {/* Icon Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
              leveledUp
                ? 'bg-gradient-to-br from-amber-500 to-rose-600 border-amber-300 text-white animate-bounce'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white'
            }`}
          >
            {leveledUp ? <Sparkles className="w-6 h-6" /> : <Award className="w-6 h-6" />}
          </div>

          <div className="flex-1 pr-4">
            <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              {leveledUp ? 'Level Ascended!' : 'Quest Completed'}
            </div>
            <h4 className="text-base font-bold text-slate-100 mt-0.5 leading-snug">
              {quest?.title || 'Quest Finished'}
            </h4>

            {leveledUp && (
              <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Level Up! You reached Level {newLevel}!</span>
              </div>
            )}

            {/* Rewards Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold">
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>+{rewardsAwarded?.xp || progression?.xpGained || 0} XP</span>
              </div>

              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>+{rewardsAwarded?.gold || 0} Gold</span>
              </div>

              {rewardsAwarded?.attribute && (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 capitalize">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+{rewardsAwarded.amount} {rewardsAwarded.attribute}</span>
                </div>
              )}

              {streak > 0 && (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{streak}d Streak</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
