import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';

/**
 * Interactive Island / Node in 3D space
 */
function RegionNode({ position, color, label, regionId, isActive, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      if (isActive) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); onSelect(regionId); }}
          scale={isActive ? [1.25, 1.25, 1.25] : hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          cursor="pointer"
        >
          <octahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.7 : hovered ? 0.4 : 0.15}
            roughness={0.2}
            metalness={0.6}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Region Floating Label */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.35}
        color={isActive ? '#ffffff' : '#cbd5e1'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/**
 * Stylized Central Avatar Pedestal
 */
function CenterAvatar() {
  const avatarRef = useRef();

  useFrame((state, delta) => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Base Pedestal */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.4, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Central Hero Core */}
      <mesh ref={avatarRef} position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * 3D World Scene (Owned by Member 1)
 *
 * Consumes player state and active region selection.
 * Dispatches onSelectRegion to parent state without containing business logic.
 */
export default function WorldCanvas({ activeRegion, onSelectRegion }) {
  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#090d16] via-[#0e1626] to-[#080a10] border border-slate-800/80 shadow-2xl">
      <Canvas
        camera={{ position: [0, 4, 7], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <pointLight position={[0, 2, 0]} intensity={2} color="#6366f1" />

        {/* Central Avatar */}
        <CenterAvatar />

        {/* 1. Mind / Knowledge Island */}
        <RegionNode
          position={[-3.5, 0.8, -1]}
          color="#38bdf8"
          label="Mind & Knowledge"
          regionId="mind"
          isActive={activeRegion === 'mind'}
          onSelect={onSelectRegion}
        />

        {/* 2. Body / Vitality Island */}
        <RegionNode
          position={[0, 1.2, -3.8]}
          color="#f87171"
          label="Body & Vitality"
          regionId="body"
          isActive={activeRegion === 'body'}
          onSelect={onSelectRegion}
        />

        {/* 3. Craft / Coding Island */}
        <RegionNode
          position={[3.5, 0.8, -1]}
          color="#34d399"
          label="Craft & Code"
          regionId="craft"
          isActive={activeRegion === 'craft'}
          onSelect={onSelectRegion}
        />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={4}
          maxDistance={12}
        />
      </Canvas>

      {/* Floating 3D HUD Guide */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 pointer-events-none flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>Interactive 3D Realm &bull; Click any region to inspect</span>
      </div>
    </div>
  );
}
