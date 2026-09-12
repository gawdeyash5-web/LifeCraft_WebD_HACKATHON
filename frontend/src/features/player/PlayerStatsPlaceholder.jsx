import React, { useState, useEffect, useCallback } from 'react';
import { Award, Flame, Brain, Dumbbell, Sparkles, Compass, Target, UserCheck, LogIn, LogOut, RefreshCw, Globe } from 'lucide-react';
import { Api } from '../../services/api';
import AuthModal from './AuthModal';

/**
 * Player Profile & RPG Stats Module
 * 
 * Displays Level, XP progress bar, Streak counter, and RPG Attributes.
 */
export default function PlayerStatsPlaceholder({ player: fallbackPlayer }) {
  const [profile, setProfile] = useState(fallbackPlayer || {});
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('lifecraft_token'));

  // Sync with prop when prop changes if not logged in
  useEffect(() => {
    if (!authToken && fallbackPlayer) {
      setProfile(fallbackPlayer);
    }
  }, [fallbackPlayer, authToken]);

  // Fetch live profile from backend when authenticated
  const fetchLiveProfile = useCallback(async () => {
    const token = localStorage.getItem('lifecraft_token');
    if (!token) return;

    setLoading(true);
    try {
      const data = await Api.player.getMe();
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('[PlayerStats] Using local state. API note:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchLiveProfile();
    }
  }, [authToken, fetchLiveProfile]);

  const handleAuthSuccess = (user) => {
    setAuthToken(localStorage.getItem('lifecraft_token'));
    fetchLiveProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('lifecraft_token');
    setAuthToken(null);
    setProfile(fallbackPlayer || {});
  };

  const {
    username = profile.username || fallbackPlayer?.username || 'Hero',
    level = profile.level ?? fallbackPlayer?.level ?? 1,
    xp = profile.xp ?? fallbackPlayer?.xp ?? 0,
    nextLevelXp = profile.nextLevelXp ?? fallbackPlayer?.nextLevelXp ?? 100,
    gold = profile.gold ?? fallbackPlayer?.gold ?? 50,
    streak = profile.streak ?? fallbackPlayer?.streak ?? 0,
    activeRegion = profile.activeRegion || fallbackPlayer?.activeRegion || 'mind',
    attributes = profile.attributes || fallbackPlayer?.attributes || {
      intelligence: 10,
      strength: 10,
      creativity: 10,
      wisdom: 10,
      discipline: 10,
    },
  } = profile;

  const xpPercentage = Math.min(100, Math.max(0, Math.round((xp / (nextLevelXp || 100)) * 100)));

  const attributeIcons = [
    { key: 'intelligence', label: 'Intelligence', value: attributes.intelligence ?? 10, icon: Brain, color: 'text-sky-400' },
    { key: 'strength', label: 'Strength', value: attributes.strength ?? 10, icon: Dumbbell, color: 'text-rose-400' },
    { key: 'creativity', label: 'Creativity', value: attributes.creativity ?? 10, icon: Sparkles, color: 'text-emerald-400' },
    { key: 'wisdom', label: 'Wisdom', value: attributes.wisdom ?? 10, icon: Compass, color: 'text-amber-400' },
    { key: 'discipline', label: 'Discipline', value: attributes.discipline ?? 10, icon: Target, color: 'text-indigo-400' },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col space-y-4">
      {/* Account Status / Auth Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          {authToken ? (
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <UserCheck className="w-4 h-4" />
              <span>{username}</span>
            </div>
          ) : (
            <span className="text-slate-400">Guest Mode</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {authToken && (
            <button
              onClick={fetchLiveProfile}
              disabled={loading}
              title="Refresh player stats"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          {authToken ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] font-semibold border border-slate-700"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition text-[11px] font-semibold shadow-md shadow-indigo-600/20"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Level & Streak Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-rpg font-bold text-xl text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            {level}
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Character Level</div>
            <div className="text-base font-bold text-slate-100">Level {level} Adventurer</div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold">{streak} Day Streak</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Experience Points</span>
          <span className="font-semibold text-slate-300">{xp} / {nextLevelXp} XP ({xpPercentage}%)</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* Active Realm Indicator */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Active Realm</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
          {activeRegion}
        </span>
      </div>

      {/* 5 Core Attributes Grid */}
      <div className="pt-2 border-t border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Attributes</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {attributeIcons.map((attr) => {
            const Icon = attr.icon;
            return (
              <div
                key={attr.key}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${attr.color}`} />
                  <span className="text-xs text-slate-300">{attr.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-100">{attr.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800/60 flex items-center justify-center space-x-1.5">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        <span>Personal Attributes &bull; Real-time progression synchronization</span>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
