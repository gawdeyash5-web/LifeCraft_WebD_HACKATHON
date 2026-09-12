import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, ChevronRight, BookOpen, Dumbbell, Code2, BookMarked, Sparkles } from 'lucide-react';

/**
 * Floating Right Glassmorphic Panel (Today's Quests & Player Stats)
 * 
 * Directly matches the reference image composition:
 * Translucent cards floating on the right side over the 3D world canvas.
 */
export default function RightOverlayDrawer({
  player,
  activeRegion,
  onCompleteQuest,
  isOpen = true,
  onToggle,
  onOpenStats,
}) {
  const [quests, setQuests] = useState([
    {
      id: 'q1',
      title: 'Study DSA',
      category: 'mind',
      xpReward: 80,
      goldReward: 30,
      completed: true,
      icon: BookOpen,
      color: '#a855f7', // purple
    },
    {
      id: 'q2',
      title: 'Workout for 30 mins',
      category: 'body',
      xpReward: 60,
      goldReward: 25,
      completed: true,
      icon: Dumbbell,
      color: '#ef4444', // red
    },
    {
      id: 'q3',
      title: 'Read 20 pages',
      category: 'mind',
      xpReward: 40,
      goldReward: 15,
      completed: true,
      icon: BookMarked,
      color: '#38bdf8', // blue
    },
    {
      id: 'q4',
      title: 'Build something',
      category: 'craft',
      xpReward: 70,
      goldReward: 30,
      completed: false,
      icon: Code2,
      color: '#06b6d4', // cyan
    },
  ]);

  const handleToggleQuest = (id) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const newCompleted = !q.completed;
          if (newCompleted && onCompleteQuest) {
            onCompleteQuest(q);
          }
          return { ...q, completed: newCompleted };
        }
        return q;
      })
    );
  };

  const stats = [
    { label: 'Intelligence', value: 74, color: '#a855f7' }, // purple
    { label: 'Strength', value: 62, color: '#ef4444' },     // red
    { label: 'Creativity', value: 68, color: '#38bdf8' },   // cyan/blue
    { label: 'Wisdom', value: 55, color: '#f59e0b' },       // amber
    { label: 'Discipline', value: 80, color: '#22c55e' },   // emerald
  ];

  return (
    <aside className="absolute right-4 top-4 bottom-24 z-20 hidden lg:flex flex-col space-y-3 pointer-events-none w-80">
      {/* 1. Today's Quests Floating Glass Card */}
      <div className="flex-1 min-h-0 flex flex-col p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl pointer-events-auto overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 tracking-wide">
              Today's Quests
            </h3>
          </div>
          <button
            type="button"
            className="group px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700/60 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 scrollbar-none">
          {quests.map((q) => {
            const Icon = q.icon;
            return (
              <div
                key={q.id}
                onClick={() => handleToggleQuest(q.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  q.completed
                    ? 'bg-slate-800/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/90'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Category Color Icon Box */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: `${q.color}25`, color: q.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        q.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {q.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] font-mono text-slate-400">
                      <span className="text-indigo-300 font-medium">+{q.xpReward} XP</span>
                      <span>•</span>
                      <span className="text-amber-300 font-medium">+{q.goldReward} 🪙</span>
                    </div>
                  </div>
                </div>

                {/* Completion Checkmark */}
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-emerald-400 transition"
                >
                  {q.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Quest Action Button */}
        <button
          type="button"
          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center space-x-1.5 shadow-sm"
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
            <span>View Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Stat Bars */}
        <div className="space-y-2 pt-2.5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium w-24 truncate">
                {stat.label}
              </span>
              <div className="flex-1 mx-2.5 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.value}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-slate-400 w-6 text-right">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
