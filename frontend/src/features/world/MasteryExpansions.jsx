import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MIND, BODY, CRAFT, DECOR, GROUND } from './assets';

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
            emissiveIntensity={2.2}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Animated Rising Forge Embers for Foundry
 */
function FoundryEmbers({ position = [0, 0, 0] }) {
  const embersRef = useRef();
  const emberData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 16; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 0.5,
        y: Math.random() * 2.0,
        z: (Math.random() - 0.5) * 0.5,
        speed: 0.6 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!embersRef.current) return;
    const t = state.clock.elapsedTime;
    embersRef.current.children.forEach((child, i) => {
      const d = emberData[i];
      d.y += delta * d.speed;
      if (d.y > 2.2) d.y = 0;
      child.position.set(
        d.x + Math.sin(t * 2 + d.wobble) * 0.1,
        d.y,
        d.z + Math.cos(t * 2 + d.wobble) * 0.1
      );
      child.scale.setScalar(Math.max(0, 1.0 - d.y / 2.2));
    });
  });

  return (
    <group position={position} ref={embersRef}>
      {emberData.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.045, 0.045, 0.045]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Celestial Library Wing Expansion (Mind Realm)
 * Visibly extends the Mind Realm with astronomical wing, observatory spire,
 * arched entrance portal, connecting stone path, and arcane obelisks.
 */
function CelestialLibraryWing() {
  const spireGltf = useGLTF(MIND.citadelSpire);
  const towerGltf = useGLTF(MIND.archiveTower);
  const archGltf = useGLTF(MIND.archColonnade);
  const obeliskGltf = useGLTF(MIND.obelisk);
  const bannerGltf = useGLTF(DECOR['banner-green']);
  const pathGltf = useGLTF(GROUND.pathStraight);

  const spireScene = useMemo(() => prepareScene(spireGltf), [spireGltf]);
  const towerScene = useMemo(() => prepareScene(towerGltf), [towerGltf]);
  const archScene = useMemo(() => prepareScene(archGltf), [archGltf]);
  const obeliskScene = useMemo(() => prepareScene(obeliskGltf), [obeliskGltf]);
  const bannerScene = useMemo(() => prepareScene(bannerGltf), [bannerGltf]);
  const pathScene = useMemo(() => prepareScene(pathGltf), [pathGltf]);

  // Position: extends eastward from Mind Realm [-6.2, 0, -4.5] towards center/foreground
  const basePos = [-3.8, 0, -5.6];

  return (
    <group position={basePos}>
      {/* 1. Connecting Stone Pathway from Mind Courtyard */}
      <group position={[-1.2, 0.01, 0.6]} rotation={[0, Math.PI * 0.35, 0]} scale={[1.1, 1, 1.3]}>
        <primitive object={pathScene} />
      </group>

      {/* 2. Arched Colonnade Entrance Portal */}
      <group position={[-0.7, 0, 0.3]} rotation={[0, Math.PI * 0.35, 0]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={archScene} />
      </group>

      {/* 3. Main Celestial Library Wing Archive Building */}
      <group position={[0, 0, 0]} rotation={[0, -Math.PI * 0.15, 0]} scale={[1.4, 1.4, 1.4]}>
        <primitive object={towerScene} />
        {/* Astral Observatory Spire Roof */}
        <group position={[0, 2.5, 0]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={spireScene} />
        </group>
      </group>

      {/* 4. Flanking Knowledge Obelisk */}
      <group position={[1.3, 0, 0.4]} rotation={[0, 0.4, 0]} scale={[1.2, 1.4, 1.2]}>
        <primitive object={obeliskScene} />
      </group>

      {/* 5. Celestial Emerald/Teal Knowledge Banners */}
      <group position={[-0.8, 0, -0.9]} rotation={[0, Math.PI * 0.6, 0]} scale={[1.0, 1.0, 1.0]}>
        <primitive object={bannerScene} />
      </group>
      <group position={[0.9, 0, -0.8]} rotation={[0, -Math.PI * 0.4, 0]} scale={[1.0, 1.0, 1.0]}>
        <primitive object={bannerScene.clone(true)} />
      </group>

      {/* 6. Stone Study Terrace Bench */}
      <mesh position={[0.6, 0.2, 0.9]} rotation={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.25, 0.4]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* 7. Orbiting Arcane Crystals */}
      <LibraryFloatingCrystals position={[0, 2.8, 0]} />

      {/* 8. Luminous Arcane Lighting */}
      <pointLight color="#818cf8" intensity={2.8} distance={6.0} position={[0, 2.2, 0.5]} />
      <pointLight color="#c084fc" intensity={2.0} distance={4.5} position={[1.3, 1.2, 0.4]} />
    </group>
  );
}

/**
 * Gladiatorial Coliseum Expansion (Body Realm)
 * Visibly extends the Body Realm with elevated tournament arena, spectator banners,
 * practice targets, stone columns, perimeter fencing, and torchlight brazier.
 */
function GladiatorialColiseumExpansion() {
  const platformGltf = useGLTF(BODY.platform);
  const fenceGltf = useGLTF(BODY.fence);
  const targetGltf = useGLTF(BODY.target);
  const flagGltf = useGLTF(BODY.flag);
  const pillarGltf = useGLTF(BODY.pillar);
  const bannerGltf = useGLTF(DECOR['banner-red']);
  const pathGltf = useGLTF(GROUND.pathStraight);

  const platformScene = useMemo(() => prepareScene(platformGltf), [platformGltf]);
  const fenceScene = useMemo(() => prepareScene(fenceGltf), [fenceGltf]);
  const targetScene = useMemo(() => prepareScene(targetGltf), [targetGltf]);
  const flagScene = useMemo(() => prepareScene(flagGltf), [flagGltf]);
  const pillarScene = useMemo(() => prepareScene(pillarGltf), [pillarGltf]);
  const bannerScene = useMemo(() => prepareScene(bannerGltf), [bannerGltf]);
  const pathScene = useMemo(() => prepareScene(pathGltf), [pathGltf]);

  // Position: extends forward/eastward from Body Realm [-6.0, 0, 4.5] in direct line-of-sight
  const basePos = [-3.6, 0, 5.8];

  return (
    <group position={basePos}>
      {/* 1. Connecting Pathway from Body Training Yard */}
      <group position={[-1.3, 0.01, -0.6]} rotation={[0, -Math.PI * 0.35, 0]} scale={[1.1, 1, 1.2]}>
        <primitive object={pathScene} />
      </group>

      {/* 2. Elevated Sparring Arena Stage */}
      <group position={[0, 0.05, 0]} rotation={[0, Math.PI * 0.12, 0]} scale={[1.4, 1.1, 1.4]}>
        <primitive object={platformScene} />
        {/* Arena Center Combat Ring Mat */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.7, 1.7]} />
          <meshStandardMaterial color="#991b1b" roughness={0.75} />
        </mesh>
      </group>

      {/* 3. Stone Gladiator Columns framing the Arena */}
      <group position={[-1.2, 0, 1.1]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={pillarScene} />
      </group>
      <group position={[1.2, 0, 1.1]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={pillarScene.clone(true)} />
      </group>

      {/* 4. Perimeter Arena Wooden Fences */}
      <group position={[-1.3, 0, -0.8]} rotation={[0, Math.PI * 0.3, 0]} scale={[1.2, 1.1, 1.2]}>
        <primitive object={fenceScene} />
      </group>
      <group position={[1.1, 0, -0.9]} rotation={[0, -Math.PI * 0.25, 0]} scale={[1.2, 1.1, 1.2]}>
        <primitive object={fenceScene.clone(true)} />
      </group>

      {/* 5. Tournament Victory Banners & Flags */}
      <group position={[-1.4, 0, 0.2]} rotation={[0, Math.PI * 0.5, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={bannerScene} />
      </group>
      <group position={[1.4, 0, 0.2]} rotation={[0, -Math.PI * 0.5, 0]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={bannerScene.clone(true)} />
      </group>
      <group position={[0, 0, -1.3]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={flagScene} />
      </group>

      {/* 6. Heavy Archery Combat Target */}
      <group position={[1.6, 0, 0.8]} rotation={[0, -Math.PI * 0.6, 0]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={targetScene} />
      </group>

      {/* 7. Warm Gladiatorial Torchlight Brazier Light */}
      <pointLight color="#f97316" intensity={3.2} distance={6.5} position={[0, 1.6, 0]} />
      <pointLight color="#10b981" intensity={1.8} distance={4.0} position={[-1.2, 1.0, 1.1]} />
    </group>
  );
}

/**
 * Foundry Expansion (Craft Realm)
 * Visibly extends the Craft Realm with heavy smelting furnace chimney,
 * supply transport cart, stacked timber logs, masterwork chests, and hanging lanterns.
 */
function FoundryExpansion() {
  const chimneyGltf = useGLTF(CRAFT.chimney);
  const structureGltf = useGLTF(BODY.structure);
  const cartGltf = useGLTF(CRAFT.cart);
  const lumberGltf = useGLTF(CRAFT.lumber);
  const chestGltf = useGLTF(CRAFT.chest);
  const lanternGltf = useGLTF(CRAFT.lantern);
  const pathGltf = useGLTF(GROUND.pathStraight);

  const chimneyScene = useMemo(() => prepareScene(chimneyGltf), [chimneyGltf]);
  const structureScene = useMemo(() => prepareScene(structureGltf), [structureGltf]);
  const cartScene = useMemo(() => prepareScene(cartGltf), [cartGltf]);
  const lumberScene = useMemo(() => prepareScene(lumberGltf), [lumberGltf]);
  const chestScene = useMemo(() => prepareScene(chestGltf), [chestGltf]);
  const lanternScene = useMemo(() => prepareScene(lanternGltf), [lanternGltf]);
  const pathScene = useMemo(() => prepareScene(pathGltf), [pathGltf]);

  // Position: extends northwestward along canal bank from Craft Realm [6.2, 0, 0.4] towards center
  const basePos = [4.8, 0, -2.6];

  return (
    <group position={basePos}>
      {/* 1. Connecting Timber/Stone Path from Craft Workshop */}
      <group position={[0.7, 0.01, 1.4]} rotation={[0, Math.PI * 0.1, 0]} scale={[1.1, 1, 1.3]}>
        <primitive object={pathScene} />
      </group>

      {/* 2. Heavy Smelting Furnace Chimney with animated embers */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI * 0.2, 0]} scale={[1.6, 1.6, 1.6]}>
        <primitive object={chimneyScene} />
        {/* Blazing furnace fire light */}
        <pointLight color="#ea580c" intensity={3.8} distance={6.0} position={[0, 0.8, 0]} />
        {/* Rising chimney embers */}
        <FoundryEmbers position={[0, 1.7, 0]} />
      </group>

      {/* 3. Foundry Forge Workshop Pavilion */}
      <group position={[-1.2, 0, 0.6]} rotation={[0, -Math.PI * 0.35, 0]} scale={[0.9, 0.9, 0.9]}>
        <primitive object={structureScene} />
      </group>

      {/* 4. Raw Timber Lumber Stacks */}
      <group position={[1.4, 0, -0.5]} rotation={[0, 0.4, 0]} scale={[1.3, 1.3, 1.3]}>
        <primitive object={lumberScene} />
      </group>

      {/* 5. Heavy Ingot Transport Supply Cart */}
      <group position={[-0.8, 0, 1.5]} rotation={[0, Math.PI * 0.4, 0]} scale={[1.15, 1.15, 1.15]}>
        <primitive object={cartScene} />
      </group>

      {/* 6. Masterwork Metal Vault Chest */}
      <group position={[1.1, 0, 0.8]} rotation={[0, -Math.PI * 0.2, 0]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={chestScene} />
      </group>

      {/* 7. Industrial Brass Street Lantern */}
      <group position={[-1.6, 0, -0.4]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={lanternScene} />
        <pointLight color="#fbbf24" intensity={2.4} distance={4.5} position={[0, 1.4, 0]} />
      </group>

      {/* 8. Molten Steel Foundry Ambient Glow */}
      <pointLight color="#f59e0b" intensity={2.5} distance={5.5} position={[0.2, 1.0, 0.5]} />
    </group>
  );
}

/**
 * Mastery Expansions Manager
 * Unconditionally consumes the authoritative/preview `expansions` array
 * and physically renders all 3 expansion zones with full props, connections, and lighting.
 */
export default function MasteryExpansions({ expansions = [] }) {
  if (!expansions || expansions.length === 0) return null;

  return (
    <group>
      {expansions.includes('mind_library') && <CelestialLibraryWing />}
      {expansions.includes('body_coliseum') && <GladiatorialColiseumExpansion />}
      {expansions.includes('craft_foundry') && <FoundryExpansion />}
    </group>
  );
}
