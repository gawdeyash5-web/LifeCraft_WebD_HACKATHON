import React from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  ChevronRight,
  BookOpen,
  Dumbbell,
  Code2,
  BookMarked,
  Sparkles,
  Target,
} from 'lucide-react';

const CATEGORY_META = {
  intelligence: { icon: BookOpen, color: '#818cf8', label: 'Mind' },
  mind: { icon: BookOpen, color: '#818cf8', label: 'Mind' },
  strength: { icon: Dumbbell, color: '#f87171', label: 'Body' },
  body: { icon: Dumbbell, color: '#f87171', label: 'Body' },
  creativity: { icon: Code2, color: '#38bdf8', label: 'Craft' },
  craft: { icon: Code2, color: '#38bdf8', label: 'Craft' },
  wisdom: { icon: BookMarked, color: '#fbbf24', label: 'Wisdom' },
  discipline: { icon: Target, color: '#34d399', label: 'Discipline' },
};

function getCategoryMeta(cat) {
  const c = String(cat || '').toLowerCase().trim();
  return CATEGORY_META[c] || { icon: Sparkles, color: '#818cf8', label: 'General' };
}

/**
 * Floating Right Glassmorphic Panel (Today's Quests & Player Stats)
 * Synchronized directly with real user quests from database / Quest Command Center.
 */
export default function RightOverlayDrawer({
  player = {},
  quests = [],
  activeRegion,
  onCompleteQuest,
  isOpen = true,
  onToggle,
  onOpenStats,
  onOpenQuests,
  onOpenCreateQuest,
}) {
  // Derive Today's Quests from real quests: Active first, then completed (up to 5 items)
  const todayQuests = React.useMemo(() => {
    if (!Array.isArray(quests)) return [];
    const active = quests.filter((q) => !q.completed);
    const completed = quests.filter((q) => q.completed);
    return [...active, ...completed].slice(0, 5);
  }, [quests]);

  // Derive player RPG attributes dynamically from authoritative player profile
  const attrs = player.attributes || {};
  const stats = [
    { label: 'Intelligence', value: attrs.intelligence ?? 10, color: '#818cf8' },
    { label: 'Strength', value: attrs.strength ?? 10, color: '#f87171' },
    { label: 'Creativity', value: attrs.creativity ?? 10, color: '#38bdf8' },
    { label: 'Wisdom', value: attrs.wisdom ?? 10, color: '#fbbf24' },
    { label: 'Discipline', value: attrs.discipline ?? 10, color: '#34d399' },
  ];

  return (
    <aside className="absolute right-4 top-4 bottom-24 z-20 hidden lg:flex flex-col space-y-3 pointer-events-none w-80">
      {/* 1. Today's Quests Floating Glass Card */}
      <div className="flex-1 min-h-0 flex flex-col p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl pointer-events-auto overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 tracking-wide">
              Today's Quests
            </h3>
            {todayQuests.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {todayQuests.filter((q) => !q.completed).length} active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenQuests}
            className="group px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700/60 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            title="Open Quest Command Center"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Real Quest List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 scrollbar-none">
          {todayQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-3 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-300">No Quests Active</p>
              <p className="text-[11px] text-slate-500 leading-snug">
                Forge your first quest to begin leveling up and evolving your world.
              </p>
              <button
                type="button"
                onClick={onOpenCreateQuest || onOpenQuests}
                className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Forge Quest</span>
              </button>
            </div>
          ) : (
            todayQuests.map((q) => {
              const meta = getCategoryMeta(q.category);
              const Icon = meta.icon;
              const xpReward = q.xp_reward ?? q.xpReward ?? 50;
              const goldReward = q.gold_reward ?? q.goldReward ?? 25;

              return (
                <div
                  key={q.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    q.completed
                      ? 'bg-slate-800/40 border-slate-800/60 opacity-75'
                      : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/90'
                  }`}
                >
                  <div
                    onClick={onOpenQuests}
                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer pr-2"
                  >
                    {/* Category Icon Box */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          q.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                        title={q.title}
                      >
                        {q.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-[10px] font-mono text-slate-400">
                        <span className="text-indigo-300 font-medium">+{xpReward} XP</span>
                        <span>•</span>
                        <span className="text-amber-300 font-medium">+{goldReward} 🪙</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Completion Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!q.completed && onCompleteQuest) {
                        onCompleteQuest(q);
                      }
                    }}
                    disabled={q.completed}
                    className="p-1 text-slate-400 hover:text-emerald-400 disabled:cursor-default transition flex-shrink-0 focus:outline-none"
                    title={q.completed ? 'Completed' : 'Mark Quest Complete'}
                  >
                    {q.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Forge New Quest Action Button */}
        <button
          type="button"
          onClick={onOpenCreateQuest || onOpenQuests}
          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center space-x-1.5 shadow-sm flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Quest</span>
        </button>
      </div>

      {/* 2. Player Stats Floating Glass Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-100 tracking-wide">
            Player Stats
          </h3>
          <button
            type="button"
            onClick={() => onOpenStats && onOpenStats()}
            className="group px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700/60 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Real Attribute Progress Bars */}
        <div className="space-y-2.5 pt-3">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">{s.label}</span>
                <span className="font-mono font-semibold text-slate-200">
                  {s.value}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (s.value / 100) * 100)}%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
