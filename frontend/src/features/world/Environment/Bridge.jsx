import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { BRIDGE } from '../assets';
import { WORLD_CONFIG } from '../worldConfig';

/**
 * Upgraded Timber Bridge & River Canal Component
 */
function Bridge() {
  const bridgeGltf = useGLTF(BRIDGE);
  const waterRef = useRef();

  const bridgeScene = useMemo(() => {
    const c = bridgeGltf.scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [bridgeGltf]);

  useFrame((state) => {
    if (waterRef.current) {
      const t = state.clock.elapsedTime;
      waterRef.current.position.y = -0.04 + Math.sin(t * 2.0) * 0.006;
    }
  });

  const { position, rotation, scale } = WORLD_CONFIG.bridge;

  return (
    <group position={position}>
      {/* 3D Timber Bridge Structure */}
      <group rotation={rotation} scale={scale}>
        <primitive object={bridgeScene} />
      </group>

      {/* Stylized River Canal Flowing Beneath Bridge */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.2, 12.0]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.84}
        />
      </mesh>
    </group>
  );
}

const MemoizedBridge = React.memo(Bridge);
export default MemoizedBridge;

useGLTF.preload(BRIDGE);
