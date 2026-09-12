import React, { useState, useEffect } from 'react';
import { History, Sparkles, Trophy, ShoppingBag, Shield, Crown, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Api } from '../../services/api';

const EVENT_ICONS = {
  quest_completed: CheckCircle2,
  level_up: Shield,
  item_purchased: ShoppingBag,
  item_equipped: Sparkles,
  achievement_unlocked: Trophy,
  realm_mastered: Crown,
  expansion_unlocked: Crown,
};

export default function EventsModal({ onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    loadEvents();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full space-y-4 max-h-[80vh] overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-rpg tracking-wide">
              Chronicles & Activity Log
            </h2>
            <p className="text-xs text-slate-400">
              Your heroic journey, milestones, and realm evolutions in review
            </p>
          </div>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Refresh activity feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No events recorded yet. Complete quests or acquire items to begin your chronicle!
          </div>
        ) : (
          events.map((ev) => {
            const Icon = EVENT_ICONS[ev.type] || Sparkles;
            const formattedTime = ev.createdAt ? new Date(ev.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
            return (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3 shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{ev.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-2">{formattedTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
