/**
 * In-Game Day/Night Cycle Store (Zero External Dependencies)
 * 
 * Drives the stylized celestial cycle independently from the real-world clock.
 * Configurable cycle duration, smooth interpolation of sun/moon arcs,
 * ambient intensities, sky colors, and star visibility.
 */

import * as THREE from 'three';

export const CYCLE_PHASES = {
  DAWN: 'dawn',
  DAY: 'day',
  SUNSET: 'sunset',
  NIGHT: 'night',
};

// Centralized in-game 24h celestial cycle duration: 10 minutes (600 seconds)
export const GAME_DAY_DURATION = 600;
export const DEFAULT_DAY_LENGTH_SECONDS = GAME_DAY_DURATION;

// Celestial keyframes distributed smoothly across 24h (0.0 to 1.0)
export const CELESTIAL_KEYFRAMES = [
  {
    time: 0.0, // Midnight
    phase: CYCLE_PHASES.NIGHT,
    sky: '#0a0f1d',
    fog: '#070b16',
    sunColor: '#93c5fd', // Moonbeam silver-blue
    sunIntensity: 1.15,
    ambientColor: '#3b82f6',
    ambientIntensity: 0.75,
    rimColor: '#1e1b4b',
    rimIntensity: 0.35,
    starsOpacity: 0.95,
    isNight: true,
  },
  {
    time: 0.20, // Pre-dawn twilight
    phase: CYCLE_PHASES.DAWN,
    sky: '#1e1b4b',
    fog: '#1e1635',
    sunColor: '#fde68a',
    sunIntensity: 1.45,
    ambientColor: '#c084fc',
    ambientIntensity: 0.80,
    rimColor: '#312e81',
    rimIntensity: 0.38,
    starsOpacity: 0.60,
    isNight: false,
  },
  {
    time: 0.28, // Golden Dawn
    phase: CYCLE_PHASES.DAWN,
    sky: '#383b58',
    fog: '#2a2744',
    sunColor: '#fef08a',
    sunIntensity: 1.85,
    ambientColor: '#fed7aa',
    ambientIntensity: 0.90,
    rimColor: '#6366f1',
    rimIntensity: 0.42,
    starsOpacity: 0.15,
    isNight: false,
  },
  {
    time: 0.45, // Crisp Sunny Midday
    phase: CYCLE_PHASES.DAY,
    sky: '#475569',
    fog: '#334155',
    sunColor: '#fffbeb',
    sunIntensity: 2.35,
    ambientColor: '#f1f5f9',
    ambientIntensity: 1.10,
    rimColor: '#93c5fd',
    rimIntensity: 0.45,
    starsOpacity: 0.0,
    isNight: false,
  },
  {
    time: 0.68, // Golden Hour / Early Sunset
    phase: CYCLE_PHASES.SUNSET,
    sky: '#6d28d9',
    fog: '#581c87',
    sunColor: '#f97316',
    sunIntensity: 2.15,
    ambientColor: '#fbcfe8',
    ambientIntensity: 0.98,
    rimColor: '#7c3aed',
    rimIntensity: 0.45,
    starsOpacity: 0.25,
    isNight: false,
  },
  {
    time: 0.78, // Vivid Dusky Sunset
    phase: CYCLE_PHASES.SUNSET,
    sky: '#4c1d63',
    fog: '#3b0764',
    sunColor: '#ea580c',
    sunIntensity: 1.75,
    ambientColor: '#fda4af',
    ambientIntensity: 0.88,
    rimColor: '#4c1d95',
    rimIntensity: 0.40,
    starsOpacity: 0.55,
    isNight: false,
  },
  {
    time: 0.88, // Deep Night
    phase: CYCLE_PHASES.NIGHT,
    sky: '#0f172a',
    fog: '#0a101f',
    sunColor: '#bfdbfe',
    sunIntensity: 1.25,
    ambientColor: '#60a5fa',
    ambientIntensity: 0.82,
    rimColor: '#312e81',
    rimIntensity: 0.35,
    starsOpacity: 0.95,
    isNight: true,
  },
  {
    time: 1.0, // Wrap back to Midnight
    phase: CYCLE_PHASES.NIGHT,
    sky: '#0a0f1d',
    fog: '#070b16',
    sunColor: '#93c5fd',
    sunIntensity: 1.15,
    ambientColor: '#3b82f6',
    ambientIntensity: 0.75,
    rimColor: '#1e1b4b',
    rimIntensity: 0.35,
    starsOpacity: 0.95,
    isNight: true,
  },
];

// Standalone event-driven state container
let clockState = {
  gameTime: 0.42, // start at late morning
  isPaused: false,
  cycleDuration: DEFAULT_DAY_LENGTH_SECONDS,
  lastNotify: 0,
  listeners: new Set(),
};

