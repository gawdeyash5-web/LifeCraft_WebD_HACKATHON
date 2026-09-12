import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MIND, TREES, ROCKS, NATURE } from '../assets';
import { WORLD_CONFIG, REALMS, REALM_LEVEL_CONFIG } from '../worldConfig';
import RealmRing from '../effects/RealmRing';

/**
 * Procedural Open Tome on Stone Study Pedestal
 */
function StudyLectern({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) {
  const crystalRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.position.y = 0.95 + Math.sin(t * 3) * 0.05;
      crystalRef.current.rotation.y = t * 1.5;
    }
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Stone Pedestal Column */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.8, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Lectern Slanted Tabletop */}
      <mesh position={[0, 0.82, 0]} rotation={[Math.PI * 0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.06, 0.45]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Open Tome (Left & Right Pages) */}
      <group position={[0, 0.87, -0.02]} rotation={[Math.PI * 0.15, 0, 0]}>
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[0.22, 0.02, 0.3]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.22, 0.02, 0.3]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
      </group>

      {/* Floating Arcane Knowledge Shard */}
      <mesh ref={crystalRef} position={[0, 1.1, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={1.8}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

/**
 * Floating Arcane Crystals orbiting around the Citadel / Scholar Tower
 */
function ArcaneCrystals({ count = 3, intensity = 2.0 }) {
  const gRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (gRef.current) {
      gRef.current.rotation.y = t * 0.5;
    }
  });

  const crystals = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.4 + (i % 2) * 0.4;
      const y = 2.0 + (i % 3) * 0.7;
      list.push({ angle, radius, y, size: 0.12 + (i % 2) * 0.05 });
    }
    return list;
  }, [count]);

  return (
    <group ref={gRef}>
      {crystals.map((c, i) => (
        <group
          key={i}
          position={[Math.cos(c.angle) * c.radius, c.y, Math.sin(c.angle) * c.radius]}
        >
          <mesh>
            <octahedronGeometry args={[c.size, 0]} />
            <meshStandardMaterial
              color="#c084fc"
              emissive="#9333ea"
              emissiveIntensity={intensity}
              roughness={0.1}
            />
          </mesh>
          <pointLight color="#a855f7" intensity={0.6} distance={3.0} />
        </group>
      ))}
    </group>
  );
}

/**
 * Mind Realm Component with 3 Visual Evolution Stages
 * 
 * Level 1: Foundation (Scholar Alcove, lone tower, study lectern)
 * Level 2: Developed (Arcane Academy, secondary archive tower, arched entry colonnade, obelisk)
 * Level 3: Mastery (Knowledge Citadel, crowning grand spire, reflective scholar fountain, collegiate ramparts)
 */
