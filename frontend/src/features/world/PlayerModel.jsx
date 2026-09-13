import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { PLAYER, SKINS, PETS } from './assets';
import { WORLD_CONFIG, REALMS, SUB_ISLAND_CONFIG } from './worldConfig';

/**
 * Animated Character Visual Mesh with Smooth Idle/Walk Transitions
 */
function CharacterVisual({ skinUrl, isMoving }) {
  const meshRef = useRef();
  const currentAnim = useRef('idle');
  const { scene, animations } = useGLTF(skinUrl);
  const { actions, names } = useAnimations(animations, meshRef);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.map) {
            child.material.map.needsUpdate = true;
          }
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!actions) return;
    const idleAction = actions['idle'] || actions[names?.[0]];
    if (idleAction) {
      idleAction.reset().fadeIn(0.2).play();
      currentAnim.current = 'idle';
    }
    return () => {
      if (actions) {
        Object.values(actions).forEach((a) => a?.stop());
      }
    };
  }, [actions, names, skinUrl]);

  useEffect(() => {
    if (!actions) return;
    if (isMoving && currentAnim.current !== 'walk') {
      const walkAction = actions['walk'] || actions['sprint'];
      const idleAction = actions['idle'];
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play();
        if (idleAction) idleAction.fadeOut(0.2);
        currentAnim.current = 'walk';
      }
    } else if (!isMoving && currentAnim.current !== 'idle') {
      const walkAction = actions['walk'] || actions['sprint'];
      const idleAction = actions['idle'];
      if (idleAction) {
        idleAction.reset().fadeIn(0.3).play();
        if (walkAction) walkAction.fadeOut(0.3);
        currentAnim.current = 'idle';
      }
    }
  }, [isMoving, actions]);

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Animated Companion Pet
 */
function CompanionPet({ petUrl, isMoving }) {
  const petRef = useRef();
  const currentAnim = useRef('idle');
  const { scene, animations } = useGLTF(petUrl);
  const { actions, names } = useAnimations(animations, petRef);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.map) {
            child.material.map.needsUpdate = true;
          }
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!actions) return;
    const idleAction = actions['idle'] || actions[names?.[0]];
    if (idleAction) {
      idleAction.reset().fadeIn(0.2).play();
      currentAnim.current = 'idle';
    }
    return () => {
      if (actions) {
        Object.values(actions).forEach((a) => a?.stop());
      }
    };
  }, [actions, names, petUrl]);

  useEffect(() => {
    if (!actions) return;
    if (isMoving && currentAnim.current !== 'walk') {
      const walkAction = actions['run'] || actions['walk'];
      const idleAction = actions['idle'];
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play();
        if (idleAction) idleAction.fadeOut(0.2);
        currentAnim.current = 'walk';
      }
    } else if (!isMoving && currentAnim.current !== 'idle') {
      const walkAction = actions['run'] || actions['walk'];
      const idleAction = actions['idle'];
      if (idleAction) {
        idleAction.reset().fadeIn(0.3).play();
        if (walkAction) walkAction.fadeOut(0.3);
        currentAnim.current = 'idle';
      }
    }
  }, [isMoving, actions]);

  // Subtle pet bounce / position offset
  useFrame((state) => {
    if (!petRef.current) return;
    const t = state.clock.elapsedTime;
    if (!isMoving) {
      petRef.current.position.y = Math.sin(t * 3.5) * 0.02;
    }
  });

  return (
    <group
      ref={petRef}
      position={[0.65, 0, -0.35]}
      rotation={[0, -0.35, 0]}
      scale={0.52}
    >
      <primitive object={scene} />
    </group>
  );
}

/**
 * Compute multi-waypoint navigation route between realms and sub-islands
 * ensuring the player naturally follows paths and crosses bridges without
 * clipping through void, cliffs, or structures.
 */
