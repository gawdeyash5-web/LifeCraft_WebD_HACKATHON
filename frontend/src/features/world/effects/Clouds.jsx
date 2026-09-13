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
// Shared geometries and materials for all cloud clusters (0 duplicate allocations)
const _sharedCloudGeo = new THREE.DodecahedronGeometry(1, 1);
const _cloudMat1 = new THREE.MeshLambertMaterial({
  color: '#f8fafc',
  transparent: true,
  opacity: 0.85,
  flatShading: true,
});
const _cloudMat2 = new THREE.MeshLambertMaterial({
  color: '#f1f5f9',
  transparent: true,
  opacity: 0.80,
  flatShading: true,
});
const _cloudMat3 = new THREE.MeshLambertMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.85,
  flatShading: true,
});

function CloudCluster({ position, scale = 1, speed = 1, phase = 0 }) {
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
      <mesh position={[0, 0, 0]} scale={1.0} geometry={_sharedCloudGeo} material={_cloudMat1} />
      {/* Secondary puffs */}
      <mesh position={[0.8, -0.15, 0.2]} scale={0.72} geometry={_sharedCloudGeo} material={_cloudMat2} />
      <mesh position={[-0.75, -0.1, -0.15]} scale={0.68} geometry={_sharedCloudGeo} material={_cloudMat2} />
      <mesh position={[0.2, 0.4, -0.2]} scale={0.62} geometry={_sharedCloudGeo} material={_cloudMat3} />
      <mesh position={[-0.2, -0.3, 0.4]} scale={0.55} geometry={_sharedCloudGeo} material={_cloudMat2} />
    </group>
  );
}

function Clouds() {
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

const MemoizedClouds = React.memo(Clouds);
export default MemoizedClouds;
