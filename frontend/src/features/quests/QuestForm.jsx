import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Zap, Coins, Award } from 'lucide-react';
import { DIFFICULTY_REWARDS, CATEGORY_ATTRIBUTES } from './questService';

export const CATEGORIES = [
  { id: 'intelligence', label: 'Mind (Intelligence)', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
  { id: 'strength', label: 'Body (Strength)', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
  { id: 'creativity', label: 'Craft (Creativity)', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'wisdom', label: 'Wisdom', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'discipline', label: 'Discipline', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Quick daily task' },
  { id: 'medium', label: 'Medium', desc: 'Focused effort' },
  { id: 'hard', label: 'Hard', desc: 'Challenging milestone' },
  { id: 'epic', label: 'Epic', desc: 'Boss-level achievement' },
];

/**
 * Modular Quest Form / Modal component.
 * Allows creating and editing quests with live XP/Gold reward preview.
 * Fixed viewport overlay with internal scrolling and persistent sticky actions.
 */
export default function QuestForm({
  isOpen,
  onClose,
  onSubmit,
  initialQuest = null,
  defaultCategory = 'intelligence',
}) {
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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100vh-32px)] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl relative overflow-hidden glass-panel"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />

        {/* Sticky/Fixed Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-800 flex-shrink-0 bg-slate-900/95">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="quest-modal-title" className="text-lg font-bold text-slate-100 font-rpg">
                {initialQuest ? 'Edit Quest' : 'Forge New Quest'}
              </h3>
              <p className="text-xs text-slate-400">Define your real-life productivity objective</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with Internal Scroll */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          {/* Scrollable Form Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Title Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Quest Title <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read 30 pages of System Design"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide actionable context or specific requirements..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Attribute Realm
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition ${
                      category === cat.id
                        ? `${cat.color} font-bold ring-1 ring-offset-1 ring-offset-slate-900 ring-indigo-500`
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Tier Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                        ? 'bg-indigo-600/30 border-indigo-500/80 text-indigo-200 font-bold shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-xs capitalize">{diff.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Rewards Preview Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Calculated Rewards:
              </span>
              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+{currentRewards.xp} XP</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{currentRewards.gold} Gold</span>
                </span>
                <span className="flex items-center space-x-1 text-indigo-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{currentRewards.attributePoints} Attribute</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sticky/Fixed Action Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 sm:p-5 border-t border-slate-800 flex-shrink-0 bg-slate-900/95 backdrop-blur-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialQuest ? 'Save Changes' : 'Forge Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
