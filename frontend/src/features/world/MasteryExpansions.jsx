import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MIND, BODY, CRAFT, DECOR, GROUND } from './assets';
import { SUB_ISLAND_CONFIG } from './worldConfig';
import MasterySubIsland, { SubIslandBridge } from './MasterySubIsland';

function prepareScene(gltf) {
  if (!gltf || !gltf.scene) return null;
  const clone = gltf.scene.clone(true);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return clone;
}

/**
 * Animated Floating Arcane Crystals for Celestial Library
 */
function LibraryFloatingCrystals({ position = [0, 0, 0] }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.8;
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.08;
    }
  });

  const crystals = useMemo(() => [
    { pos: [0.7, 1.8, 0], size: 0.14, color: '#c084fc' },
    { pos: [-0.6, 2.2, 0.4], size: 0.11, color: '#818cf8' },
    { pos: [0.2, 2.6, -0.6], size: 0.16, color: '#e0e7ff' },
    { pos: [-0.5, 1.5, -0.5], size: 0.12, color: '#a855f7' },
  ], []);

  return (
    <group ref={groupRef} position={position}>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <octahedronGeometry args={[c.size, 0]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={2.4}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Animated Rising Forge Embers for Foundry (optimized points)
 */
function FoundryEmbers({ position = [0, 0, 0] }) {
  const pointsRef = useRef();
  const count = 16;
  const [positions, speeds, wobbles] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const wob = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      spd[i] = 0.6 + Math.random() * 0.8;
      wob[i] = Math.random() * Math.PI * 2;
    }
    return [pos, spd, wob];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * speeds[i];
      if (pos[i * 3 + 1] > 2.2) pos[i * 3 + 1] = 0;
      pos[i * 3 + 0] += Math.sin(t * 2 + wobbles[i]) * 0.003;
      pos[i * 3 + 2] += Math.cos(t * 2 + wobbles[i]) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.065} color="#f97316" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/**
 * Celestial Library Wing (Mind Realm Sub-Island Architecture)
 */
function CelestialLibraryWing() {
  const spireGltf = useGLTF(MIND.citadelSpire);
  const towerGltf = useGLTF(MIND.archiveTower);
  const archGltf = useGLTF(MIND.archColonnade);
  const obeliskGltf = useGLTF(MIND.obelisk);
  const bannerGltf = useGLTF(DECOR['banner-green']);

  const spireScene = useMemo(() => prepareScene(spireGltf), [spireGltf]);
  const towerScene = useMemo(() => prepareScene(towerGltf), [towerGltf]);
  const archScene = useMemo(() => prepareScene(archGltf), [archGltf]);
  const obeliskScene = useMemo(() => prepareScene(obeliskGltf), [obeliskGltf]);
  const bannerScene = useMemo(() => prepareScene(bannerGltf), [bannerGltf]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Arched Colonnade Entrance facing bridge approach */}
      <group position={[0.6, 0, 1.4]} rotation={[0, Math.PI * 0.2, 0]} scale={[1.15, 1.15, 1.15]}>
        <primitive object={archScene} />
      </group>

      {/* 2. Main Celestial Library Archive Building */}
      <group position={[0, 0, -0.4]} rotation={[0, -Math.PI * 0.15, 0]} scale={[1.35, 1.35, 1.35]}>
        <primitive object={towerScene} />
        {/* Astral Observatory Spire Roof */}
        <group position={[0, 2.5, 0]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={spireScene} />
        </group>
      </group>

      {/* 3. Flanking Knowledge Obelisk */}
      <group position={[1.4, 0, -0.8]} rotation={[0, 0.4, 0]} scale={[1.15, 1.35, 1.15]}>
        <primitive object={obeliskScene} />
      </group>

      {/* 4. Celestial Emerald/Teal Knowledge Banners */}
      <group position={[-1.2, 0, -0.6]} rotation={[0, Math.PI * 0.6, 0]} scale={[0.95, 0.95, 0.95]}>
        <primitive object={bannerScene} />
      </group>
      <group position={[1.2, 0, 0.5]} rotation={[0, -Math.PI * 0.4, 0]} scale={[0.95, 0.95, 0.95]}>
        <primitive object={bannerScene.clone(true)} />
      </group>

      {/* 5. Stone Study Terrace Bench */}
      <mesh position={[-0.9, 0.2, 0.8]} rotation={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.24, 0.38]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* 6. Orbiting Arcane Crystals */}
      <LibraryFloatingCrystals position={[0, 2.6, -0.4]} />

      {/* 7. Luminous Arcane Lighting (consolidated single light) */}
      <pointLight color="#818cf8" intensity={3.2} distance={8.0} position={[0.4, 2.0, -0.4]} />
    </group>
  );
}

