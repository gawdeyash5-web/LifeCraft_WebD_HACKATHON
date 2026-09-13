import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPFIRE } from '../assets';
import { WORLD_CONFIG } from '../worldConfig';

/**
 * Procedural Streak Campfire with Dynamic Night Illumination
 */
function Campfire({ isNight = false }) {
  const stonesGltf = useGLTF(CAMPFIRE.stones);
  const logsGltf = useGLTF(CAMPFIRE.logs);

  const flameRef1 = useRef();
  const flameRef2 = useRef();
  const flameRef3 = useRef();
  const lightRef = useRef();
  const embersRef = useRef();

  const stonesScene = useMemo(() => {
    const clone = stonesGltf.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [stonesGltf]);

  const logsScene = useMemo(() => {
    const clone = logsGltf.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [logsGltf]);

  // Create ember particles
  const emberCount = 18;
  const emberData = useMemo(() => {
    const positions = new Float32Array(emberCount * 3);
    const speeds = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = Math.random() * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      speeds[i] = 0.35 + Math.random() * 0.45;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Flickering warm point light with night boost
    if (lightRef.current) {
      const baseIntensity = isNight
        ? WORLD_CONFIG.campfire.light.intensityNight
        : WORLD_CONFIG.campfire.light.intensityDay;
      lightRef.current.intensity = baseIntensity + Math.sin(t * 8) * 0.45 + Math.cos(t * 13) * 0.2;
    }

    // Organic flame scale & rotation oscillation
    if (flameRef1.current) {
      const s1 = 1.0 + Math.sin(t * 7) * 0.15;
      flameRef1.current.scale.set(s1, 1.0 + Math.sin(t * 9) * 0.25, s1);
      flameRef1.current.rotation.y = t * 1.5;
    }
    if (flameRef2.current) {
      const s2 = 0.85 + Math.cos(t * 11) * 0.18;
      flameRef2.current.scale.set(s2, 0.8 + Math.cos(t * 8) * 0.2, s2);
      flameRef2.current.rotation.y = -t * 2.1;
    }
    if (flameRef3.current) {
      const s3 = 0.6 + Math.sin(t * 13) * 0.12;
      flameRef3.current.scale.set(s3, 0.6 + Math.sin(t * 10) * 0.18, s3);
      flameRef3.current.rotation.y = t * 3.0;
    }

    // Animate rising ember sparks
    if (embersRef.current) {
      const pos = embersRef.current.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        pos[i * 3 + 1] += delta * emberData.speeds[i];
        pos[i * 3 + 0] += Math.sin(t * 4 + i) * 0.0035;
        pos[i * 3 + 2] += Math.cos(t * 4 + i) * 0.0035;

        // Reset when reaching top
        if (pos[i * 3 + 1] > 1.1) {
          pos[i * 3 + 1] = 0.08;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 0.25;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const { position, scale } = WORLD_CONFIG.campfire;

  return (
    <group position={position} scale={scale}>
      {/* 3D Model: Stone Ring */}
      <primitive object={stonesScene} />

      {/* 3D Model: Firewood Logs nestled inside stones */}
      <primitive object={logsScene} position={[0, 0.02, 0]} />

      {/* Procedural Stylized Flame Shapes */}
      <group position={[0, 0.08, 0]}>
        {/* Main Outer Flame (Orange) */}
        <mesh ref={flameRef1} position={[0, 0.14, 0]}>
          <coneGeometry args={[0.18, 0.44, 5]} />
          <meshBasicMaterial color="#ff5a00" transparent opacity={0.88} />
        </mesh>

        {/* Mid Core Flame (Golden Amber) */}
        <mesh ref={flameRef2} position={[0, 0.16, 0]}>
          <coneGeometry args={[0.12, 0.36, 5]} />
          <meshBasicMaterial color="#ff9500" transparent opacity={0.92} />
        </mesh>

        {/* Inner Hot Core (Bright Yellow/White) */}
        <mesh ref={flameRef3} position={[0, 0.18, 0]}>
          <coneGeometry args={[0.07, 0.28, 4]} />
          <meshBasicMaterial color="#ffea75" />
        </mesh>
      </group>

      {/* Rising Embers */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={emberCount}
            array={emberData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#ffb703"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Warm Fire Point Light Illuminating Ground & Avatar (optimized: fill light without expensive cubemap shadow passes) */}
      <pointLight
        ref={lightRef}
        color={WORLD_CONFIG.campfire.light.color}
        intensity={WORLD_CONFIG.campfire.light.intensityDay}
        distance={WORLD_CONFIG.campfire.light.distance}
        decay={WORLD_CONFIG.campfire.light.decay}
        position={[0, 0.4, 0]}
      />
    </group>
  );
}

const MemoizedCampfire = React.memo(Campfire);
export default MemoizedCampfire;

useGLTF.preload(CAMPFIRE.stones);
useGLTF.preload(CAMPFIRE.logs);
