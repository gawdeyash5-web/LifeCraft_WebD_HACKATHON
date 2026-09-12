import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Ambient Firefly / Mote Particles
 * 
 * Subtly floats across the diorama atmosphere to give the miniature world life.
 * Kept strictly to ~36 particles to avoid performance degradation.
 */
export default function AmbientParticles({ count = 36 }) {
  const pointsRef = useRef();

  const [positions, initialPositions, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const init = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 11;
      const y = 0.5 + Math.random() * 3.5;
      const z = (Math.random() - 0.5) * 11;

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      init[i * 3 + 0] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;

      spd[i] = 0.15 + Math.random() * 0.25;
      off[i] = Math.random() * Math.PI * 2;
    }

    return [pos, init, spd, off];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      // Gentle vertical wave
      posArray[i * 3 + 1] = initialPositions[i * 3 + 1] + Math.sin(t * speeds[i] + offsets[i]) * 0.4;
      // Gentle horizontal drift
      posArray[i * 3 + 0] = initialPositions[i * 3 + 0] + Math.cos(t * speeds[i] * 0.7 + offsets[i]) * 0.3;
      posArray[i * 3 + 2] = initialPositions[i * 3 + 2] + Math.sin(t * speeds[i] * 0.5 + offsets[i]) * 0.3;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#fef08a"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
