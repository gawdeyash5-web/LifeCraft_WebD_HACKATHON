import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CRAFT, TREES, ROCKS, NATURE, CAMPFIRE } from '../assets';
import { WORLD_CONFIG, REALMS, REALM_LEVEL_CONFIG } from '../worldConfig';
import RealmRing from '../effects/RealmRing';

/**
 * Procedural Artisan Workbench & Anvil
 */
function ArtisanWorkbench({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Timber Table Legs */}
      <mesh position={[-0.35, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.5, 0.4]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.5, 0.4]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>

      {/* Table Planks Top */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.07, 0.5]} />
        <meshStandardMaterial color="#784e3a" roughness={0.8} />
      </mesh>

      {/* Blacksmith Anvil on Table */}
      <group position={[-0.15, 0.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.18, 0.16]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.05, 0]} castShadow>
          <coneGeometry args={[0.06, 0.14, 4]} rotation={[0, 0, -Math.PI / 2]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.85} />
        </mesh>
      </group>

      {/* Glowing Hot Metal Tool Ingot on Table */}
      <mesh position={[0.22, 0.58, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.05, 0.08]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Rising Smoke & Ember Particles from Industrial Smelting Chimney (optimized points)
 */
function ChimneyEmbers({ position = [0, 0, 0] }) {
  const pointsRef = useRef();
  const count = 16;
  const [positions, speeds, wobbles] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const wob = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = Math.random() * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      spd[i] = 0.8 + Math.random() * 1.2;
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
      if (pos[i * 3 + 1] > 1.8) pos[i * 3 + 1] = 0;
      pos[i * 3 + 0] += Math.sin(t * 2 + wobbles[i]) * 0.002;
      pos[i * 3 + 2] += Math.cos(t * 2 + wobbles[i]) * 0.002;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#fb923c" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/**
 * Craft Realm Component with 3 Visual Evolution Stages
 * 
 * Level 1: Foundation (River Workshop, watermill with rotating wheel, canal, workbench)
 * Level 2: Developed (Artisan Forge, towering mechanical windmill, supply cart, timber lumber stacks)
 * Level 3: Mastery (Engineering Foundry, blazing smelting chimney, masterwork vault chest, industrial lanterns)
 */
function CraftRealm({ isActive, onSelect, isNight, level = 1 }) {
  const [hovered, setHovered] = useState(false);
  const lvl2Group = useRef();
  const lvl3Group = useRef();
  const windmillRef = useRef();
  const waterRef = useRef();

  // Load production GLBs for all 3 levels
  const millGltf = useGLTF(CRAFT.watermill);
  const windmillGltf = useGLTF(CRAFT.windmill);
  const chimneyGltf = useGLTF(CRAFT.chimney);
  const cartGltf = useGLTF(CRAFT.cart);
  const lumberGltf = useGLTF(CRAFT.lumber);
  const chestGltf = useGLTF(CRAFT.chest);
  const lanternGltf = useGLTF(CRAFT.lantern);

  const treeGltf = useGLTF(TREES.default);
  const oakGltf = useGLTF(TREES.oak);
  const rockGltf = useGLTF(ROCKS.large);
  const stoneGltf = useGLTF(ROCKS.stone);
  const bushGltf = useGLTF(NATURE.bush);

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

  const millScene = useMemo(() => prepareScene(millGltf), [millGltf]);
  const windmillScene = useMemo(() => prepareScene(windmillGltf), [windmillGltf]);
  const chimneyScene = useMemo(() => prepareScene(chimneyGltf), [chimneyGltf]);
  const cartScene = useMemo(() => prepareScene(cartGltf), [cartGltf]);
  const lumberScene = useMemo(() => prepareScene(lumberGltf), [lumberGltf]);
  const chestScene = useMemo(() => prepareScene(chestGltf), [chestGltf]);
  const lanternScene = useMemo(() => prepareScene(lanternGltf), [lanternGltf]);

  const treeScene = useMemo(() => prepareScene(treeGltf), [treeGltf]);
  const oakScene = useMemo(() => prepareScene(oakGltf), [oakGltf]);
  const rockScene = useMemo(() => prepareScene(rockGltf), [rockGltf]);
  const stoneScene = useMemo(() => prepareScene(stoneGltf), [stoneGltf]);
  const bushScene = useMemo(() => prepareScene(bushGltf), [bushGltf]);

  const { color, accentColor, title, position, rotation, scale, yOffset } = WORLD_CONFIG.craft;
  const stageConfig = REALM_LEVEL_CONFIG.craft[level] || REALM_LEVEL_CONFIG.craft[1];

  // Animate dynamic elements (windmill sails, water canal pulse, level scaling)
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Rotate windmill sails on Level 2 & 3
    if (windmillRef.current) {
      windmillRef.current.rotation.y = t * 0.8;
    }

    // Gentle canal water surface ripple
    if (waterRef.current) {
      waterRef.current.position.y = -0.01 + Math.sin(t * 1.5) * 0.005;
    }

    // Smooth level scaling transitions
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

      {/* Clickable Workshop District Group */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(REALMS.CRAFT);
        }}
        scale={hovered ? [1.02, 1.02, 1.02] : [1, 1, 1]}
      >
        {/* ================= LEVEL 1: FOUNDATION ================= */}
        {/* Main Landmark: Artisan Watermill Workshop */}
        <group position={[0, yOffset, 0]} rotation={rotation} scale={scale}>
          <primitive object={millScene} />
          {/* Warm Interior Window / Forge Glow */}
          <pointLight
            color="#fbbf24"
            intensity={isNight ? 3.0 : 1.5}
            distance={5.5}
            position={[0, 0.4, 0]}
          />
        </group>

        {/* Outdoor Blacksmith Artisan Workbench */}
        <ArtisanWorkbench position={[-1.3, 0, 1.0]} rotation={[0, Math.PI * 0.2, 0]} />

        {/* Shaded Timber Mill Trees */}
        <group position={[1.4, 0, -1.8]} scale={[1.5, 1.5, 1.5]}>
          <primitive object={treeScene} />
        </group>
        <group position={[2.2, 0, 0.4]} scale={[1.4, 1.4, 1.4]}>
          <primitive object={oakScene} />
        </group>

        {/* Riverbank Boulders & Stone Blocks */}
        <group position={[-1.6, 0, -1.4]} rotation={[0, 0.4, 0]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={rockScene} />
        </group>
        <group position={[-2.4, 0, 0.5]} rotation={[0, -0.6, 0]} scale={[1.1, 1.1, 1.1]}>
          <primitive object={stoneScene} />
        </group>

        {/* Canal Flora */}
        <group position={[-0.8, 0, 1.8]} scale={[1.3, 1.3, 1.3]}>
          <primitive object={bushScene} />
        </group>

        {/* ================= LEVEL 2: DEVELOPED (ARTISAN FORGE) ================= */}
        <group ref={lvl2Group} scale={[0, 0, 0]}>
          {/* Towering Mechanical Windmill Generator */}
          <group position={[1.8, 0, 2.0]} rotation={[0, -Math.PI * 0.4, 0]} scale={[1.25, 1.25, 1.25]}>
            <primitive object={windmillScene} />
            {level >= 2 && <pointLight color="#f59e0b" intensity={isNight ? 2.2 : 1.1} distance={4.5} position={[0, 1.8, 0]} />}
          </group>

          {/* Material Transport Supply Cart */}
          <group position={[-1.3, 0, 1.8]} rotation={[0, Math.PI * 0.35, 0]} scale={[1.1, 1.1, 1.1]}>
            <primitive object={cartScene} />
          </group>

          {/* Raw Timber Lumber Pile */}
          <group position={[-1.2, 0, -1.6]} rotation={[0, -0.3, 0]} scale={[1.25, 1.25, 1.25]}>
            <primitive object={lumberScene} />
          </group>

          {/* Additional Artisan Trees */}
          <group position={[2.6, 0, 1.8]} scale={[1.3, 1.3, 1.3]}>
            <primitive object={treeScene.clone(true)} />
          </group>
        </group>

        {/* ================= LEVEL 3: MASTERY (ENGINEERING FOUNDRY) ================= */}
        <group ref={lvl3Group} scale={[0, 0, 0]}>
          {/* Blazing Smelting Furnace Chimney */}
          <group position={[1.9, 0, -1.4]} rotation={[0, Math.PI * 0.25, 0]} scale={[1.5, 1.5, 1.5]}>
            <primitive object={chimneyScene} />
            {/* Blazing furnace fire light */}
            {level >= 3 && <pointLight color="#ea580c" intensity={isNight ? 3.5 : 2.0} distance={5.0} position={[0, 0.8, 0]} />}
            {/* Rising chimney smoke motes */}
            {level >= 3 && <ChimneyEmbers position={[0, 1.6, 0]} />}
          </group>

          {/* Masterwork Brass Treasure Vault Chest */}
          <group position={[-0.55, 0, -1.9]} rotation={[0, Math.PI * 0.15, 0]} scale={[1.3, 1.3, 1.3]}>
            <primitive object={chestScene} />
            {level >= 3 && <pointLight color="#fbbf24" intensity={isNight ? 1.8 : 0.9} distance={3.0} position={[0, 0.4, 0]} />}
          </group>

          {/* Dual Brass Industrial Street Lanterns */}
          <group position={[-2.1, 0, 0.8]} scale={[1.2, 1.2, 1.2]}>
            <primitive object={lanternScene} />
            {level >= 3 && <pointLight color="#fbbf24" intensity={isNight ? 2.4 : 1.0} distance={4.0} position={[0, 1.4, 0]} />}
          </group>
          <group position={[0.4, 0, 2.3]} scale={[1.2, 1.2, 1.2]}>
            <primitive object={lanternScene.clone(true)} />
            {level >= 3 && <pointLight color="#fbbf24" intensity={isNight ? 2.4 : 1.0} distance={4.0} position={[0, 1.4, 0]} />}
          </group>

          {/* Heavy Granite Foundry Boulders */}
          <group position={[2.8, 0, -0.6]} scale={[1.4, 1.4, 1.4]}>
            <primitive object={rockScene.clone(true)} />
          </group>
        </group>
      </group>
    </group>
  );
}

const MemoizedCraftRealm = React.memo(CraftRealm);
export default MemoizedCraftRealm;

useGLTF.preload(CRAFT.watermill);
useGLTF.preload(CRAFT.windmill);
useGLTF.preload(CRAFT.chimney);
useGLTF.preload(CRAFT.cart);
useGLTF.preload(CRAFT.lumber);
useGLTF.preload(CRAFT.chest);
useGLTF.preload(CRAFT.lantern);
