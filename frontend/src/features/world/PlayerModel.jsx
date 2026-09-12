import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { PLAYER, SKINS, PETS } from './assets';
import { WORLD_CONFIG, REALMS } from './worldConfig';

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
 * Autonomous Living Player Character with Dynamic Skin & Companion Pet
 */
export default function PlayerModel({
  activeRegion,
  equippedSkin = null,
  equippedPet = null,
}) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...WORLD_CONFIG.waypoints.center));
  const [isMoving, setIsMoving] = React.useState(false);

  // Determine skin and pet GLB paths
  const resolvedSkinUrl = useMemo(() => {
    if (equippedSkin && SKINS[equippedSkin]) return SKINS[equippedSkin];
    return PLAYER;
  }, [equippedSkin]);

  const resolvedPetUrl = useMemo(() => {
    if (equippedPet && PETS[equippedPet]) return PETS[equippedPet];
    return null;
  }, [equippedPet]);

  // Determine current destination waypoint
  const targetWaypoint = useMemo(() => {
    if (activeRegion === REALMS.MIND) return new THREE.Vector3(...WORLD_CONFIG.waypoints.mind);
    if (activeRegion === REALMS.BODY) return new THREE.Vector3(...WORLD_CONFIG.waypoints.body);
    if (activeRegion === REALMS.CRAFT) return new THREE.Vector3(...WORLD_CONFIG.waypoints.craft);
    return new THREE.Vector3(...WORLD_CONFIG.waypoints.center);
  }, [activeRegion]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Clamp delta to avoid teleportation during lag spikes
    const dt = Math.min(delta, 0.05);

    const dx = targetWaypoint.x - currentPos.current.x;
    const dz = targetWaypoint.z - currentPos.current.z;
    const dist = Math.hypot(dx, dz);

    const stopThreshold = 0.12;
    const moving = dist > stopThreshold;

    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    if (moving) {
      // 1. Natural deceleration curve when nearing destination
      const baseSpeed = WORLD_CONFIG.player.walkSpeed || 3.4;
      const speedFactor = Math.min(1.0, Math.max(0.35, dist / 1.4));
      const step = Math.min(baseSpeed * speedFactor * dt, dist);

      // 2. Step towards destination
      currentPos.current.x += (dx / dist) * step;
      currentPos.current.z += (dz / dist) * step;
      currentPos.current.y = 0;

      // 3. Smooth rotation towards movement direction
      const walkAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        walkAngle,
        9.0,
        dt
      );
    } else {
      // Stationary: subtle breathing oscillation
      const t = state.clock.elapsedTime;
      currentPos.current.y = Math.sin(t * 2.5) * 0.012;

      // Rotate to face landmark or forward
      let settledAngle = WORLD_CONFIG.player.rotation[1];
      if (activeRegion === REALMS.MIND) {
        settledAngle = Math.atan2(-6.2 - (-4.6), -4.5 - (-3.2));
      } else if (activeRegion === REALMS.BODY) {
        settledAngle = Math.atan2(-6.0 - (-4.4), 4.5 - 3.2);
      } else if (activeRegion === REALMS.CRAFT) {
        settledAngle = Math.atan2(6.2 - 4.8, 0.4 - 0.4);
      }

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

useGLTF.preload(PLAYER);
Object.values(SKINS).forEach((url) => useGLTF.preload(url));
Object.values(PETS).forEach((url) => useGLTF.preload(url));
