import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  Plus,
  Shield,
  Zap,
  Coins,
  Award,
  Flame,
  Trash2,
  Edit3,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react';
import QuestModal from './QuestModal';
import LevelUpNotification from './LevelUpNotification';
import {
  fetchQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  CATEGORY_ATTRIBUTES,
} from './questService';

const REALM_TABS = [
  { id: 'all', label: 'All Realms' },
  { id: 'intelligence', label: 'Mind', alias: 'mind' },
  { id: 'strength', label: 'Body', alias: 'body' },
  { id: 'creativity', label: 'Craft', alias: 'craft' },
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'discipline', label: 'Discipline' },
];

export default function QuestListPlaceholder({ activeRegion, onCompleteQuest }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [realmFilter, setRealmFilter] = useState('all');

  // Modals & Notifications
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [celebrationData, setCelebrationData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Sync activeRegion prop from 3D world with realm filter
  useEffect(() => {
    if (activeRegion) {
      const resolved = CATEGORY_ATTRIBUTES[activeRegion] || activeRegion;
      setRealmFilter(resolved);
    }
  }, [activeRegion]);

  // Load quests from backend or fallback store
  const loadQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuests();
      setQuests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch quests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  // Filtered Quests Calculation
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      // Status filter
      if (statusFilter === 'active' && q.completed) return false;
      if (statusFilter === 'completed' && !q.completed) return false;

      // Realm filter
      if (realmFilter !== 'all') {
        const qCat = CATEGORY_ATTRIBUTES[q.category] || q.category;
        if (qCat !== realmFilter) return false;
      }
      return true;
    });
  }, [quests, statusFilter, realmFilter]);

  // Calculate quick summary metrics from quests
  const activeCount = useMemo(() => quests.filter((q) => !q.completed).length, [quests]);
  const completedCount = useMemo(() => quests.filter((q) => q.completed).length, [quests]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleSaveQuest = async (questData) => {
    if (questData.id) {
      // Update
      const updated = await updateQuest(questData.id, questData);
      setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    } else {
      // Create
      const created = await createQuest(questData);
      setQuests((prev) => [created, ...prev]);
    }
  };

  const handleDeleteQuest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) return;
    try {
      setDeletingId(id);
      await deleteQuest(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete quest');
    } finally {
      setDeletingId(null);
    }
  };

  const handleComplete = async (quest) => {
    if (quest.completed) return;
    try {
      const responseData = await completeQuest(quest.id);
      
      // Update local state list
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, completed: true, completed_at: new Date().toISOString() } : q
        )
      );

      // Trigger celebration banner
      setCelebrationData(responseData);

      // Inform parent App.jsx layout (calls handleCompleteQuest)
      if (onCompleteQuest) {
        onCompleteQuest({
          ...quest,
          xpReward: quest.xp_reward ?? quest.xpReward ?? 50,
          goldReward: quest.gold_reward ?? quest.goldReward ?? 25,
        });
      }
    } catch (err) {
      alert(err.message || 'Could not complete quest');
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full relative overflow-hidden">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100 font-rpg tracking-wide">
              Quest Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world missions powering your RPG character growth
          </p>
        </div>

        {/* Forge New Quest Button */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Quest</span>
        </button>
      </div>

      {/* 2. Filter Controls */}
      <div className="pt-3 pb-2 space-y-2.5">
        {/* Status Tabs (All / Active / Completed) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'active'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({quests.length})
            </button>
          </div>

          <button
            onClick={loadQuests}
            title="Refresh quests"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Realm / Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {REALM_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRealmFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition ${
                realmFilter === tab.id
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-300 bg-slate-900/40 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Error Notice */}
      {error && (
        <div className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* 4. Quest Cards List */}
      <div className="space-y-3 mt-2 overflow-y-auto flex-1 pr-1">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
            Loading quests from neural registry...
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40">
            <Shield className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No quests found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {statusFilter === 'completed'
                ? 'No completed quests yet. Finish an active quest to earn XP and rewards!'
                : 'Forge a new quest to conquer this realm and advance your journey!'}
            </p>
            {statusFilter !== 'completed' && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition"
              >
                + Forge First Quest
              </button>
            )}
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isCompleted = quest.completed;
            const xpReward = quest.xp_reward ?? quest.xpReward ?? 50;
            const goldReward = quest.gold_reward ?? quest.goldReward ?? 25;

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border transition flex items-start justify-between group ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {quest.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-950/40 border border-indigo-800/30">
                      {quest.difficulty}
                    </span>
                  </div>

                  <h4 className={`text-sm font-semibold transition ${
                    isCompleted ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-indigo-200'
                  }`}>
                    {quest.title}
                  </h4>

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
                      <button
                        onClick={() => handleOpenEditModal(quest)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Edit Quest"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuest(quest.id)}
                        disabled={deletingId === quest.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
                        title="Delete Quest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleComplete(quest)}
                        className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10 transition"
                        title="Complete Quest"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
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
          })
        )}
      </div>

      {/* 5. Footer Info */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Active Quests: {activeCount}</span>
        <span>Progression slice &bull; Member 2</span>
      </div>

      {/* 6. Quest Create / Edit Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveQuest}
        initialQuest={editingQuest}
        defaultCategory={realmFilter !== 'all' ? realmFilter : 'intelligence'}
      />

      {/* 7. Level Up & Quest Completion Notification Toast */}
      <LevelUpNotification
        rewardData={celebrationData}
        onClose={() => setCelebrationData(null)}
      />
    </div>
  );
}

