import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { TREES, ROCKS, NATURE } from '../assets';

/**
 * Rich Nature & Foliage Landscape
 * 
 * Enriches the expanded diorama with layered depth:
 * - Foreground framing trees & riverbank stones
 * - Midground garden beds, shrubs, and stepping stones
 * - Background mountain/forest silhouettes
 * - Gentle procedural wind sway on foliage
 */
function Nature() {
  const treeDefGltf = useGLTF(TREES.default);
  const treePineGltf = useGLTF(TREES.pine);
  const treeOakGltf = useGLTF(TREES.oak);
  const rockLargeGltf = useGLTF(ROCKS.large);
  const stoneLargeGltf = useGLTF(ROCKS.stone);
  const bushGltf = useGLTF(NATURE.bush);
  const flowerGltf = useGLTF(NATURE.flower);
  const grassGltf = useGLTF(NATURE.grass);

  const foliageGroupRef = useRef();
  const swayingChildrenRef = useRef([]);

  // Trees cast and receive hero shadows
  const treeDef = useMemo(() => {
    const c = treeDefGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return c;
  }, [treeDefGltf]);

  const treePine = useMemo(() => {
    const c = treePineGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return c;
  }, [treePineGltf]);

  const treeOak = useMemo(() => {
    const c = treeOakGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return c;
  }, [treeOakGltf]);

  // Rocks cast and receive shadows
  const rockLarge = useMemo(() => {
    const c = rockLargeGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return c;
  }, [rockLargeGltf]);

  const stoneLarge = useMemo(() => {
    const c = stoneLargeGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; } });
    return c;
  }, [stoneLargeGltf]);

  // Small ground foliage only receives shadows (eliminates shadow rasterization cost)
  const bush = useMemo(() => {
    const c = bushGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; } });
    return c;
  }, [bushGltf]);

  const flower = useMemo(() => {
    const c = flowerGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; } });
    return c;
  }, [flowerGltf]);

  const grass = useMemo(() => {
    const c = grassGltf.scene.clone(true);
    c.traverse((child) => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; } });
    return c;
  }, [grassGltf]);

  // Cache swaying trees once on mount to avoid traversing all children every frame
  React.useEffect(() => {
    if (foliageGroupRef.current) {
      const swayers = [];
      foliageGroupRef.current.children.forEach((child, i) => {
        if (child.userData.sway) {
          swayers.push({ node: child, index: i });
        }
      });
      swayingChildrenRef.current = swayers;
    }
  }, []);

  // Gentle procedural wind sway on foliage (iterating only cached swaying tree nodes)
  useFrame((state) => {
    const swayers = swayingChildrenRef.current;
    if (swayers.length > 0) {
      const t = state.clock.elapsedTime;
      for (let j = 0; j < swayers.length; j++) {
        const item = swayers[j];
        item.node.rotation.z = Math.sin(t * 1.6 + item.index * 0.4) * 0.022;
        item.node.rotation.x = Math.cos(t * 1.2 + item.index * 0.3) * 0.015;
      }
    }
  });

  return (
    <group ref={foliageGroupRef} position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. NORTH RIDGE (Behind & around Mind Realm) */}
      {/* ========================================================= */}
      <group position={[-4.5, 0, -8.2]} scale={[1.8, 1.8, 1.8]} rotation={[0, 0.4, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[-2.4, 0, -8.8]} scale={[1.9, 1.9, 1.9]} rotation={[0, -0.6, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[0.2, 0, -8.5]} scale={[1.7, 1.7, 1.7]} rotation={[0, 0.9, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[-7.2, 0, -7.5]} scale={[1.6, 1.6, 1.6]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      <group position={[-8.5, 0, -5.2]} scale={[1.7, 1.7, 1.7]} rotation={[0, 0.2, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      {/* Ridge Boulders */}
      <group position={[-3.2, 0, -7.6]} scale={[1.5, 1.4, 1.5]} rotation={[0, 1.4, 0]}>
        <primitive object={rockLarge.clone(true)} />
      </group>
      <group position={[-6.0, 0, -7.8]} scale={[1.3, 1.2, 1.3]} rotation={[0, -0.8, 0]}>
        <primitive object={stoneLarge.clone(true)} />
      </group>

      {/* ========================================================= */}
      {/* 2. SOUTH RIDGE (Behind & around Body Realm) */}
      {/* ========================================================= */}
      <group position={[-4.2, 0, 8.4]} scale={[1.8, 1.8, 1.8]} rotation={[0, 0.8, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      <group position={[-1.8, 0, 8.8]} scale={[1.7, 1.7, 1.7]} rotation={[0, -0.3, 0]} userData={{ sway: true }}>
        <primitive object={treeDef.clone(true)} />
      </group>
      <group position={[0.6, 0, 8.2]} scale={[1.8, 1.8, 1.8]} rotation={[0, 0.4, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[-7.2, 0, 7.2]} scale={[1.6, 1.6, 1.6]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[-8.4, 0, 4.8]} scale={[1.7, 1.7, 1.7]} rotation={[0, 0.5, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      {/* South Slabs */}
      <group position={[-3.4, 0, 7.6]} scale={[1.4, 1.2, 1.4]} rotation={[0, 0.3, 0]}>
        <primitive object={stoneLarge.clone(true)} />
      </group>
      <group position={[-6.2, 0, 7.8]} scale={[1.3, 1.3, 1.3]} rotation={[0, -1.2, 0]}>
        <primitive object={rockLarge.clone(true)} />
      </group>

      {/* ========================================================= */}
      {/* 3. WEST CLIFF DIVIDE (Separating Mind and Body) */}
      {/* ========================================================= */}
      <group position={[-9.2, 0, 0.0]} scale={[1.9, 1.9, 1.9]} rotation={[0, 0.2, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[-8.6, 0, -1.8]} scale={[1.7, 1.7, 1.7]} rotation={[0, 1.1, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      <group position={[-8.4, 0, 1.8]} scale={[1.6, 1.6, 1.6]} rotation={[0, -0.6, 0]} userData={{ sway: true }}>
        <primitive object={treeDef.clone(true)} />
      </group>
      {/* Massive Dividing Mountain Boulders */}
      <group position={[-8.0, 0, -0.2]} scale={[1.8, 1.6, 1.8]} rotation={[0, 1.8, 0]}>
        <primitive object={rockLarge.clone(true)} />
      </group>
      <group position={[-7.4, 0, 1.1]} scale={[1.4, 1.2, 1.4]} rotation={[0, -0.4, 0]}>
        <primitive object={stoneLarge.clone(true)} />
      </group>

      {/* ========================================================= */}
      {/* 4. EAST BOUNDARY & RIVERBANK (Around Craft Realm) */}
      {/* ========================================================= */}
      <group position={[8.2, 0, -3.8]} scale={[1.8, 1.8, 1.8]} rotation={[0, 1.1, 0]} userData={{ sway: true }}>
        <primitive object={treeDef.clone(true)} />
      </group>
      <group position={[8.6, 0, 3.2]} scale={[1.7, 1.7, 1.7]} rotation={[0, -0.8, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      <group position={[9.2, 0, -0.4]} scale={[1.8, 1.8, 1.8]} rotation={[0, 0.5, 0]} userData={{ sway: true }}>
        <primitive object={treePine.clone(true)} />
      </group>
      <group position={[7.8, 0, 5.2]} scale={[1.6, 1.6, 1.6]} userData={{ sway: true }}>
        <primitive object={treeDef.clone(true)} />
      </group>
      {/* Canal Embankment Rocks */}
      <group position={[2.7, 0, -4.2]} scale={[1.2, 1.1, 1.2]} rotation={[0, 0.6, 0]}>
        <primitive object={stoneLarge.clone(true)} />
      </group>
      <group position={[2.8, 0, 4.4]} scale={[1.2, 1.1, 1.2]} rotation={[0, -0.7, 0]}>
        <primitive object={stoneLarge.clone(true)} />
      </group>
      <group position={[8.4, 0, 1.6]} scale={[1.4, 1.3, 1.4]} rotation={[0, 0.4, 0]}>
        <primitive object={rockLarge.clone(true)} />
      </group>

      {/* ========================================================= */}
      {/* 5. CENTRAL PLAZA SHADY GROVE & GARDEN FRAMING */}
      {/* ========================================================= */}
      {/* North-East Plaza Tree */}
      <group position={[1.8, 0, -3.2]} scale={[1.5, 1.5, 1.5]} rotation={[0, 0.3, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>
      {/* South-East Plaza Tree */}
      <group position={[1.6, 0, 3.4]} scale={[1.4, 1.4, 1.4]} rotation={[0, -0.5, 0]} userData={{ sway: true }}>
        <primitive object={treeDef.clone(true)} />
      </group>
      {/* West Plaza Tree */}
      <group position={[-3.6, 0, 0.0]} scale={[1.5, 1.5, 1.5]} rotation={[0, 1.2, 0]} userData={{ sway: true }}>
        <primitive object={treeOak.clone(true)} />
      </group>

      {/* Bushes Encircling Plaza Rim */}
      <group position={[-2.4, 0, -1.8]} scale={[1.2, 1.2, 1.2]} userData={{ sway: true }}>
        <primitive object={bush.clone(true)} />
      </group>
      <group position={[-2.2, 0, 2.0]} scale={[1.2, 1.2, 1.2]} userData={{ sway: true }}>
        <primitive object={bush.clone(true)} />
      </group>
      <group position={[1.4, 0, -1.8]} scale={[1.3, 1.3, 1.3]} userData={{ sway: true }}>
        <primitive object={bush.clone(true)} />
      </group>
      <group position={[1.2, 0, 2.2]} scale={[1.2, 1.2, 1.2]} userData={{ sway: true }}>
        <primitive object={bush.clone(true)} />
      </group>

      {/* Vibrant Flower Beds Along Walkways */}
      <group position={[-1.6, 0, -2.4]} scale={[1.4, 1.4, 1.4]}>
        <primitive object={flower.clone(true)} />
      </group>
      <group position={[-1.8, 0, 2.6]} scale={[1.4, 1.4, 1.4]} rotation={[0, 0.8, 0]}>
        <primitive object={flower.clone(true)} />
      </group>
      <group position={[0.6, 0, 1.8]} scale={[1.3, 1.3, 1.3]}>
        <primitive object={flower.clone(true)} />
      </group>
      <group position={[0.8, 0, -2.0]} scale={[1.3, 1.3, 1.3]} rotation={[0, -0.6, 0]}>
        <primitive object={flower.clone(true)} />
      </group>

      {/* Scattered Grass Tufts */}
      <group position={[0.8, 0, 0.9]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={grass.clone(true)} />
      </group>
      <group position={[-0.9, 0, -1.1]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={grass.clone(true)} />
      </group>
      <group position={[-1.8, 0, 0.4]} scale={[1.2, 1.2, 1.2]}>
        <primitive object={grass.clone(true)} />
      </group>
      <group position={[2.2, 0, -1.2]} scale={[1.1, 1.1, 1.1]}>
        <primitive object={grass.clone(true)} />
      </group>
    </group>
  );
}

const MemoizedNature = React.memo(Nature);
export default MemoizedNature;

useGLTF.preload(TREES.default);
useGLTF.preload(TREES.pine);
useGLTF.preload(TREES.oak);
useGLTF.preload(ROCKS.large);
useGLTF.preload(ROCKS.stone);
useGLTF.preload(NATURE.bush);
useGLTF.preload(NATURE.flower);
useGLTF.preload(NATURE.grass);
