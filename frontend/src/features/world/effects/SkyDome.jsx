import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural SkyDome & Celestial System
 * 
 * Renders an upper-hemisphere starfield and an illuminated crescent moon
 * that naturally transitions based on the Day/Night game clock.
 */
export default function SkyDome({ starsOpacity = 0, isNight = false }) {
  const starsRef = useRef();
  const moonRef = useRef();

  // Generate celestial starfield
  const starCount = 280;
  const [starPositions, starFlickers] = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const flick = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Upper hemisphere on sphere radius ~45
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.15 + Math.random() * 0.85); // upper bowl
      const r = 42 + Math.random() * 6;

      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      flick[i] = 1.0 + Math.random() * 3.0;
    }

    return [pos, flick];
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow celestial rotation
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.008;
      starsRef.current.material.opacity = THREE.MathUtils.lerp(
        starsRef.current.material.opacity,
        starsOpacity,
        0.08
      );
    }

    // Moon gentle floating glow
    if (moonRef.current) {
      moonRef.current.position.y = 26 + Math.sin(t * 0.5) * 0.4;
      moonRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group>
      {/* 1. Starfield Points */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          color="#f8fafc"
          transparent
          opacity={starsOpacity}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Stylized Low-Poly Moon (Visible when twilight/night) */}
      {starsOpacity > 0.1 && (
        <group ref={moonRef} position={[-18, 26, -18]}>
          <mesh>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial
              color="#e0e7ff"
              emissive="#c7d2fe"
              emissiveIntensity={isNight ? 0.9 : 0.4}
              roughness={0.2}
            />
          </mesh>
          <pointLight
            color="#c7d2fe"
            intensity={isNight ? 0.8 : 0.2}
            distance={40}
          />
        </group>
      )}
    </group>
  );
}
