import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GROUND } from '../assets';
import { WORLD_CONFIG } from '../worldConfig';

/**
 * Expanded Ground & Diorama Island Component
 * 
 * Provides the expansive floating miniature fantasy island with beveled rocky base,
 * rich green turf, circular flagstone Central Plaza, and branching pathway spokes
 * connecting Mind, Body, and Craft realms.
 */
export default function Ground() {
  const pathStraightGltf = useGLTF(GROUND.pathStraight);
  const pathBendGltf = useGLTF(GROUND.pathBend);

  const straightScene = useMemo(() => {
    const c = pathStraightGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) child.receiveShadow = true; });
    return c;
  }, [pathStraightGltf]);

  const bendScene = useMemo(() => {
    const c = pathBendGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) child.receiveShadow = true; });
    return c;
  }, [pathBendGltf]);

  const { radius, height } = WORLD_CONFIG.island;
  const { plazaRadius } = WORLD_CONFIG.center;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Floating Diorama Island Base (Beveled Tabletop Plateau) */}
      <mesh position={[0, -height / 2, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.85, height, 48]} />
        <meshStandardMaterial
          color="#1b2333"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* 2. Top Grass Surface Layer */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        receiveShadow
      >
        <circleGeometry args={[radius, 48]} />
        <meshStandardMaterial
          color="#2d8a4e"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Stepped Inner Grass Plateau for Tactile Depth */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, 0]}
        receiveShadow
      >
        <circleGeometry args={[radius * 0.9, 44]} />
        <meshStandardMaterial
          color="#38a169"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* 4. Central Plaza Flagstone Circle (Around Player & Campfire) */}
      <group position={[0, 0.005, 0]}>
        {/* Outer Cobblestone Ring Rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[plazaRadius * 0.88, plazaRadius, 36]} />
          <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Inner Flagstone Plaza Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[plazaRadius * 0.88, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.75} metalness={0.15} />
        </mesh>

        {/* Decorative Golden Compass Inlay */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <ringGeometry args={[1.1, 1.18, 16]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} />
        </mesh>

        {/* Wooden Directional Signpost (Matching Reference) */}
        <group position={[1.3, 0, -1.1]} rotation={[0, -0.3, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.9, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
          {/* Mind Direction Plank */}
          <mesh position={[-0.12, 0.72, 0]} rotation={[0, 0.6, 0]}>
            <boxGeometry args={[0.34, 0.09, 0.03]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Craft Direction Plank */}
          <mesh position={[0.12, 0.58, 0]} rotation={[0, -0.7, 0]}>
            <boxGeometry args={[0.34, 0.09, 0.03]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Body Direction Plank */}
          <mesh position={[-0.10, 0.44, 0]} rotation={[0, 2.1, 0]}>
            <boxGeometry args={[0.32, 0.09, 0.03]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 5. Pathway Spokes Connecting Plaza to the Three Realms */}
      <group position={[0, 0.007, 0]}>
        {/* === East Path leading to Bridge & Craft Realm === */}
        <group position={[1.4, 0, 0.2]} rotation={[0, Math.PI * 0.5, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[2.3, 0, 0.2]} rotation={[0, Math.PI * 0.5, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[3.8, 0, 0.3]} rotation={[0, Math.PI * 0.5, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[4.7, 0, 0.35]} rotation={[0, Math.PI * 0.5, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>

        {/* === Northwest Path leading to Mind Realm === */}
        <group position={[-1.2, 0, -1.0]} rotation={[0, -Math.PI * 0.72, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-2.1, 0, -1.7]} rotation={[0, -Math.PI * 0.72, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-3.0, 0, -2.4]} rotation={[0, -Math.PI * 0.72, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-3.9, 0, -3.1]} rotation={[0, -Math.PI * 0.72, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-4.7, 0, -3.7]} rotation={[0, -Math.PI * 0.65, 0]}>
          <primitive object={bendScene.clone(true)} />
        </group>

        {/* === Southwest Path leading to Body Realm === */}
        <group position={[-1.2, 0, 1.0]} rotation={[0, -Math.PI * 0.28, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-2.1, 0, 1.7]} rotation={[0, -Math.PI * 0.28, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-3.0, 0, 2.4]} rotation={[0, -Math.PI * 0.28, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-3.9, 0, 3.1]} rotation={[0, -Math.PI * 0.28, 0]}>
          <primitive object={straightScene.clone(true)} />
        </group>
        <group position={[-4.7, 0, 3.7]} rotation={[0, -Math.PI * 0.35, 0]}>
          <primitive object={bendScene.clone(true)} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(GROUND.pathStraight);
useGLTF.preload(GROUND.pathBend);