/**
 * Gladiatorial Coliseum Expansion (Body Realm Sub-Island Architecture)
 */
function GladiatorialColiseumExpansion() {
  const platformGltf = useGLTF(BODY.platform);
  const fenceGltf = useGLTF(BODY.fence);
  const targetGltf = useGLTF(BODY.target);
  const flagGltf = useGLTF(BODY.flag);
  const pillarGltf = useGLTF(BODY.pillar);
  const bannerGltf = useGLTF(DECOR['banner-red']);

  const platformScene = useMemo(() => prepareScene(platformGltf), [platformGltf]);
  const fenceScene = useMemo(() => prepareScene(fenceGltf), [fenceGltf]);
  const targetScene = useMemo(() => prepareScene(targetGltf), [targetGltf]);
  const flagScene = useMemo(() => prepareScene(flagGltf), [flagGltf]);
  const pillarScene = useMemo(() => prepareScene(pillarGltf), [pillarGltf]);
  const bannerScene = useMemo(() => prepareScene(bannerGltf), [bannerGltf]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Central Elevated Tournament Arena Stage */}
      <group position={[0, 0.02, -0.2]} scale={[1.4, 1.2, 1.4]} rotation={[0, Math.PI * 0.25, 0]}>
        <primitive object={platformScene} />
      </group>

      {/* 2. Practice Archery & Combat Targets */}
      <group position={[-1.2, 0, -1.1]} rotation={[0, Math.PI * 0.45, 0]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={targetScene} />
      </group>
      <group position={[1.2, 0, -1.0]} rotation={[0, -Math.PI * 0.35, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={targetScene.clone(true)} />
      </group>

      {/* 3. Coliseum Boundary Palisade Fencing */}
      <group position={[-1.7, 0, -0.2]} rotation={[0, Math.PI * 0.5, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={fenceScene} />
      </group>
      <group position={[1.7, 0, -0.2]} rotation={[0, -Math.PI * 0.5, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={fenceScene.clone(true)} />
      </group>

      {/* 4. Stone Gateway Arena Pillars */}
      <group position={[-1.3, 0, 0.9]} scale={[1.2, 1.4, 1.2]}>
        <primitive object={pillarScene} />
      </group>
      <group position={[1.3, 0, 0.9]} scale={[1.2, 1.4, 1.2]}>
        <primitive object={pillarScene.clone(true)} />
      </group>

      {/* 5. Victorious Crimson Heraldic Banners */}
      <group position={[-1.4, 0, 1.3]} rotation={[0, Math.PI * 0.15, 0]} scale={[1.0, 1.0, 1.0]}>
        <primitive object={bannerScene} />
      </group>
      <group position={[1.4, 0, 1.3]} rotation={[0, -Math.PI * 0.15, 0]} scale={[1.0, 1.0, 1.0]}>
        <primitive object={bannerScene.clone(true)} />
      </group>

      {/* 6. High Mast Victory Pennant */}
      <group position={[0, 0, -1.5]} scale={[1.2, 1.3, 1.2]}>
        <primitive object={flagScene} />
      </group>

      {/* 7. Warm Burning Torchlight (consolidated single light) */}
      <pointLight color="#f97316" intensity={3.5} distance={8.0} position={[0, 1.6, -0.4]} />
    </group>
  );
}

/**
 * Foundry Expansion (Craft Realm Sub-Island Architecture)
 */
function FoundryExpansion() {
  const chimneyGltf = useGLTF(CRAFT.chimney);
  const stallGltf = useGLTF(DECOR['stall-red']);
  const cartGltf = useGLTF(CRAFT.cart);
  const chestGltf = useGLTF(CRAFT.chest);
  const timberGltf = useGLTF(CRAFT.lumber);
  const lanternGltf = useGLTF(CRAFT.lantern);

  const chimneyScene = useMemo(() => prepareScene(chimneyGltf), [chimneyGltf]);
  const stallScene = useMemo(() => prepareScene(stallGltf), [stallGltf]);
  const cartScene = useMemo(() => prepareScene(cartGltf), [cartGltf]);
  const chestScene = useMemo(() => prepareScene(chestGltf), [chestGltf]);
  const timberScene = useMemo(() => prepareScene(timberGltf), [timberGltf]);
  const lanternScene = useMemo(() => prepareScene(lanternGltf), [lanternGltf]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Smelting Chimney / Blast Furnace */}
      <group position={[-0.9, 0, -0.8]} rotation={[0, Math.PI * 0.25, 0]} scale={[1.4, 1.4, 1.4]}>
        <primitive object={chimneyScene} />
        {/* Animated Rising Embers */}
        <FoundryEmbers position={[0, 2.4, 0]} />
      </group>

      {/* 2. Engineering Workshop Pavilion */}
      <group position={[0.7, 0, -0.4]} rotation={[0, -Math.PI * 0.35, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={stallScene} />
      </group>

      {/* 3. Ore Transport Cart */}
      <group position={[0.9, 0, 0.8]} rotation={[0, -Math.PI * 0.75, 0]} scale={[1.15, 1.15, 1.15]}>
        <primitive object={cartScene} />
      </group>

      {/* 4. Ironbound Masterwork Vault Chest */}
      <group position={[-1.1, 0, 0.8]} rotation={[0, Math.PI * 0.35, 0]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={chestScene} />
      </group>

      {/* 5. Refined Timber Stacks */}
      <group position={[-1.4, 0, -0.1]} rotation={[0, 0.2, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={timberScene} />
      </group>

      {/* 6. Brass Industrial Lantern Posts */}
      <group position={[-0.2, 0, 1.3]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={lanternScene} />
      </group>

      {/* 7. Radiant Furnace Flame & Hearth Lighting (consolidated single light) */}
      <pointLight color="#f59e0b" intensity={3.6} distance={8.5} position={[-0.4, 1.6, -0.4]} />
    </group>
  );
}

/**
 * Orchestrator for All Mastered Sub-Islands & Bridges
 * 
 * Renders separate floating sub-islands and spanning bridges when unlocked
 * either genuinely by the player or temporarily through Developer Preview.
 */
function MasteryExpansions({
  expansions = [],
  activeRegion = null,
  onSelectRegion = null,
}) {
  const hasMind = expansions.includes('mind_library');
  const hasBody = expansions.includes('body_coliseum');
  const hasCraft = expansions.includes('craft_foundry');

  return (
    <group name="MasteryExpansionsArchipelago">
      {/* 1. Mind Realm Sub-Island (Celestial Library Wing) */}
      {hasMind && (
        <>
          <SubIslandBridge
            start={SUB_ISLAND_CONFIG.mind.bridgeStart}
            end={SUB_ISLAND_CONFIG.mind.bridgeEnd}
            type="mind"
          />
          <MasterySubIsland
            config={SUB_ISLAND_CONFIG.mind}
            floatOffset={0}
            isActive={activeRegion === 'mind_library'}
            onSelect={onSelectRegion}
          >
            <CelestialLibraryWing />
          </MasterySubIsland>
        </>
      )}

      {/* 2. Body Realm Sub-Island (Gladiatorial Coliseum Expansion) */}
      {hasBody && (
        <>
          <SubIslandBridge
            start={SUB_ISLAND_CONFIG.body.bridgeStart}
            end={SUB_ISLAND_CONFIG.body.bridgeEnd}
            type="body"
          />
          <MasterySubIsland
            config={SUB_ISLAND_CONFIG.body}
            floatOffset={1.6}
            isActive={activeRegion === 'body_coliseum'}
            onSelect={onSelectRegion}
          >
            <GladiatorialColiseumExpansion />
          </MasterySubIsland>
        </>
      )}

      {/* 3. Craft Realm Sub-Island (Foundry Expansion) */}
      {hasCraft && (
        <>
          <SubIslandBridge
            start={SUB_ISLAND_CONFIG.craft.bridgeStart}
            end={SUB_ISLAND_CONFIG.craft.bridgeEnd}
            type="craft"
          />
          <MasterySubIsland
            config={SUB_ISLAND_CONFIG.craft}
            floatOffset={3.2}
            isActive={activeRegion === 'craft_foundry'}
            onSelect={onSelectRegion}
          >
            <FoundryExpansion />
          </MasterySubIsland>
        </>
      )}
    </group>
  );
}

const MemoizedMasteryExpansions = React.memo(MasteryExpansions);
export default MemoizedMasteryExpansions;
