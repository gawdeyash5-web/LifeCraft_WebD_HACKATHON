import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural Low-Poly Floating Clouds
 * 
 * Creates fluffy, stylized low-poly cloud banks that float gently around the
 * perimeter and underbelly of the floating diorama island, matching the
 * visual reference composition.
 */
function CloudCluster({ position, scale = 1, speed = 1, phase = 0, opacity = 0.85 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.22;
      groupRef.current.position.x = position[0] + Math.cos(t * 0.3) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central main puff */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.8}
          metalness={0.05}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>
      {/* Secondary puffs */}
      <mesh position={[0.8, -0.15, 0.2]}>
        <dodecahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.8}
          transparent
          opacity={opacity * 0.95}
          flatShading
        />
      </mesh>
      <mesh position={[-0.75, -0.1, -0.15]}>
        <dodecahedronGeometry args={[0.68, 1]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.8}
          transparent
          opacity={opacity * 0.95}
          flatShading
        />
      </mesh>
      <mesh position={[0.2, 0.4, -0.2]}>
        <dodecahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.8}
          transparent
          opacity={opacity}
          flatShading
        />
      </mesh>
      <mesh position={[-0.2, -0.3, 0.4]}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.8}
          transparent
          opacity={opacity * 0.9}
          flatShading
        />
      </mesh>
    </group>
  );
}

export default function Clouds() {
  const clouds = useMemo(() => [
    // Surrounding rim clouds framing the floating island
    { position: [-12.5, -2.2, -8.0], scale: 2.2, speed: 0.8, phase: 0.0 },
    { position: [-14.0, -1.5, 4.0], scale: 2.5, speed: 0.7, phase: 1.2 },
    { position: [-8.0, -2.8, 11.5], scale: 2.0, speed: 0.9, phase: 2.4 },
    { position: [11.0, -2.0, 9.0], scale: 2.4, speed: 0.75, phase: 3.1 },
    { position: [13.5, -1.8, -3.5], scale: 2.6, speed: 0.85, phase: 4.5 },
    { position: [8.5, -2.5, -11.0], scale: 2.1, speed: 0.65, phase: 5.2 },
    { position: [0.0, -3.5, -13.0], scale: 2.8, speed: 0.7, phase: 0.8 },
    // Soft underbelly clouds billowing around chasm waterfalls
    { position: [7.2, -3.2, 2.5], scale: 1.8, speed: 1.1, phase: 1.7 },
    { position: [-4.5, -3.8, 7.5], scale: 1.9, speed: 0.95, phase: 3.8 },
    { position: [-5.0, -3.6, -7.0], scale: 1.7, speed: 1.05, phase: 4.9 },
  ], []);

  return (
    <group>
      {clouds.map((cloud, idx) => (
        <CloudCluster key={idx} {...cloud} />
      ))}
    </group>
  );
}
