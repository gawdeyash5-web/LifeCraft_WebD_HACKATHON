import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WORLD_CONFIG, REALMS } from './worldConfig';
import { gameClock, getCycleMood } from './hooks/useGameClock';
import WorldCamera from './camera/WorldCamera';
import SkyDome from './effects/SkyDome';
import Ground from './Environment/Ground';
import Bridge from './Environment/Bridge';
import Nature from './Environment/Nature';
import PlayerModel from './PlayerModel';
import Campfire from './effects/Campfire';
import AmbientParticles from './effects/AmbientParticles';
import MindRealm from './Realm/MindRealm';
import BodyRealm from './Realm/BodyRealm';
import CraftRealm from './Realm/CraftRealm';

import { useGLTF } from '@react-three/drei';
import { DECOR, EXPANSIONS } from './assets';
import Clouds from './effects/Clouds';

function EquippedWorldDecor({ decorKey }) {
  if (!decorKey || !DECOR[decorKey]) return null;
  return <DecorMesh decorKey={decorKey} modelUrl={DECOR[decorKey]} />;
}

function DecorMesh({ decorKey, modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  let position = [0.8, 0, -1.8];
  let rotation = [0, 0, 0];
  let scale = 0.7;

  if (decorKey === 'banner-red') {
    position = [-2.8, 0, 0.4];
    rotation = [0, Math.PI / 2, 0];
    scale = 0.8;
  } else if (decorKey === 'banner-green') {
    position = [2.8, 0, 0.4];
    rotation = [0, -Math.PI / 2, 0];
    scale = 0.8;
  } else if (decorKey === 'stall-red' || decorKey === 'stall-green') {
    position = [1.8, 0, 2.2];
    rotation = [0, -Math.PI / 4, 0];
    scale = 0.7;
  } else if (decorKey === 'fountain-round-detail') {
    position = [0.7, 0, -1.9];
    scale = 0.75;
  }

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function MasteryExpansionZones({ expansions = [] }) {
  if (!expansions || expansions.length === 0) return null;
  return (
    <group>
      {expansions.includes('mind_library') && (
        <ExpansionBuilding
          modelUrl={EXPANSIONS.mind_library}
          position={[-8.2, 0, -6.2]}
          rotation={[0, 0.6, 0]}
          scale={0.75}
        />
      )}
      {expansions.includes('body_coliseum') && (
        <ExpansionBuilding
          modelUrl={EXPANSIONS.body_coliseum}
          position={[-8.2, 0, 6.2]}
          rotation={[0, -0.4, 0]}
          scale={0.8}
        />
      )}
      {expansions.includes('craft_foundry') && (
        <ExpansionBuilding
          modelUrl={EXPANSIONS.craft_foundry}
          position={[8.4, 0, 1.8]}
          rotation={[0, -0.8, 0]}
          scale={0.75}
        />
      )}
    </group>
  );
}

function ExpansionBuilding({ modelUrl, position, rotation, scale }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

/**
 * Upgraded Living WorldScene Orchestrator
 * 
 * Drives the in-game Day/Night celestial cycle, dynamic sunlight arc,
 * dynamic atmospheric fog, starfield, living player navigation, and rich realms.
 */
export default function WorldScene({
  activeRegion,
  onSelectRegion,
  realmLevels = { mind: 1, body: 1, craft: 1 },
  equippedSkin = null,
  equippedPet = null,
  equippedDecor = null,
  masteryExpansions = [],
}) {
  const [isNight, setIsNight] = useState(false);
  const sunLightRef = useRef();
  const ambientLightRef = useRef();
  const rimLightRef = useRef();
  const fogRef = useRef();

  useEffect(() => {
    return gameClock.subscribe((state) => {
      const currentMood = getCycleMood(state.gameTime);
      setIsNight((prev) => (prev !== currentMood.isNight ? currentMood.isNight : prev));
    });
  }, []);

  // Tick the game clock forward and continuously interpolate all lighting on every frame
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    gameClock.tick(dt);

    const mood = getCycleMood(gameClock.getState().gameTime);

    // 1. Smooth directional sun/moon motion
    if (sunLightRef.current) {
      sunLightRef.current.position.set(mood.sunX, Math.max(mood.sunY, -8), mood.sunZ);
      sunLightRef.current.color.lerp(mood.sunColor, 0.12);
      sunLightRef.current.intensity = THREE.MathUtils.lerp(
        sunLightRef.current.intensity,
        mood.sunIntensity,
        0.12
      );
    }

    // 2. Smooth ambient fill light
    if (ambientLightRef.current) {
      ambientLightRef.current.color.lerp(mood.ambientColor, 0.12);
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(
        ambientLightRef.current.intensity,
        mood.ambientIntensity,
        0.12
      );
    }

    // 3. Smooth rim/opposite light
    if (rimLightRef.current) {
      rimLightRef.current.position.set(-mood.sunX * 0.7, 8, -mood.sunZ * 0.7);
      rimLightRef.current.color.lerp(mood.rimColor, 0.12);
      rimLightRef.current.intensity = THREE.MathUtils.lerp(
        rimLightRef.current.intensity,
        mood.rimIntensity,
        0.12
      );
    }

    // 4. Smooth dynamic fog & background
    if (state.scene.fog && state.scene.fog.color) {
      state.scene.fog.color.lerp(mood.fog, 0.12);
    }
    if (state.scene.background && state.scene.background.isColor) {
      state.scene.background.lerp(mood.sky, 0.12);
    }
  });

  const initialMood = getCycleMood(gameClock.getState().gameTime);

  return (
    <>
      {/* 1. Isometric Camera Controller */}
      <WorldCamera activeRegion={activeRegion} realmLevels={realmLevels} />

      {/* 2. Celestial Starfield & Moon Dome */}
      <SkyDome starsOpacity={initialMood.starsOpacity} isNight={isNight} />

      {/* 3. Dynamic Atmospheric Fog & Background Color */}
      <fog ref={fogRef} attach="fog" args={[initialMood.fog, 34, 75]} />
      <color attach="background" args={[initialMood.sky]} />

      {/* 4. Dynamic Ambient Fill Light */}
      <ambientLight
        ref={ambientLightRef}
        color={initialMood.ambientColor}
        intensity={initialMood.ambientIntensity}
      />

      {/* 5. Celestial Sun/Moon Directional Light */}
      <directionalLight
        ref={sunLightRef}
        color={initialMood.sunColor}
        intensity={initialMood.sunIntensity}
        position={initialMood.sunPosition}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0008}
      />

      {/* 6. Soft Opposite Rim/Fill Light */}
      <directionalLight
        ref={rimLightRef}
        color={initialMood.rimColor}
        intensity={initialMood.rimIntensity}
        position={[-initialMood.sunPosition[0] * 0.7, 8, -initialMood.sunPosition[2] * 0.7]}
      />

      {/* 7. Diorama Landscape Base, Bridge, and Floating Clouds */}
      <Ground />
      <Bridge />
      <Nature />
      <Clouds />

      {/* 8. Centerpiece: Living Player & Streak Campfire */}
      <Campfire isNight={isNight} />
      <PlayerModel
        activeRegion={activeRegion}
        equippedSkin={equippedSkin}
        equippedPet={equippedPet}
      />

      {/* Equipped World Decor (Fountain, Banners, Trade Stall) */}
      <EquippedWorldDecor decorKey={equippedDecor} />

      {/* Mastery Expansion Zones (Library, Coliseum, Foundry) */}
      <MasteryExpansionZones expansions={masteryExpansions} />

      {/* 9. The Three Specialized Realms */}
      <MindRealm
        isActive={activeRegion === REALMS.MIND}
        onSelect={onSelectRegion}
        isNight={isNight}
        level={realmLevels.mind || 1}
      />
      <BodyRealm
        isActive={activeRegion === REALMS.BODY}
        onSelect={onSelectRegion}
        isNight={isNight}
        level={realmLevels.body || 1}
      />
      <CraftRealm
        isActive={activeRegion === REALMS.CRAFT}
        onSelect={onSelectRegion}
        isNight={isNight}
        level={realmLevels.craft || 1}
      />

      {/* 10. Ambient Atmospheric Firefly Motes */}
      <AmbientParticles count={48} />
    </>
  );
}
