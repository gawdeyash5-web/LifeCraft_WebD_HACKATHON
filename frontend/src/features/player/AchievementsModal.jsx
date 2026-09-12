import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Lock, Sparkles, Award, Star, Compass, Shield, Coins, ShoppingBag, Flame, Brain, Dumbbell, Code2, Crown, RefreshCw } from 'lucide-react';
import { Api } from '../../services/api';

const ICON_MAP = {
  Compass,
  Sparkles,
  Shield,
  Coins,
  ShoppingBag,
  Brain,
  Dumbbell,
  Code2,
  Crown,
  Flame,
  Trophy,
};

export default function AchievementsModal({ onClose }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await Api.achievements.list();
      const list = Array.isArray(data) ? data : (data?.achievements || []);
      setAchievements(list);
    } catch (err) {
      console.warn('[Achievements] Using fallback catalog:', err.message);
      // Fallback display if unauthenticated
      setAchievements([
        { key: 'first_quest', title: 'First Steps', description: 'Complete your very first real-life quest.', category: 'quest', xpReward: 50, goldReward: 25, isUnlocked: true, icon: 'Compass' },
        { key: 'getting_started', title: 'Realm Initiate', description: 'Earn your first realm XP in any discipline.', category: 'realm', xpReward: 50, goldReward: 25, isUnlocked: true, icon: 'Sparkles' },
        { key: 'rising_adventurer', title: 'Rising Adventurer', description: 'Ascend to Player Level 2 through consistent action.', category: 'progression', xpReward: 100, goldReward: 50, isUnlocked: false, icon: 'Shield' },
        { key: 'wealth_builder', title: 'Treasure Keeper', description: 'Amass 200 or more Gold in your purse.', category: 'economy', xpReward: 80, goldReward: 40, isUnlocked: false, icon: 'Coins' },
        { key: 'collector', title: 'Curator of Realms', description: 'Acquire your first cosmetic companion or skin from the shop.', category: 'economy', xpReward: 75, goldReward: 50, isUnlocked: false, icon: 'ShoppingBag' },
        { key: 'realm_master', title: 'Realm Master', description: 'Reach Level 3 mastery in any realm to unlock world expansions.', category: 'mastery', xpReward: 250, goldReward: 150, isUnlocked: false, icon: 'Crown' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.isUnlocked || a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filtered = achievements.filter((a) => {
    const isU = Boolean(a.isUnlocked || a.unlocked);
    if (filter === 'unlocked') return isU;
    if (filter === 'locked') return !isU;
    return true;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full space-y-4 max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-rpg tracking-wide">
              Hall of Achievements
            </h2>
            <p className="text-xs text-slate-400">
              Milestones earned on your journey of personal mastery
            </p>
          </div>
        </div>

        <button
          onClick={loadAchievements}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Refresh achievements"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Progress Bar Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col space-y-2 flex-shrink-0 shadow-inner">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Overall Progress</span>
          <span className="text-amber-300">{unlockedCount} / {totalCount} ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-semibold flex-shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === 'unlocked' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === 'locked' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Locked ({totalCount - unlockedCount})
        </button>
      </div>

      {/* Achievement Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
        {filtered.map((ach) => {
          const IconComponent = ICON_MAP[ach.icon] || Trophy;
          return (
            <div
              key={ach.key}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-3 ${
                ach.isUnlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    ach.isUnlocked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-100">{ach.title}</h4>
                    {ach.isUnlocked && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[10px] font-mono text-slate-400">
                    <span className="text-indigo-300">+{ach.xpReward} XP</span>
                    <span>&bull;</span>
                    <span className="text-amber-300">+{ach.goldReward} Gold</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 pt-1">
                {ach.isUnlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
