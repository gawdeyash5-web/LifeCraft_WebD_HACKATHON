import React from 'react';
import { createPortal } from 'react-dom';
import {
  Terminal,
  X,
  RotateCcw,
  Sparkles,
  Eye,
  Shield,
  Layers,
  BookOpen,
  Dumbbell,
  Hammer,
  Building2,
  Lock,
  Unlock,
  AlertOctagon,
} from 'lucide-react';

const REALM_DATA = [
  {
    id: 'mind',
    name: 'Mind Realm',
    icon: BookOpen,
    color: 'from-sky-500 to-indigo-600',
    border: 'border-sky-500/40',
    accentText: 'text-sky-400',
    levels: [
      { level: 1, name: 'Foundation', desc: 'Basic study altar & stone paths' },
      { level: 2, name: 'Arcane Academy', desc: 'Floating crystal & lecture pillars' },
      { level: 3, name: 'Knowledge Citadel', desc: 'Towering spires & arcane archives' },
    ],
  },
  {
    id: 'body',
    name: 'Body Realm',
    icon: Dumbbell,
    color: 'from-rose-500 to-amber-600',
    border: 'border-rose-500/40',
    accentText: 'text-rose-400',
    levels: [
      { level: 1, name: 'Foundation', desc: 'Training dummy & iron ring' },
      { level: 2, name: 'Combat Dojo', desc: 'Weapon racks & sand arenas' },
      { level: 3, name: 'Grand Coliseum', desc: 'Monumental stadium & valor braziers' },
    ],
  },
  {
    id: 'craft',
    name: 'Craft Realm',
    icon: Hammer,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/40',
    accentText: 'text-emerald-400',
    levels: [
      { level: 1, name: 'Foundation', desc: 'Work table & simple anvil' },
      { level: 2, name: 'Artisan Forge', desc: 'Smelting furnace & gear arrays' },
      { level: 3, name: 'Engineering Foundry', desc: 'Automated factory & steam towers' },
    ],
  },
];

const EXPANSION_ZONES = [
  {
    key: 'mind_library',
    realm: 'MIND',
    title: 'Celestial Library Wing',
    desc: 'Outer astronomical observatory with astral spires',
    icon: Building2,
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    key: 'body_coliseum',
    realm: 'BODY',
    title: 'Gladiatorial Coliseum Expansion',
    desc: 'Outer arena tier with spectator amphitheater',
    icon: Building2,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    key: 'craft_foundry',
    realm: 'CRAFT',
    title: 'Foundry Expansion',
    desc: 'Heavy machinery assembly wing & mechanical crane',
    icon: Building2,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

/**
 * Developer View Modal
 * Dedicated debug & 3D world state inspector.
 * VISUAL PREVIEW ONLY — Does not mutate player progression, XP, or database.
 */
export default function DeveloperViewModal({
  isOpen,
  onClose,
  realRealmLevels = { mind: 1, body: 1, craft: 1 },
  realMasteryExpansions = [],
  previewState = {
    active: false,
    levels: { mind: null, body: null, craft: null },
    expansions: { mind_library: null, body_coliseum: null, craft_foundry: null },
  },
  onUpdatePreviewLevel,
  onTogglePreviewExpansion,
  onResetPreview,
}) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPreviewActive = previewState.active;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-view-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[calc(100vh-32px)] flex flex-col bg-slate-950 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden font-sans relative"
        style={{ boxShadow: '0 0 40px -10px rgba(245, 158, 11, 0.3)' }}
      >
        {/* Terminal Header Bar */}
        <div className="bg-slate-900 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="dev-view-title" className="text-sm font-bold text-amber-300 font-mono tracking-wider uppercase">
                  DEVELOPER VIEW
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
                  BUILD PREVIEW
                </span>
                {isPreviewActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 animate-pulse">
                    PREVIEW OVERRIDE ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Development / World Preview &bull; Isolated Visual Simulation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onResetPreview}
              title="Restore authoritative backend rendering"
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Developer View"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Callout Bar */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 flex items-center space-x-2 text-[11px] text-amber-200/90 font-mono flex-shrink-0">
          <AlertOctagon className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            PREVIEW ONLY: Toggling realm levels or expansion zones does NOT alter real player XP, levels, gold, achievements, or database records.
          </span>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {/* SECTION 1 — REALM PREVIEW */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  SECTION 1 — REALM PREVIEW
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Current Production Realm Levels: Mind Lv.{realRealmLevels.mind || 1} &bull; Body Lv.{realRealmLevels.body || 1} &bull; Craft Lv.{realRealmLevels.craft || 1}
              </span>
            </div>

            <div className="space-y-4">
              {REALM_DATA.map((realm) => {
                const Icon = realm.icon;
                const realLevel = realRealmLevels[realm.id] || 1;
                const effectiveLevel =
                  previewState.levels[realm.id] !== null && previewState.levels[realm.id] !== undefined
                    ? previewState.levels[realm.id]
                    : realLevel;
                const isOverridden = previewState.levels[realm.id] !== null;

                return (
                  <div
                    key={realm.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${realm.color} text-white`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-100 font-mono">{realm.name}</span>
                        {isOverridden && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Previewing Lv.{effectiveLevel}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Real State: Lv.{realLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {realm.levels.map((lvl) => {
                        const isSelected = effectiveLevel === lvl.level;
                        return (
                          <button
                            key={lvl.level}
                            type="button"
                            onClick={() => onUpdatePreviewLevel(realm.id, lvl.level)}
                            className={`p-2 rounded-xl text-left border transition ${
                              isSelected
                                ? 'bg-indigo-600/30 border-amber-400/80 shadow-md shadow-amber-500/10 text-white'
                                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono">Level {lvl.level}</span>
                              {isSelected && <Eye className="w-3 h-3 text-amber-400" />}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-200 mt-0.5">{lvl.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lvl.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2 — MASTERED EXPANSION ZONES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  SECTION 2 — MASTERED EXPANSION ZONES
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Visual Inspection of Unlocked Architecture
              </span>
            </div>

            <div className="space-y-3">
              {EXPANSION_ZONES.map((zone) => {
                const isRealUnlocked = realMasteryExpansions.includes(zone.key);
                const isPreviewUnlocked =
                  previewState.expansions[zone.key] !== null && previewState.expansions[zone.key] !== undefined
                    ? previewState.expansions[zone.key]
                    : isRealUnlocked;
                const isOverridden = previewState.expansions[zone.key] !== null;

                return (
                  <div
                    key={zone.key}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between space-x-3"
                  >
                    <div className="space-y-0.5 max-w-[65%]">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${zone.badgeColor}`}>
                          {zone.realm}
                        </span>
                        <span className="text-xs font-bold text-slate-100 font-mono">{zone.title}</span>
                        {isOverridden && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Preview
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{zone.desc}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => onTogglePreviewExpansion(zone.key, false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center space-x-1 transition ${
                          !isPreviewUnlocked
                            ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTogglePreviewExpansion(zone.key, true)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center space-x-1 transition ${
                          isPreviewUnlocked
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Unlocked</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3 — FOOTER & RESTORE */}
        <div className="bg-slate-900 border-t border-slate-800 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onResetPreview}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Preview</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Clears visual overrides and restores backend state.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs font-mono shadow-lg transition"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
