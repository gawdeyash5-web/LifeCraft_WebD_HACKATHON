import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sun, Moon, Sunrise, Sunset, Play, Pause, Compass, RotateCcw } from 'lucide-react';
import WorldScene from './WorldScene';
import { WORLD_CONFIG, REALMS } from './worldConfig';
import { gameClock, getCycleMood } from './hooks/useGameClock';
import RealmEvolutionDevBar from './ui/RealmEvolutionDevBar';

/**
 * Fallback Loading State for 3D Asset Streaming
 */
function CanvasLoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050814] text-slate-300 z-10">
      <div className="relative w-14 h-14 mb-3">
        <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/40 animate-ping"></div>
        <div className="relative w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-400/60 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-7 h-7 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      <p className="text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-slate-300">
        Assembling Living Diorama...
      </p>
    </div>
  );
}

/**
 * In-Game Celestial Clock HUD Widget
 */
function GameClockWidget() {
  const [clock, setClock] = useState(gameClock.getState());

  useEffect(() => {
    return gameClock.subscribe((state) => {
      setClock({ ...state });
    });
  }, []);

  const mood = getCycleMood(clock.gameTime);

  const getPhaseIcon = () => {
    switch (mood.phase) {
      case 'dawn':
        return <Sunrise className="w-3.5 h-3.5 text-amber-300 animate-pulse" />;
      case 'day':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'sunset':
        return <Sunset className="w-3.5 h-3.5 text-orange-400 animate-pulse" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-indigo-300" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/60 shadow-xl pointer-events-auto">
      {/* Time & Phase Badge */}
      <div className="flex items-center space-x-1.5 pr-1.5 border-r border-slate-800">
        {getPhaseIcon()}
        <span className="font-mono text-xs font-semibold text-slate-200">
          {mood.formattedTime}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
          {mood.phase}
        </span>
      </div>

      {/* Quick Phase Selector Buttons */}
      <div className="flex items-center space-x-0.5">
        <button
          type="button"
          onClick={() => gameClock.setPhase('dawn')}
          className={`p-1 rounded-md transition ${mood.phase === 'dawn' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
          title="Jump to Dawn"
        >
          <Sunrise className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => gameClock.setPhase('day')}
          className={`p-1 rounded-md transition ${mood.phase === 'day' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
          title="Jump to Midday"
        >
          <Sun className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => gameClock.setPhase('sunset')}
          className={`p-1 rounded-md transition ${mood.phase === 'sunset' ? 'bg-orange-500/20 text-orange-300' : 'text-slate-400 hover:text-slate-200'}`}
          title="Jump to Sunset"
        >
          <Sunset className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => gameClock.setPhase('night')}
          className={`p-1 rounded-md transition ${mood.phase === 'night' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}
          title="Jump to Night"
        >
          <Moon className="w-3 h-3" />
        </button>

        {/* Play/Pause Cycle */}
        <button
          type="button"
          onClick={() => gameClock.togglePause()}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition ml-0.5"
          title={clock.isPaused ? 'Resume Day/Night Cycle' : 'Pause Day/Night Cycle'}
        >
          {clock.isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Upgraded 3D World Canvas
 */
export default function WorldCanvas({
  activeRegion = null,
  onSelectRegion,
  realmLevels = { mind: 1, body: 1, craft: 1 },
  onSetRealmLevel,
}) {
  const isRealmFocused = Boolean(activeRegion && activeRegion !== 'overview');

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Viewport */}
      <Suspense fallback={<CanvasLoadingFallback />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: WORLD_CONFIG.camera.defaultPosition,
            fov: WORLD_CONFIG.camera.fov,
            near: WORLD_CONFIG.camera.near,
            far: WORLD_CONFIG.camera.far,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <WorldScene
            activeRegion={activeRegion}
            onSelectRegion={onSelectRegion}
            realmLevels={realmLevels}
          />
        </Canvas>
      </Suspense>

      {/* Floating Top Controls: Celestial Clock HUD, Return to World & Dev Bar */}
      <div className="absolute top-3 left-4 md:left-52 flex items-center space-x-2 pointer-events-none z-10">
        <GameClockWidget />

        {isRealmFocused && (
          <button
            type="button"
            onClick={() => onSelectRegion && onSelectRegion(null)}
            className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800/90 text-indigo-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-indigo-500/40 backdrop-blur-md transition-all flex items-center space-x-1.5 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
            title="Return to World"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-45 transition-transform" />
            <span>Return to World</span>
          </button>
        )}

        {/* Development-Only Realm Evolution State Controller (Isolated Member 1 Dev Tool) */}
        <RealmEvolutionDevBar
          realmLevels={realmLevels}
          onSetLevel={onSetRealmLevel}
          activeRegion={activeRegion}
          onSelectRegion={onSelectRegion}
        />
      </div>

      {/* Subtle Bottom Interaction Hint */}
      <div className="absolute bottom-20 left-4 md:left-52 pointer-events-none z-10 hidden sm:block">
        <div className="bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 flex items-center space-x-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Click landmarks to travel &bull; Drag to orbit diorama</span>
        </div>
      </div>
    </div>
  );
}