export const gameClock = {
  getState: () => clockState,
  subscribe: (fn) => {
    clockState.listeners.add(fn);
    return () => clockState.listeners.delete(fn);
  },
  tick: (deltaSeconds) => {
    if (clockState.isPaused || clockState.cycleDuration <= 0) return;
    clockState.gameTime = (clockState.gameTime + deltaSeconds / clockState.cycleDuration) % 1.0;
    
    // Throttle UI text subscriber notifications to ~2Hz for crisp performance
    const now = performance.now();
    if (now - clockState.lastNotify > 500) {
      clockState.lastNotify = now;
      clockState.listeners.forEach((fn) => fn(clockState));
    }
  },
  setTime: (t) => {
    clockState.gameTime = Math.max(0, Math.min(1, t));
    clockState.listeners.forEach((fn) => fn(clockState));
  },
  togglePause: () => {
    clockState.isPaused = !clockState.isPaused;
    clockState.listeners.forEach((fn) => fn(clockState));
  },
  setPhase: (phase) => {
    if (phase === 'dawn') clockState.gameTime = 0.25;
    else if (phase === 'day') clockState.gameTime = 0.45;
    else if (phase === 'sunset') clockState.gameTime = 0.74;
    else if (phase === 'night') clockState.gameTime = 0.90;
    clockState.listeners.forEach((fn) => fn(clockState));
  },
};

// Reusable scratch objects for frame-rate allocation-free color blending
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _resSunColor = new THREE.Color();
const _resAmbientColor = new THREE.Color();
const _resRimColor = new THREE.Color();
const _resSkyColor = new THREE.Color();
const _resFogColor = new THREE.Color();
const _sunPos = [0, 0, 0];

const _resMood = {
  phase: CYCLE_PHASES.DAY,
  gameTime: 0.5,
  formattedTime: '12:00',
  isNight: false,
  sunPosition: _sunPos,
  sunColor: _resSunColor,
  sunIntensity: 2.0,
  ambientColor: _resAmbientColor,
  ambientIntensity: 1.0,
  rimColor: _resRimColor,
  rimIntensity: 0.4,
  sky: _resSkyColor,
  fog: _resFogColor,
  starsOpacity: 0.0,
  sunX: 0,
  sunY: 0,
  sunZ: 14.0,
};

/**
 * Calculates continuous, smoothly interpolated lighting, sun position, and sky mood
 * based on current gameTime (0.0 to 1.0). Zero discrete jumps between frames.
 * Completely allocation-free per frame.
 */
export function getCycleMood(gameTime) {
  const t = Math.max(0, Math.min(1, gameTime));

  // Find surrounding keyframes
  let idx = 0;
  for (let i = 0; i < CELESTIAL_KEYFRAMES.length - 1; i++) {
    if (t >= CELESTIAL_KEYFRAMES[i].time && t <= CELESTIAL_KEYFRAMES[i + 1].time) {
      idx = i;
      break;
    }
  }

  const k1 = CELESTIAL_KEYFRAMES[idx];
  const k2 = CELESTIAL_KEYFRAMES[idx + 1] || CELESTIAL_KEYFRAMES[idx];
  const span = Math.max(k2.time - k1.time, 0.0001);
  const blend = (t - k1.time) / span;

  // Continuous color lerping
  _c1.set(k1.sunColor);
  _c2.set(k2.sunColor);
  _resSunColor.copy(_c1).lerp(_c2, blend);

  _c1.set(k1.ambientColor);
  _c2.set(k2.ambientColor);
  _resAmbientColor.copy(_c1).lerp(_c2, blend);

  _c1.set(k1.rimColor);
  _c2.set(k2.rimColor);
  _resRimColor.copy(_c1).lerp(_c2, blend);

  _c1.set(k1.sky);
  _c2.set(k2.sky);
  _resSkyColor.copy(_c1).lerp(_c2, blend);

  _c1.set(k1.fog);
  _c2.set(k2.fog);
  _resFogColor.copy(_c1).lerp(_c2, blend);

  const sunIntensity = THREE.MathUtils.lerp(k1.sunIntensity, k2.sunIntensity, blend);
  const ambientIntensity = THREE.MathUtils.lerp(k1.ambientIntensity, k2.ambientIntensity, blend);
  const rimIntensity = THREE.MathUtils.lerp(k1.rimIntensity, k2.rimIntensity, blend);
  const starsOpacity = THREE.MathUtils.lerp(k1.starsOpacity, k2.starsOpacity, blend);

  // Smooth continuous sun/moon arc
  const sunAngle = (t - 0.25) * Math.PI * 2;
  const sunDist = 28.0;
  const sunX = Math.cos(sunAngle) * sunDist;
  const sunY = Math.sin(sunAngle) * sunDist;
  const sunZ = 14.0;

  _sunPos[0] = sunX;
  _sunPos[1] = Math.max(sunY, -8);
  _sunPos[2] = sunZ;

  // Format in-game 24h clock for HUD
  const totalMinutes = Math.floor(t * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  let phase = k1.phase;
  if (t >= 0.20 && t < 0.35) {
    phase = CYCLE_PHASES.DAWN;
  } else if (t >= 0.35 && t < 0.65) {
    phase = CYCLE_PHASES.DAY;
  } else if (t >= 0.65 && t < 0.82) {
    phase = CYCLE_PHASES.SUNSET;
  } else {
    phase = CYCLE_PHASES.NIGHT;
  }
  const isNight = phase === CYCLE_PHASES.NIGHT;

  _resMood.phase = phase;
  _resMood.gameTime = t;
  _resMood.formattedTime = formattedTime;
  _resMood.isNight = isNight;
  _resMood.sunIntensity = sunIntensity;
  _resMood.ambientIntensity = ambientIntensity;
  _resMood.rimIntensity = rimIntensity;
  _resMood.starsOpacity = starsOpacity;
  _resMood.sunX = sunX;
  _resMood.sunY = sunY;
  _resMood.sunZ = sunZ;

  return _resMood;
}