function buildNavigationPath(currentVec, destinationRegion) {
  const wp = WORLD_CONFIG.waypoints;
  const curX = currentVec.x;
  const curZ = currentVec.z;

  // 1. Identify which zone the player currently occupies
  let currentZone = 'center';
  if (
    Math.hypot(curX - wp.mind_library[0], curZ - wp.mind_library[2]) < 3.2 ||
    Math.hypot(curX - wp.mind_bridge_end[0], curZ - wp.mind_bridge_end[2]) < 1.5
  ) {
    currentZone = 'mind_library';
  } else if (
    Math.hypot(curX - wp.body_coliseum[0], curZ - wp.body_coliseum[2]) < 3.2 ||
    Math.hypot(curX - wp.body_bridge_end[0], curZ - wp.body_bridge_end[2]) < 1.5
  ) {
    currentZone = 'body_coliseum';
  } else if (
    Math.hypot(curX - wp.craft_foundry[0], curZ - wp.craft_foundry[2]) < 3.2 ||
    Math.hypot(curX - wp.craft_bridge_end[0], curZ - wp.craft_bridge_end[2]) < 1.5
  ) {
    currentZone = 'craft_foundry';
  } else if (Math.hypot(curX - wp.mind[0], curZ - wp.mind[2]) < 3.0) {
    currentZone = 'mind';
  } else if (Math.hypot(curX - wp.body[0], curZ - wp.body[2]) < 3.0) {
    currentZone = 'body';
  } else if (Math.hypot(curX - wp.craft[0], curZ - wp.craft[2]) < 3.0) {
    currentZone = 'craft';
  }

  // 2. Normalize target destination
  const target = destinationRegion || 'center';
  if (currentZone === target) {
    return [new THREE.Vector3(...(wp[target] || wp.center))];
  }

  const path = [];

  // 3. Step A: Exit current sub-island if player is on one
  if (currentZone === 'mind_library') {
    path.push(new THREE.Vector3(...wp.mind_bridge_end));
    path.push(new THREE.Vector3(...wp.mind_bridge_mid));
    path.push(new THREE.Vector3(...wp.mind_bridge_start));
    path.push(new THREE.Vector3(...wp.mind));
    currentZone = 'mind';
  } else if (currentZone === 'body_coliseum') {
    path.push(new THREE.Vector3(...wp.body_bridge_end));
    path.push(new THREE.Vector3(...wp.body_bridge_mid));
    path.push(new THREE.Vector3(...wp.body_bridge_start));
    path.push(new THREE.Vector3(...wp.body));
    currentZone = 'body';
  } else if (currentZone === 'craft_foundry') {
    path.push(new THREE.Vector3(...wp.craft_bridge_end));
    path.push(new THREE.Vector3(...wp.craft_bridge_mid));
    path.push(new THREE.Vector3(...wp.craft_bridge_start));
    path.push(new THREE.Vector3(...wp.craft));
    currentZone = 'craft';
  }

  // If destination is reached after exiting sub-island
  if (target === currentZone) {
    return path;
  }

  // 4. Step B: Main island hub transitions
  if (currentZone !== 'center' && target !== currentZone) {
    const targetMainZone = target.startsWith('mind')
      ? 'mind'
      : target.startsWith('body')
      ? 'body'
      : target.startsWith('craft')
      ? 'craft'
      : 'center';
    if (currentZone !== targetMainZone) {
      path.push(new THREE.Vector3(...wp.center));
      currentZone = 'center';
    }
  }

  // 5. Step C: Main island destination
  if (target === 'center') {
    path.push(new THREE.Vector3(...wp.center));
    return path;
  }
  if (target === 'mind') {
    path.push(new THREE.Vector3(...wp.mind));
    return path;
  }
  if (target === 'body') {
    path.push(new THREE.Vector3(...wp.body));
    return path;
  }
  if (target === 'craft') {
    path.push(new THREE.Vector3(...wp.craft));
    return path;
  }

  // 6. Step D: Cross bridge to target sub-island
  if (target === 'mind_library') {
    if (currentZone === 'center') path.push(new THREE.Vector3(...wp.mind));
    path.push(new THREE.Vector3(...wp.mind_bridge_start));
    path.push(new THREE.Vector3(...wp.mind_bridge_mid));
    path.push(new THREE.Vector3(...wp.mind_bridge_end));
    path.push(new THREE.Vector3(...wp.mind_library));
    return path;
  }

  if (target === 'body_coliseum') {
    if (currentZone === 'center') path.push(new THREE.Vector3(...wp.body));
    path.push(new THREE.Vector3(...wp.body_bridge_start));
    path.push(new THREE.Vector3(...wp.body_bridge_mid));
    path.push(new THREE.Vector3(...wp.body_bridge_end));
    path.push(new THREE.Vector3(...wp.body_coliseum));
    return path;
  }

  if (target === 'craft_foundry') {
    if (currentZone === 'center') path.push(new THREE.Vector3(...wp.craft));
    path.push(new THREE.Vector3(...wp.craft_bridge_start));
    path.push(new THREE.Vector3(...wp.craft_bridge_mid));
    path.push(new THREE.Vector3(...wp.craft_bridge_end));
    path.push(new THREE.Vector3(...wp.craft_foundry));
    return path;
  }

  return path;
}

