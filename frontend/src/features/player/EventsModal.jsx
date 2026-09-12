import React, { useState, useEffect } from 'react';
import { History, Sparkles, Trophy, ShoppingBag, Shield, Crown, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Api } from '../../services/api';
import CloseButton from '../../components/CloseButton';

const EVENT_ICONS = {
  quest_completed: CheckCircle2,
  level_up: Shield,
  item_purchased: ShoppingBag,
  item_equipped: Sparkles,
  achievement_unlocked: Trophy,
  realm_mastered: Crown,
  expansion_unlocked: Crown,
};

export default function EventsModal({ isOpen = false, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await Api.events.list();
      setEvents(data || []);
    } catch (err) {
      console.warn('[Events] Using fallback event stream:', err.message);
      setEvents([
        { id: 'ev-1', type: 'quest_completed', title: 'Quest Completed: Study Architecture', description: 'Earned +50 XP and +25 Gold.', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'ev-2', type: 'item_purchased', title: 'Acquired: Astral Fox', description: 'Purchased companion pet for your living diorama.', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'ev-3', type: 'achievement_unlocked', title: 'Unlocked: First Steps', description: 'Completed your very first real-life quest.', createdAt: new Date(Date.now() - 10800000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="events-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 40px)',
        }}
        className="relative flex flex-col rounded-2xl bg-slate-950/95 border border-slate-700/60 shadow-2xl shadow-black/80 backdrop-blur-2xl text-slate-100 overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="events-modal-title"
                className="text-base sm:text-lg font-bold text-slate-100 font-rpg tracking-wide truncate"
              >
                Chronicles & Activity Feed
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Your chronological journey of actions and milestones
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={loadEvents}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/70 hover:bg-slate-700/90 border border-slate-700/70 text-slate-300 hover:text-white transition"
              title="Refresh activity feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <CloseButton onClose={onClose} title="Close activity feed" />
          </div>
        </div>

        {/* Scrollable Event Stream */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No activity recorded yet. Complete quests, earn achievements, or acquire shop items to begin your chronicle!
            </div>
          ) : (
            events.map((ev) => {
              const Icon = EVENT_ICONS[ev.type] || Sparkles;
              const formattedTime = ev.createdAt
                ? new Date(ev.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';
              return (
                <div
                  key={ev.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3.5 shadow-md transition-all hover:border-slate-700"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {ev.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                        {formattedTime}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
