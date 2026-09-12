import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Star,
  Compass,
  Shield,
  Coins,
  ShoppingBag,
  Flame,
  Brain,
  Dumbbell,
  Code2,
  Crown,
  RefreshCw,
} from 'lucide-react';
import { Api } from '../../services/api';
import CloseButton from '../../components/CloseButton';

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

export default function AchievementsModal({ isOpen = true, onClose }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await Api.achievements.list();
      const list = Array.isArray(data) ? data : (data?.achievements || []);
      setAchievements(list);
    } catch (err) {
      console.warn('[Achievements] Using fallback catalog:', err.message);
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
    if (isOpen) {
      loadAchievements();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(900px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 40px)',
        }}
        className="relative flex flex-col rounded-2xl bg-slate-950/95 border border-slate-700/60 shadow-2xl shadow-black/80 backdrop-blur-2xl text-slate-100 overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="achievements-modal-title"
                className="text-base sm:text-lg font-bold text-slate-100 font-rpg tracking-wide truncate"
              >
                Hall of Achievements
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Milestones earned on your journey of personal mastery
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={loadAchievements}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/70 hover:bg-slate-700/90 border border-slate-700/70 text-slate-300 hover:text-white transition"
              title="Refresh achievements"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <CloseButton onClose={onClose} title="Close achievements" />
          </div>
        </div>

        {/* Subheader: Progress Bar & Category Filter - Fixed */}
        <div className="px-4 sm:px-6 pt-3 pb-3 flex-shrink-0 space-y-2.5 bg-slate-950/50 border-b border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Overall Progress</span>
            <span className="text-amber-300 font-mono">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg transition text-center ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlocked')}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg transition text-center ${
                filter === 'unlocked'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('locked')}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg transition text-center ${
                filter === 'locked'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((ach) => {
              const IconComponent = ICON_MAP[ach.icon] || Trophy;
              const isUnlocked = Boolean(ach.isUnlocked || ach.unlocked);

              return (
                <div
                  key={ach.key}
                  className={`flex flex-col justify-between h-full min-h-[160px] sm:min-h-[175px] p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5 hover:border-amber-400'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Icon + Title + Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          isUnlocked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-500'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {isUnlocked ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          <span>UNLOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/80 text-slate-500 border border-slate-800 flex-shrink-0">
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>LOCKED</span>
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold mt-2.5 leading-snug ${
                        isUnlocked ? 'text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {ach.title}
                    </h4>

                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed break-words">
                      {ach.description}
                    </p>
                  </div>

                  {/* Bottom: Rewards + Timestamp */}
                  <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-indigo-300">+{ach.xpReward} XP</span>
                      <span>&bull;</span>
                      <span className="text-amber-300">+{ach.goldReward} Gold</span>
                    </div>

                    {isUnlocked && ach.unlockedAt && (
                      <span className="text-[9px] text-slate-500 font-sans">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No achievements found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