/**
 * Autonomous Living Player Character with Dynamic Skin & Companion Pet
 */
function PlayerModel({
  activeRegion,
  equippedSkin = null,
  equippedPet = null,
}) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...WORLD_CONFIG.waypoints.center));
  const [isMoving, setIsMoving] = React.useState(false);

  const pathQueue = useRef([]);
  const pathIndex = useRef(0);

  // Determine skin and pet GLB paths
  const resolvedSkinUrl = useMemo(() => {
    if (equippedSkin && SKINS[equippedSkin]) return SKINS[equippedSkin];
    return PLAYER;
  }, [equippedSkin]);

  const resolvedPetUrl = useMemo(() => {
    if (equippedPet && PETS[equippedPet]) return PETS[equippedPet];
    return null;
  }, [equippedPet]);

  // When activeRegion changes, compute continuous waypoint navigation path
  useEffect(() => {
    const route = buildNavigationPath(currentPos.current, activeRegion);
    pathQueue.current = route;
    pathIndex.current = 0;
  }, [activeRegion]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Clamp delta to avoid teleportation during lag spikes
    const dt = Math.min(delta, 0.05);

    const path = pathQueue.current;
    const currentWaypoint = path[pathIndex.current];

    if (currentWaypoint) {
      const dx = currentWaypoint.x - currentPos.current.x;
      const dz = currentWaypoint.z - currentPos.current.z;
      const dist = Math.hypot(dx, dz);

      const isFinalWaypoint = pathIndex.current === path.length - 1;
      const arrivalThreshold = isFinalWaypoint ? 0.12 : 0.45;

      if (dist < arrivalThreshold) {
        if (!isFinalWaypoint) {
          pathIndex.current += 1;
        } else {
          // Arrived at final destination
          if (isMoving) setIsMoving(false);
        }
      } else {
        if (!isMoving) setIsMoving(true);

        // Movement with smooth deceleration curve near destination
        const baseSpeed = WORLD_CONFIG.player.walkSpeed || 3.4;
        const speedFactor = isFinalWaypoint ? Math.min(1.0, Math.max(0.4, dist / 1.4)) : 1.0;
        const step = Math.min(baseSpeed * speedFactor * dt, dist);

        currentPos.current.x += (dx / dist) * step;
        currentPos.current.z += (dz / dist) * step;
        // Smoothly adjust y elevation across bridges and sub-island terraces
        currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, currentWaypoint.y, 8.0, dt);

        // Smooth rotation towards movement direction
        const walkAngle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          walkAngle,
          9.0,
          dt
        );
      }
    } else {
      if (isMoving) setIsMoving(false);

      // Stationary: subtle breathing oscillation
      const t = state.clock.elapsedTime;
      currentPos.current.y += Math.sin(t * 2.5) * 0.0006;

      // Rotate to face landmark or forward
      let settledAngle = WORLD_CONFIG.player.rotation[1];
      if (activeRegion === REALMS.MIND) settledAngle = Math.atan2(-6.2 - (-4.6), -4.5 - (-3.2));
      else if (activeRegion === REALMS.BODY) settledAngle = Math.atan2(-6.0 - (-4.4), 4.5 - 3.2);
      else if (activeRegion === REALMS.CRAFT) settledAngle = Math.atan2(6.2 - 4.8, 0.4 - 0.4);
      else if (activeRegion === 'mind_library') settledAngle = SUB_ISLAND_CONFIG.mind.settledAngle;
      else if (activeRegion === 'body_coliseum') settledAngle = SUB_ISLAND_CONFIG.body.settledAngle;
      else if (activeRegion === 'craft_foundry') settledAngle = SUB_ISLAND_CONFIG.craft.settledAngle;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        settledAngle,
        4.5,
        dt
      );
    }

    // Update group position
    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      currentPos.current.z
    );
  });

  return (
    <group
      ref={groupRef}
      scale={WORLD_CONFIG.player.scale}
      position={[currentPos.current.x, currentPos.current.y, currentPos.current.z]}
    >
      <Suspense fallback={null}>
        <CharacterVisual
          key={resolvedSkinUrl}
          skinUrl={resolvedSkinUrl}
          isMoving={isMoving}
        />
        {resolvedPetUrl && (
          <CompanionPet
            key={resolvedPetUrl}
            petUrl={resolvedPetUrl}
            isMoving={isMoving}
          />
        )}
      </Suspense>
    </group>
  );
}

const MemoizedPlayerModel = React.memo(PlayerModel);
export default MemoizedPlayerModel;

// Preload only default starter character; cosmetics stream on-demand
useGLTF.preload(PLAYER);
