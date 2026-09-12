import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { BODY, TREES, ROCKS, NATURE, CAMPFIRE } from '../assets';
import { WORLD_CONFIG, REALMS, REALM_LEVEL_CONFIG } from '../worldConfig';
import RealmRing from '../effects/RealmRing';

/**
 * Body Realm Component with 3 Visual Evolution Stages
 * 
 * Level 1: Foundation (Training Yard, pavilion, single archery target, stone slabs)
 * Level 2: Developed (Combat Dojo, elevated sparring platform, calisthenics ladder, arena fence, dual targets)
 * Level 3: Mastery (Grand Coliseum, athletic basecamp pavilion tent, pillars of discipline, victory banners)
 */
export default function BodyRealm({ isActive, onSelect, isNight, level = 1 }) {
  const [hovered, setHovered] = useState(false);
  const lvl2Group = useRef();
  const lvl3Group = useRef();

  // Load production GLBs for all 3 levels
  const structureGltf = useGLTF(BODY.structure);
  const targetGltf = useGLTF(BODY.target);
  const platformGltf = useGLTF(BODY.platform);
  const ladderGltf = useGLTF(BODY.ladder);
  const fenceGltf = useGLTF(BODY.fence);
  const tentGltf = useGLTF(BODY.tent);
  const flagGltf = useGLTF(BODY.flag);
  const pillarGltf = useGLTF(BODY.pillar);

  const oakGltf = useGLTF(TREES.oak);
  const pineGltf = useGLTF(TREES.pine);
  const stoneGltf = useGLTF(ROCKS.stone);
  const rockGltf = useGLTF(ROCKS.large);
  const grassGltf = useGLTF(NATURE.grass);
  const logsGltf = useGLTF(CAMPFIRE.logs);

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

  const structureScene = useMemo(() => prepareScene(structureGltf), [structureGltf]);
  const targetScene = useMemo(() => prepareScene(targetGltf), [targetGltf]);
  const platformScene = useMemo(() => prepareScene(platformGltf), [platformGltf]);
  const ladderScene = useMemo(() => prepareScene(ladderGltf), [ladderGltf]);
  const fenceScene = useMemo(() => prepareScene(fenceGltf), [fenceGltf]);
  const tentScene = useMemo(() => prepareScene(tentGltf), [tentGltf]);
  const flagScene = useMemo(() => prepareScene(flagGltf), [flagGltf]);
  const pillarScene = useMemo(() => prepareScene(pillarGltf), [pillarGltf]);

  const oakScene = useMemo(() => prepareScene(oakGltf), [oakGltf]);
  const pineScene = useMemo(() => prepareScene(pineGltf), [pineGltf]);
  const stoneScene = useMemo(() => prepareScene(stoneGltf), [stoneGltf]);
  const rockScene = useMemo(() => prepareScene(rockGltf), [rockGltf]);
  const grassScene = useMemo(() => prepareScene(grassGltf), [grassGltf]);
  const logsScene = useMemo(() => prepareScene(logsGltf), [logsGltf]);

  const { color, accentColor, title, position } = WORLD_CONFIG.body;
  const stageConfig = REALM_LEVEL_CONFIG.body[level] || REALM_LEVEL_CONFIG.body[1];

  // Smooth scale-in / scale-out of Level 2 and Level 3 groups
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

      {/* Clickable Training Yard Group */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(REALMS.BODY);
        }}
        scale={hovered ? [1.02, 1.02, 1.02] : [1, 1, 1]}
      >
        {/* ================= LEVEL 1: FOUNDATION ================= */}
        {/* Timber Training Pavilion */}
        <group
          position={[-0.2, 0, 0.3]}
          rotation={WORLD_CONFIG.body.structure.rotation}
          scale={WORLD_CONFIG.body.structure.scale}
        >
          <primitive object={structureScene} />
          <pointLight
            color="#34d399"
            intensity={isNight ? 2.4 : 1.2}
            distance={5.5}
            position={[0, 1.5, 0]}
          />
        </group>

        {/* Primary Archery Training Target */}
        <group
          position={[1.8, 0, -0.9]}
          rotation={WORLD_CONFIG.body.target.rotation}
          scale={WORLD_CONFIG.body.target.scale}
        >
          <primitive object={targetScene} />
        </group>

        {/* Stone Barbell Weight-Lifting Platform */}
        <group position={[1.4, 0, 0.8]} rotation={[0, 0.4, 0]}>
          <mesh position={[-0.45, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.1, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          <mesh position={[0.45, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.1, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.05, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Sprint Obstacle Logs */}
        <group position={[0.5, 0, 1.8]} rotation={[0, -0.4, 0]} scale={[1.2, 1.2, 1.2]}>
          <primitive object={logsScene} />
        </group>

        {/* Heavy Strength Boulders & Granite Slabs */}
        <group position={[-1.6, 0, -1.2]} rotation={[0, 0.6, 0]} scale={[1.2, 1.0, 1.2]}>
          <primitive object={stoneScene} />
        </group>
        <group position={[-2.2, 0, 0.6]} rotation={[0, 1.2, 0]} scale={[1.4, 1.4, 1.4]}>
          <primitive object={rockScene} />
        </group>

        {/* Framing Broad Canopy Oak & Pines */}
        <group position={[-1.8, 0, -1.6]} scale={[1.7, 1.7, 1.7]}>
          <primitive object={oakScene} />
        </group>
        <group position={[2.0, 0, -1.8]} scale={[1.5, 1.5, 1.5]}>
          <primitive object={pineScene} />
        </group>

        {/* ================= LEVEL 2: DEVELOPED (COMBAT DOJO) ================= */}
        <group ref={lvl2Group} scale={[0, 0, 0]}>
          {/* Elevated Timber Sparring Dojo Ring Platform */}
          <group position={[0.8, 0.04, -0.4]} rotation={[0, -Math.PI * 0.15, 0]} scale={[1.3, 1.0, 1.3]}>
            <primitive object={platformScene} />
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[1.5, 1.5]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.8} />
            </mesh>
          </group>

          {/* Calisthenics Obstacle Course Climbing Ladder */}
          <group position={[-0.8, 0, -1.8]} rotation={[0, Math.PI * 0.25, 0]} scale={[1.3, 1.3, 1.3]}>
            <primitive object={ladderScene} />
          </group>

          {/* Arena Wooden Perimeter Fence */}
          <group position={[-0.6, 0, 2.2]} rotation={[0, -Math.PI * 0.2, 0]} scale={[1.4, 1.2, 1.4]}>
            <primitive object={fenceScene} />
          </group>
          <group position={[1.4, 0, 2.1]} rotation={[0, Math.PI * 0.1, 0]} scale={[1.3, 1.2, 1.3]}>
            <primitive object={fenceScene.clone(true)} />
          </group>

          {/* Secondary Archery Target Dummy (Practice Lane) */}
          <group position={[2.4, 0, 0.2]} rotation={[0, -Math.PI * 0.45, 0]} scale={[1.2, 1.2, 1.2]}>
            <primitive object={targetScene.clone(true)} />
          </group>
        </group>

        {/* ================= LEVEL 3: MASTERY (GRAND COLISEUM) ================= */}
        <group ref={lvl3Group} scale={[0, 0, 0]}>
          {/* Athletic Basecamp Pavilion Tent */}
          <group position={[-1.8, 0, 1.6]} rotation={[0, Math.PI * 0.4, 0]} scale={[1.35, 1.35, 1.35]}>
            <primitive object={tentScene} />
            <pointLight color="#f59e0b" intensity={isNight ? 2.5 : 1.2} distance={4.5} position={[0, 1.2, 0]} />
          </group>

          {/* Monumental Stone Pillars of Strength & Discipline */}
          <group position={[-0.4, 0, 2.6]} scale={[1.3, 1.4, 1.3]}>
            <primitive object={pillarScene} />
          </group>
          <group position={[2.2, 0, 1.8]} scale={[1.3, 1.4, 1.3]}>
            <primitive object={pillarScene.clone(true)} />
          </group>

          {/* Champion Victory Banners Fluttering Over Ring */}
          <group position={[0.2, 0, -1.6]} rotation={[0, Math.PI * 0.1, 0]} scale={[1.3, 1.4, 1.3]}>
            <primitive object={flagScene} />
          </group>
          <group position={[2.1, 0, -1.2]} rotation={[0, -Math.PI * 0.2, 0]} scale={[1.3, 1.4, 1.3]}>
            <primitive object={flagScene.clone(true)} />
          </group>

          {/* Third Advanced Target Dummy */}
          <group position={[2.6, 0, -0.6]} rotation={[0, -Math.PI * 0.6, 0]} scale={[1.35, 1.35, 1.35]}>
            <primitive object={targetScene.clone(true)} />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(BODY.structure);
useGLTF.preload(BODY.target);
useGLTF.preload(BODY.platform);
useGLTF.preload(BODY.ladder);
useGLTF.preload(BODY.fence);
useGLTF.preload(BODY.tent);
useGLTF.preload(BODY.flag);
useGLTF.preload(BODY.pillar);
