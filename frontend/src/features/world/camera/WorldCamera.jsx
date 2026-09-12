import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WORLD_CONFIG, REALMS, REALM_LEVEL_CONFIG } from '../worldConfig';

/**
 * Upgraded Isometric World Camera Controller
 * 
 * Drives the elevated miniature diorama camera.
 * Smoothly interpolates (lerps) both camera eye position and OrbitControls target
 * when switching between Overview and specific Realms (Mind, Body, Craft),
 * and dynamically adapts framing to the size of Level 2 and Level 3 evolved structures.
 */
export default function WorldCamera({ activeRegion, realmLevels = { mind: 1, body: 1, craft: 1 } }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  const targetCamPos = useRef(new THREE.Vector3(...WORLD_CONFIG.camera.defaultPosition));
  const targetLookAt = useRef(new THREE.Vector3(...WORLD_CONFIG.camera.defaultTarget));

  useEffect(() => {
    if (activeRegion && REALMS[activeRegion.toUpperCase()]) {
      const currentLevel = realmLevels?.[activeRegion] || 1;
      const levelCfg = REALM_LEVEL_CONFIG[activeRegion]?.[currentLevel];
      const realmBaseCfg = WORLD_CONFIG[activeRegion];

      const camPos = levelCfg?.cameraPosition || realmBaseCfg?.cameraPosition || WORLD_CONFIG.camera.defaultPosition;
      const camTarget = levelCfg?.cameraTarget || realmBaseCfg?.cameraTarget || WORLD_CONFIG.camera.defaultTarget;

      targetCamPos.current.set(...camPos);
      targetLookAt.current.set(...camTarget);
    } else {
      targetCamPos.current.set(...WORLD_CONFIG.camera.defaultPosition);
      targetLookAt.current.set(...WORLD_CONFIG.camera.defaultTarget);
    }
  }, [activeRegion, realmLevels]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const speed = prefersReducedMotion ? 1.0 : Math.min(delta * WORLD_CONFIG.camera.transitionSpeed, 0.16);

    camera.position.lerp(targetCamPos.current, speed);
    controlsRef.current.target.lerp(targetLookAt.current, speed);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.15} // Prevent camera from passing below ground plane
      minPolarAngle={Math.PI / 6}    // Prevent top-down flattening
      minDistance={5.0}
      maxDistance={28.0}
      makeDefault
    />
  );
}