export default function MindRealm({ isActive, onSelect, isNight, level = 1 }) {
  const [hovered, setHovered] = useState(false);
  const lvl2Group = useRef();
  const lvl3Group = useRef();

  // Load production GLBs for all 3 levels
  const towerGltf = useGLTF(MIND.tower);
  const archiveGltf = useGLTF(MIND.archiveTower);
  const archGltf = useGLTF(MIND.archColonnade);
  const obeliskGltf = useGLTF(MIND.obelisk);
  const spireGltf = useGLTF(MIND.citadelSpire);
  const rampartGltf = useGLTF(MIND.rampart);
  const fountainGltf = useGLTF(MIND.fountain);

  const pineGltf = useGLTF(TREES.pine);
  const rockGltf = useGLTF(ROCKS.large);
  const stoneGltf = useGLTF(ROCKS.stone);
  const bushGltf = useGLTF(NATURE.bush);
  const flowerGltf = useGLTF(NATURE.flower);

  // Helper to clone scenes with shadows
  const prepareScene = (gltf) => {
    const c = gltf.scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  };

  const towerScene = useMemo(() => prepareScene(towerGltf), [towerGltf]);
  const archiveScene = useMemo(() => prepareScene(archiveGltf), [archiveGltf]);
  const archScene = useMemo(() => prepareScene(archGltf), [archGltf]);
  const obeliskScene = useMemo(() => prepareScene(obeliskGltf), [obeliskGltf]);
  const spireScene = useMemo(() => prepareScene(spireGltf), [spireGltf]);
  const rampartScene = useMemo(() => prepareScene(rampartGltf), [rampartGltf]);
  const fountainScene = useMemo(() => prepareScene(fountainGltf), [fountainGltf]);

  const pineScene = useMemo(() => prepareScene(pineGltf), [pineGltf]);
  const rockScene = useMemo(() => prepareScene(rockGltf), [rockGltf]);
  const stoneScene = useMemo(() => prepareScene(stoneGltf), [stoneGltf]);
  const bushScene = useMemo(() => prepareScene(bushGltf), [bushGltf]);
  const flowerScene = useMemo(() => prepareScene(flowerGltf), [flowerGltf]);

  const { position, rotation, scale, color, accentColor, title } = WORLD_CONFIG.mind;
  const stageConfig = REALM_LEVEL_CONFIG.mind[level] || REALM_LEVEL_CONFIG.mind[1];

  // Smoothly animate scale-in and scale-out of Level 2 and Level 3 structures
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetLvl2 = level >= 2 ? 1.0 : 0.0;
    const targetLvl3 = level >= 3 ? 1.0 : 0.0;

    if (lvl2Group.current) {
      const s = THREE.MathUtils.damp(lvl2Group.current.scale.x, targetLvl2, 6.0, dt);
      lvl2Group.current.scale.set(s, s, s);
      lvl2Group.current.visible = s > 0.01;
    }
    if (lvl3Group.current) {
      const s = THREE.MathUtils.damp(lvl3Group.current.scale.x, targetLvl3, 6.0, dt);
      lvl3Group.current.scale.set(s, s, s);
      lvl3Group.current.visible = s > 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Waypoint Base Ring & Signage with Stage Subheading */}
      <RealmRing
        radius={2.2}
        color={color}
        accentColor={accentColor}
        isActive={isActive}
        isHovered={hovered}
        title={title}
        subheading={stageConfig.stage}
        level={level}
        isNight={isNight}
      />

      {/* Clickable Scholar District Group */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(REALMS.MIND);
        }}
        scale={hovered ? [1.02, 1.02, 1.02] : [1, 1, 1]}
      >
        {/* ================= LEVEL 1: FOUNDATION ================= */}
        {/* Primary Landmark: Castle Scholar Tower */}
        <group rotation={rotation} scale={scale}>
          <primitive object={towerScene} />
          <pointLight
            color="#fbbf24"
            intensity={isNight ? 2.8 : 1.4}
            distance={5.5}
            position={[0, 1.6, 0]}
          />
        </group>

        {/* Floating Arcane Knowledge Crystals */}
        <ArcaneCrystals count={stageConfig.crystalCount} intensity={isNight ? 2.8 : 1.8} />

        {/* Outdoor Study Lectern with Illuminated Open Tome */}
        <StudyLectern position={[1.1, 0, 1.0]} />

        {/* Stone Meditation / Study Benches */}
        <group position={[0.7, 0, 1.8]} rotation={[0, -0.4, 0]} scale={[1.1, 0.8, 1.1]}>
          <primitive object={stoneScene} />
        </group>
        <group position={[-1.2, 0, 1.6]} rotation={[0, 0.6, 0]} scale={[1.0, 0.8, 1.0]}>
          <primitive object={stoneScene.clone(true)} />
        </group>

        {/* Framing Ancient Pines */}
        <group position={[-1.8, 0, -1.2]} scale={[1.6, 1.6, 1.6]}>
          <primitive object={pineScene} />
        </group>
        <group position={[1.8, 0, -1.5]} scale={[1.4, 1.4, 1.4]}>
          <primitive object={pineScene.clone(true)} />
        </group>

        {/* Ancient Wisdom Boulders */}
        <group position={[-2.2, 0, 0.6]} rotation={[0, 0.8, 0]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={rockScene} />
        </group>

        {/* Shrubbery & Lavender Gardens */}
        <group position={[-1.2, 0, 0.9]} scale={[1.3, 1.3, 1.3]}>
          <primitive object={bushScene} />
        </group>
        <group position={[1.5, 0, 0.8]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={bushScene.clone(true)} />
        </group>
        <group position={[0.3, 0, 1.6]} scale={[1.6, 1.6, 1.6]}>
          <primitive object={flowerScene} />
        </group>

        {/* ================= LEVEL 2: DEVELOPED (ARCANE ACADEMY) ================= */}
        <group ref={lvl2Group} scale={[0, 0, 0]}>
          {/* Secondary Scholar Archive Tower */}
          <group position={[-1.75, 0, 0.85]} rotation={[0, 0.35, 0]} scale={[1.35, 1.35, 1.35]}>
            <primitive object={archiveScene} />
            <pointLight color="#fbbf24" intensity={isNight ? 2.2 : 1.2} distance={4.5} position={[0, 1.4, 0]} />
          </group>

          {/* Arched Stone Gateway Colonnade */}
          <group position={[0.55, 0, 1.85]} rotation={[0, -0.65, 0]} scale={[1.25, 1.25, 1.25]}>
            <primitive object={archScene} />
          </group>

          {/* Ancient Arcane Knowledge Obelisk */}
          <group position={[1.75, 0, -0.6]} rotation={[0, -0.2, 0]} scale={[1.15, 1.35, 1.15]}>
            <primitive object={obeliskScene} />
            <pointLight color="#c084fc" intensity={isNight ? 2.0 : 1.0} distance={4.0} position={[0, 1.5, 0]} />
          </group>

          {/* Secondary Courtyard Study Lectern */}
          <StudyLectern position={[-0.8, 0, 1.9]} rotation={[0, 0.8, 0]} scale={[0.85, 0.85, 0.85]} />

          {/* Additional Lush Foliage for Academy Garden */}
          <group position={[-2.4, 0, -0.4]} scale={[1.4, 1.4, 1.4]}>
            <primitive object={pineScene.clone(true)} />
          </group>
          <group position={[1.4, 0, 2.0]} scale={[1.4, 1.4, 1.4]}>
            <primitive object={flowerScene.clone(true)} />
          </group>
        </group>

        {/* ================= LEVEL 3: MASTERY (KNOWLEDGE CITADEL) ================= */}
        <group ref={lvl3Group} scale={[0, 0, 0]}>
          {/* Majestic Octagonal Grand Spire capping Central Tower */}
          <group position={[0, 3.75, 0]} rotation={rotation} scale={[1.85, 1.85, 1.85]}>
            <primitive object={spireScene} />
            <pointLight color="#e0e7ff" intensity={isNight ? 3.2 : 1.8} distance={7.0} position={[0, 1.2, 0]} />
          </group>

          {/* Fortified Collegiate Ramparts unifying the Citadel */}
          <group position={[-0.85, 0, 1.7]} rotation={[0, 0.45, 0]} scale={[1.35, 1.25, 1.35]}>
            <primitive object={rampartScene} />
          </group>

          {/* Third Citadel Spire Wing */}
          <group position={[1.85, 0, -1.35]} rotation={[0, -0.5, 0]} scale={[1.25, 1.25, 1.25]}>
            <primitive object={archiveScene.clone(true)} />
            <pointLight color="#fbbf24" intensity={isNight ? 2.0 : 1.0} distance={4.0} position={[0, 1.2, 0]} />
          </group>

          {/* Sacred Stone Reflection Fountain in Central Courtyard */}
          <group position={[0.2, 0, 1.25]} scale={[0.85, 0.85, 0.85]}>
            <primitive object={fountainScene} />
            {/* Glowing arcane fountain water light */}
            <pointLight color="#60a5fa" intensity={isNight ? 2.5 : 1.2} distance={4.5} position={[0, 0.5, 0]} />
          </group>

          {/* Expanded Citadel Boundary Boulders & Blossoms */}
          <group position={[-2.6, 0, 1.4]} scale={[1.5, 1.5, 1.5]}>
            <primitive object={rockScene.clone(true)} />
          </group>
          <group position={[2.2, 0, 1.2]} scale={[1.6, 1.6, 1.6]}>
            <primitive object={flowerScene.clone(true)} />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MIND.tower);
useGLTF.preload(MIND.archiveTower);
useGLTF.preload(MIND.archColonnade);
useGLTF.preload(MIND.obelisk);
useGLTF.preload(MIND.citadelSpire);
useGLTF.preload(MIND.rampart);
useGLTF.preload(MIND.fountain);
