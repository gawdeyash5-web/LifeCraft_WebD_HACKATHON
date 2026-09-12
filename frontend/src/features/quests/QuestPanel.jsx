import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Plus } from 'lucide-react';
import QuestFilters from './QuestFilters';
import QuestList from './QuestList';
import QuestForm from './QuestForm';
import QuestCompletion from './QuestCompletion';
import {
  fetchQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  CATEGORY_ATTRIBUTES,
} from './questService';

/**
 * Modular Quest Panel component.
 * Self-contained quest feature module designed to be embedded in any application layout.
 * 
 * Props:
 * - activeRegion: currently focused region from 3D world (e.g. 'mind', 'body', 'craft')
 * - onCompleteQuest: callback to parent when quest is completed
 */
export default function QuestPanel({ activeRegion, onCompleteQuest }) {
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

  // Quick summary metrics
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
      const updated = await updateQuest(questData.id, questData);
      setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    } else {
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

      // Trigger celebration toast
      setCelebrationData(responseData);

      // Inform parent layout
      if (onCompleteQuest) {
        onCompleteQuest(responseData?.player ? responseData : {
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
      <QuestFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        realmFilter={realmFilter}
        setRealmFilter={setRealmFilter}
        activeCount={activeCount}
        completedCount={completedCount}
        totalCount={quests.length}
        onRefresh={loadQuests}
      />

      {/* 3. Quest Cards List */}
      <QuestList
        quests={filteredQuests}
        loading={loading}
        error={error}
        statusFilter={statusFilter}
        onOpenCreate={handleOpenCreateModal}
        onComplete={handleComplete}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteQuest}
        deletingId={deletingId}
      />

      {/* 4. Footer Info */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Active Quests: {activeCount}</span>
        <span>Daily Missions &bull; Real Life RPG</span>
      </div>

      {/* 5. Quest Form / Modal */}
      <QuestForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveQuest}
        initialQuest={editingQuest}
        defaultCategory={realmFilter !== 'all' ? realmFilter : 'intelligence'}
      />

      {/* 6. Level Up & Quest Completion Notification Toast */}
      <QuestCompletion
        rewardData={celebrationData}
        onClose={() => setCelebrationData(null)}
      />
    </div>
  );
}
