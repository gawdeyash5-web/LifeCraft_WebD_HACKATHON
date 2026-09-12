import React from 'react';
import { Shield } from 'lucide-react';
import QuestCard from './QuestCard';

/**
 * Modular Quest List component.
 * Handles loading skeleton, empty states, and renders list of QuestCards.
 */
export default function QuestList({
  quests = [],
  loading = false,
  error = null,
  statusFilter = 'active',
  onOpenCreate,
  onComplete,
  onEdit,
  onDelete,
  deletingId = null,
}) {
  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
        Loading quests from neural registry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
        {error}
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40">
        <Shield className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">No quests found</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          {statusFilter === 'completed'
            ? 'No completed quests yet. Finish an active quest to earn XP and rewards!'
            : 'Forge a new quest to conquer this realm and advance your journey!'}
        </p>
        {statusFilter !== 'completed' && onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition"
          >
            + Forge First Quest
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2 overflow-y-auto flex-1 pr-1">
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === quest.id}
        />
      ))}
    </div>
  );
}
