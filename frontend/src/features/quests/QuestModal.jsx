import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Coins, Award } from 'lucide-react';
import { DIFFICULTY_REWARDS, CATEGORY_ATTRIBUTES } from './questService';

const CATEGORIES = [
  { id: 'intelligence', label: 'Mind (Intelligence)', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
  { id: 'strength', label: 'Body (Strength)', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
  { id: 'creativity', label: 'Craft (Creativity)', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'wisdom', label: 'Wisdom', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'discipline', label: 'Discipline', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Quick daily task' },
  { id: 'medium', label: 'Medium', desc: 'Focused effort' },
  { id: 'hard', label: 'Hard', desc: 'Challenging milestone' },
  { id: 'epic', label: 'Epic', desc: 'Boss-level achievement' },
];

export default function QuestModal({ isOpen, onClose, onSubmit, initialQuest = null, defaultCategory = 'intelligence' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('intelligence');
  const [difficulty, setDifficulty] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize form values when modal opens or initialQuest changes
  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title || '');
      setDescription(initialQuest.description || '');
      setCategory(CATEGORY_ATTRIBUTES[initialQuest.category] || initialQuest.category || 'intelligence');
      setDifficulty(initialQuest.difficulty || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setCategory(CATEGORY_ATTRIBUTES[defaultCategory] || defaultCategory || 'intelligence');
      setDifficulty('medium');
    }
    setError(null);
  }, [initialQuest, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const currentRewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.medium;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a quest title.');
      return;
    }
    if (title.trim().length > 150) {
      setError('Title cannot exceed 150 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        id: initialQuest?.id,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save quest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden glass-panel">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-rpg">
                {initialQuest ? 'Edit Quest' : 'Forge New Quest'}
              </h3>
              <p className="text-xs text-slate-400">Define your real-life productivity objective</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Quest Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read Chapter 4 of Systems Design (45m)"
              maxLength={150}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, links, or criteria for completion..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          {/* Category / Realm */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category / Attribute Realm
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition flex items-center justify-between ${
                    category === cat.id
                      ? `${cat.color} ring-1 ring-white/20 font-bold`
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-2.5 rounded-xl text-center border transition ${
                    difficulty === diff.id
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider">{diff.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{diff.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Rewards Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300">Completion Rewards:</div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>+{currentRewards.xp} XP</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                <Coins className="w-3.5 h-3.5" />
                <span>+{currentRewards.gold} Gold</span>
              </span>
              <span className="flex items-center space-x-1 text-indigo-400 font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>+{currentRewards.attributePoints} {category}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialQuest ? 'Update Quest' : 'Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
