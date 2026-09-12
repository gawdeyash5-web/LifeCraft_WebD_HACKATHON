import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { PLAYER } from './assets';
import { WORLD_CONFIG, REALMS } from './worldConfig';

/**
 * Autonomous Living Player Character
 * 
 * Synchronized interpolated waypoint navigation:
 * - Rotates towards destination
 * - Plays continuous walk animation
 * - Smoothly decelerates on arrival
 * - Blends into idle animation
 * - Faces landmark on arrival
 */
export default function PlayerModel({ activeRegion }) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...WORLD_CONFIG.waypoints.center));
  const currentAnim = useRef('idle');

  const { scene, animations } = useGLTF(PLAYER);

  // Apply shadows directly to GLB scene hierarchy (preserves bone bindings for SkinnedMesh)
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Skeletal animations from GLB attached to the group root
  const { actions, names } = useAnimations(animations, groupRef);

  // Initialize idle animation on mount
  useEffect(() => {
    if (!actions) return;
    const idleAction = actions['idle'] || actions[names?.[0]];
    if (idleAction) {
      idleAction.reset().fadeIn(0.2).play();
      currentAnim.current = 'idle';
    }
  }, [actions, names]);

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
    const isMoving = dist > stopThreshold;

    // Handle animation state transitions (Idle <-> Walk) with clean crossfading
    if (isMoving && currentAnim.current !== 'walk') {
      const walkAction = actions?.['walk'];
      const idleAction = actions?.['idle'];
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play();
        if (idleAction) idleAction.fadeOut(0.2);
        currentAnim.current = 'walk';
      }
    } else if (!isMoving && currentAnim.current !== 'idle') {
      const walkAction = actions?.['walk'];
      const idleAction = actions?.['idle'];
      if (idleAction) {
        idleAction.reset().fadeIn(0.3).play();
        if (walkAction) walkAction.fadeOut(0.3);
        currentAnim.current = 'idle';
      }
    }

    if (isMoving) {
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
        // Face toward Mind tower [-6.2, 0, -4.5] from [-4.6, 0, -3.2]
        settledAngle = Math.atan2(-6.2 - (-4.6), -4.5 - (-3.2));
      } else if (activeRegion === REALMS.BODY) {
        // Face toward Body dojo [-6.0, 0, 4.5] from [-4.4, 0, 3.2]
        settledAngle = Math.atan2(-6.0 - (-4.4), 4.5 - 3.2);
      } else if (activeRegion === REALMS.CRAFT) {
        // Face toward Craft watermill [6.2, 0, 0.4] from [4.8, 0, 0.4]
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
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(PLAYER);

