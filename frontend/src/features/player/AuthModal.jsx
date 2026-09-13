import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Api } from '../../services/api';
import { X, Lock, Mail, User, Mountain, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Premium Dark Fantasy RPG Authentication Modal
 * 
 * Provides polished account creation and login for persistent player progression,
 * matching the LIFECRAFT visual identity with glass panels, RPG gradients,
 * password visibility toggle, clear validation feedback, and guest continuation.
 */
export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (mode === 'register') {
        data = await Api.auth.register({ username: username.trim(), email: email.trim(), password });
      } else {
        data = await Api.auth.login({ email: email.trim(), password });
      }

      if (data?.token) {
        localStorage.setItem('lifecraft_token', data.token);
      }

      onAuthSuccess?.(data?.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError(null);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100vh-32px)] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans relative"
        style={{ boxShadow: '0 0 50px -10px rgba(99, 102, 241, 0.25)' }}
      >
        {/* Modal Header Bar with Branding */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-950 border border-indigo-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Mountain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-rpg text-sm font-bold tracking-wider text-white">LIFECRAFT</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  REALM AUTH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Level Up Your Real Life</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition border border-transparent hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Title & Short Supporting Text */}
          <div className="space-y-1">
            <h2 id="auth-modal-title" className="text-lg font-bold text-slate-100 tracking-tight">
              {mode === 'login' ? 'Welcome back, Adventurer' : 'Begin Your Journey'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to access your persistent 3D world, quest history, and earned cosmetics.'
                : 'Forge a new character to save quests, conquer habits, and level up your life.'}
            </p>
          </div>

          {/* Inline Error Notification Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block flex items-center justify-between">
                  <span>Adventurer Name</span>
                  <span className="text-[10px] text-slate-500">Public profile moniker</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. EldonShadow"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-slate-100 placeholder-slate-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-500">Account identifier</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="hero@lifecraft.realm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-slate-100 placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block flex items-center justify-between">
                <span>Secret Passcode</span>
                <span className="text-[10px] text-slate-500">Min 6 characters</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-slate-100 placeholder-slate-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 font-bold text-sm text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Enter Realm' : 'Forge Character'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest / Demo Mode Continuation */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col items-center space-y-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-indigo-300 transition underline underline-offset-2 flex items-center space-x-1"
            >
              <span>Continue as Guest Adventurer</span>
            </button>
            <p className="text-[10px] text-slate-500">
              Guest progress saves locally on this device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
