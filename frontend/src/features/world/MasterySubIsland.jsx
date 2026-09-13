import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Reusable Mastery Sub-Island Base
 * 
 * Renders a distinct, physically separated floating island in the diorama sky,
 * featuring:
 * - Beveled rocky cliff base with underside taper
 * - Realm-specific top terrain surface & stepping terraces
 * - Subtle floating breathing animation
 * - Glowing underside levitation core & perimeter lighting
 */
export default function MasterySubIsland({
  config,
  children,
  floatOffset = 0,
}) {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    islandRadius = 3.4,
    islandHeight = 1.7,
    terrainColor = '#1e1b4b',
    grassColor = '#312e81',
    cliffColor = '#0f172a',
    accentColor = '#818cf8',
    glowColor = '#c084fc',
  } = config || {};

  const islandGroupRef = useRef();

  // Subtle floating levitation oscillation
  useFrame((state) => {
    if (!islandGroupRef.current) return;
    const t = state.clock.elapsedTime + floatOffset;
    islandGroupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.04;
  });

  return (
    <group
      ref={islandGroupRef}
      position={[position[0], position[1], position[2]]}
      rotation={rotation}
      scale={scale}
    >
      {/* 1. Rocky Cliff Plateau (Upper Main Island Mass) */}
      <mesh position={[0, -islandHeight * 0.35, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[islandRadius, islandRadius * 0.88, islandHeight * 0.7, 32]} />
        <meshStandardMaterial
          color={cliffColor}
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Underside Tapered Crag (Inverted Floating Island Cone) */}
      <mesh position={[0, -islandHeight * 0.85, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[islandRadius * 0.88, 0.4, islandHeight * 0.6, 24]} />
        <meshStandardMaterial
          color={cliffColor}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Outer Stone Rim / Bevel Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[islandRadius * 0.9, islandRadius, 32]} />
        <meshStandardMaterial
          color={terrainColor}
          roughness={0.8}
          metalness={0.15}
        />
      </mesh>

      {/* 4. Top Primary Terrain Surface */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[islandRadius * 0.9, 32]} />
        <meshStandardMaterial
          color={grassColor}
          roughness={0.78}
          metalness={0.06}
        />
      </mesh>

      {/* 5. Stepped Inner Terrace (Visual Elevation & Depth) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[islandRadius * 0.72, 28]} />
        <meshStandardMaterial
          color={terrainColor}
          roughness={0.82}
          metalness={0.12}
        />
      </mesh>

      {/* 6. Glowing Underside Levitation Crystal Core */}
      <mesh position={[0, -islandHeight * 1.15, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={3.0}
          roughness={0.1}
        />
      </mesh>

      {/* 7. Underside Aura Point Light */}
      <pointLight
        position={[0, -islandHeight * 1.0, 0]}
        color={accentColor}
        intensity={2.2}
        distance={6.0}
      />

      {/* 8. Realm Expansion Buildings & Props Slot */}
      <group position={[0, 0.05, 0]}>
        {children}
      </group>
    </group>
  );
}

/**
 * Universal Sub-Island Connecting Bridge
 * 
 * Computes vector math from start to end, rendering a continuous architectural
 * bridge that physically spans across the empty void between the main island
 * and the floating sub-island.
 */
export function SubIslandBridge({
  start,
  end,
  type = 'mind', // 'mind' | 'body' | 'craft'
}) {
  const bridgeData = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const diff = new THREE.Vector3().subVectors(vEnd, vStart);
    const length = diff.length();
    const midpoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    const yaw = Math.atan2(diff.x, diff.z);
    const pitch = Math.atan2(diff.y, Math.hypot(diff.x, diff.z));

    return { length, midpoint, yaw, pitch };
  }, [start, end]);

  const { length, midpoint, yaw, pitch } = bridgeData;

  if (type === 'mind') {
    return (
      <group position={[midpoint.x, midpoint.y, midpoint.z]} rotation={[pitch, yaw, 0]}>
        {/* Arcane Stone Bridge Deck */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.3, 0.22, length]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Glowing Central Rune Strip */}
        <mesh position={[0, 0.12, 0]}>
          <planeGeometry args={[0.3, length * 0.94]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={2.0}
            roughness={0.2}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </mesh>
        {/* Left Stone Railing */}
        <mesh position={[-0.62, 0.22, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.12, 0.32, length]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Right Stone Railing */}
        <mesh position={[0.62, 0.22, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.12, 0.32, length]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Bridge Lantern / Crystal Sconces */}
        {[-length * 0.32, 0, length * 0.32].map((zPos, i) => (
          <group key={i} position={[0, 0.3, zPos]}>
            <mesh position={[-0.62, 0.1, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0.62, 0.1, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2.5} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (type === 'body') {
    return (
      <group position={[midpoint.x, midpoint.y, midpoint.z]} rotation={[pitch, yaw, 0]}>
        {/* Heavy Fortified Stone Arena Causeway */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.5, 0.26, length]} />
          <meshStandardMaterial color="#292524" roughness={0.85} metalness={0.15} />
        </mesh>
        {/* Dark Stone Kerbs */}
        <mesh position={[-0.72, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.16, 0.28, length]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
        <mesh position={[0.72, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.16, 0.28, length]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
        {/* Iron Palisade Guard Posts */}
        {[-length * 0.35, -length * 0.12, length * 0.12, length * 0.35].map((zPos, i) => (
          <group key={i} position={[0, 0.28, zPos]}>
            <mesh position={[-0.72, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.45, 8]} />
              <meshStandardMaterial color="#44403c" roughness={0.6} metalness={0.6} />
            </mesh>
            <mesh position={[0.72, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.45, 8]} />
              <meshStandardMaterial color="#44403c" roughness={0.6} metalness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Flame Torches at Bridge Midpoint */}
        <pointLight position={[0, 0.7, 0]} color="#f97316" intensity={2.0} distance={5.0} />
      </group>
    );
  }

  // Default: 'craft' (Industrial Timber & Iron Truss Bridge)
  return (
    <group position={[midpoint.x, midpoint.y, midpoint.z]} rotation={[pitch, yaw, 0]}>
      {/* Heavy Timber Planking Deck */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 0.2, length]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.88} />
      </mesh>
      {/* Iron Under-Girder Truss Support */}
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.1, 0.15, length * 0.98]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Wooden Handrails */}
      <mesh position={[-0.66, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.35, length]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} />
      </mesh>
      <mesh position={[0.66, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.35, length]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} />
      </mesh>
      {/* Brass Lantern Posts */}
      <group position={[0.66, 0.45, -length * 0.25]}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
      </group>
      <group position={[-0.66, 0.45, length * 0.25]}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
      </group>
      <pointLight position={[0, 0.6, 0]} color="#fbbf24" intensity={2.2} distance={5.0} />
    </group>
  );
}
