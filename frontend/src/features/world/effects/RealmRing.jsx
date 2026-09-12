import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Polished In-World Realm Waypoint Ring & Signage
 * 
 * Sits flat on the ground plane below each realm structure.
 * Features dual concentric rotating glyph rings, glowing floating beacon,
 * and a stylized RPG realm title plaque with subtitle ethos.
 */
export default function RealmRing({
  position = [0, 0.02, 0],
  radius = 1.9,
  color = '#818cf8',
  accentColor = '#c084fc',
  isActive = false,
  isHovered = false,
  title = '',
  subheading = '',
  level = 1,
  isNight = false,
}) {
  const ringRef = useRef();
  const innerRingRef = useRef();
  const beaconRef = useRef();
  const plaqueRef = useRef();
  const shockwaveRef = useRef();
  const transitionLightRef = useRef();

  // Transition tracking for level changes (upgrade or downgrade)
  const prevLevelRef = useRef(level);
  const transitionTimerRef = useRef(0); // 0 = idle, >0 = animating
  const [transitionState, setTransitionState] = React.useState(null);

  React.useEffect(() => {
    if (prevLevelRef.current !== level) {
      const isUpgrade = level > prevLevelRef.current;
      prevLevelRef.current = level;
      transitionTimerRef.current = 1.4; // 1.4 second transition duration
      setTransitionState({
        isUpgrade,
        level,
        startTime: Date.now(),
      });
      const timer = setTimeout(() => {
        setTransitionState(null);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [level]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Concentric glyph disc rotation
    if (ringRef.current) {
      const rotSpeed = transitionState ? 1.8 : isActive ? 0.5 : 0.2;
      ringRef.current.rotation.z += dt * rotSpeed;
    }
    if (innerRingRef.current) {
      const rotSpeed = transitionState ? 2.2 : isActive ? 0.75 : 0.3;
      innerRingRef.current.rotation.z -= dt * rotSpeed;
    }

    // Floating crystal beacon bobbing & rotating
    if (beaconRef.current) {
      beaconRef.current.position.y = 2.8 + Math.sin(t * 2.5) * 0.15;
      beaconRef.current.rotation.y = t * (transitionState ? 3.5 : 1.4);
    }

    // Floating plaque subtle floating hover
    if (plaqueRef.current) {
      const yOffset = transitionState ? Math.sin(t * 8) * 0.08 : 0;
      plaqueRef.current.position.y = 2.35 + Math.sin(t * 1.8) * 0.04 + yOffset;
    }

    // Energy shockwave ring pulse
    if (shockwaveRef.current) {
      if (transitionTimerRef.current > 0) {
        transitionTimerRef.current -= dt;
        const progress = 1.0 - Math.max(0, transitionTimerRef.current / 1.4);
        const shockScale = 0.6 + progress * 2.2;
        shockwaveRef.current.scale.set(shockScale, shockScale, shockScale);
        shockwaveRef.current.visible = true;
        if (shockwaveRef.current.material) {
          shockwaveRef.current.material.opacity = (1.0 - progress) * 0.9;
        }
      } else {
        shockwaveRef.current.visible = false;
      }
    }

    // Transition lighting pulse
    if (transitionLightRef.current) {
      if (transitionTimerRef.current > 0) {
        const progress = 1.0 - Math.max(0, transitionTimerRef.current / 1.4);
        const pulse = Math.sin(progress * Math.PI);
        transitionLightRef.current.intensity = pulse * 4.5;
      } else {
        transitionLightRef.current.intensity = 0;
      }
    }
  });

  const baseOpacity = isActive ? 0.95 : isHovered ? 0.8 : isNight ? 0.65 : 0.45;
  const ringColor = isActive ? accentColor : color;

  return (
    <group position={position}>
      {/* 1. Outer Ground Waypoint Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.9, radius * 1.05, 40]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={baseOpacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Inner Concentric Arc Ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.6, radius * 0.72, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={baseOpacity * 0.7}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Soft Ambient Ground Glow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[radius * 1.25, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={isActive ? (isNight ? 0.35 : 0.25) : isHovered ? 0.18 : 0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dynamic Expansion Shockwave on Level Up / Downgrade */}
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} visible={false}>
        <ringGeometry args={[radius * 0.9, radius * 1.25, 48]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dynamic Transition Flash Light */}
      <pointLight
        ref={transitionLightRef}
        color={accentColor}
        intensity={0}
        distance={10.0}
        position={[0, 2.0, 0]}
      />

      {/* 4. Floating Waypoint Crystal Beacon (when active or hovered) */}
      {(isActive || isHovered || isNight) && (
        <group ref={beaconRef} position={[0, 2.8, 0]}>
          <mesh>
            <octahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={isActive ? 1.6 : isNight ? 1.1 : 0.6}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
          <pointLight
            color={accentColor}
            intensity={isActive ? 2.5 : isNight ? 1.8 : 0.9}
            distance={5.0}
          />
        </group>
      )}

      {/* 5. In-World RPG Realm Plaque / Signage (Matching Visual Reference Pill Design) */}
      {title && (
        <Billboard
          ref={plaqueRef}
          position={[0, 2.35, radius * 0.75]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          {/* Main Rounded Pill Backplate */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.7, 0.72]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.25}
              metalness={0.8}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Glowing Tinted Background Layer */}
          <mesh position={[0, 0, -0.008]}>
            <planeGeometry args={[2.64, 0.66]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isActive ? 0.38 : 0.22}
            />
          </mesh>

          {/* Delicate Accent Border */}
          <lineSegments position={[0, 0, -0.004]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(2.7, 0.72)]} />
            <lineBasicMaterial
              color={accentColor}
              transparent
              opacity={isActive ? 0.95 : 0.55}
            />
          </lineSegments>

          {/* Left Icon Square Box */}
          <mesh position={[-0.95, 0, 0.005]}>
            <planeGeometry args={[0.46, 0.46]} />
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Left Icon Emoji / Glyph */}
          <Text
            position={[-0.95, 0, 0.015]}
            fontSize={0.24}
            anchorX="center"
            anchorY="middle"
          >
            {title.includes('MIND') ? '📖' : title.includes('BODY') ? '🏋️' : '⚙️'}
          </Text>

          {/* Main Title */}
          <Text
            position={[-0.58, 0.12, 0.015]}
            fontSize={0.20}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#020617"
            letterSpacing={0.06}
          >
            {title.toUpperCase()}
          </Text>

          {/* Subheading Ethos */}
          {subheading && (
            <Text
              position={[-0.58, -0.11, 0.015]}
              fontSize={0.095}
              color={isActive ? accentColor : '#cbd5e1'}
              anchorX="left"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#020617"
              letterSpacing={0.02}
            >
              {subheading}
            </Text>
          )}

          {/* Level Badge Pill on Right Side */}
          <mesh position={[0.95, 0, 0.005]}>
            <planeGeometry args={[0.55, 0.38]} />
            <meshStandardMaterial
              color="#090d16"
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
          <lineSegments position={[0.95, 0, 0.008]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(0.55, 0.38)]} />
            <lineBasicMaterial color={accentColor} />
          </lineSegments>
          <Text
            position={[0.95, 0, 0.015]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#020617"
            letterSpacing={0.04}
          >
            {`LVL ${level}`}
          </Text>

          {/* Floating Realm Evolution Banner during 1.4s Transition */}
          {transitionState && (
            <group position={[0, 0.62, 0.02]}>
              <mesh position={[0, 0, -0.005]}>
                <planeGeometry args={[2.5, 0.36]} />
                <meshStandardMaterial
                  color="#090d16"
                  emissive={accentColor}
                  emissiveIntensity={0.5}
                  roughness={0.2}
                />
              </mesh>
              <lineSegments position={[0, 0, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(2.5, 0.36)]} />
                <lineBasicMaterial color={accentColor} />
              </lineSegments>
              <Text
                position={[0, 0, 0.02]}
                fontSize={0.12}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.012}
                outlineColor="#000000"
                letterSpacing={0.06}
              >
                {transitionState.isUpgrade
                  ? `⚡ REALM EVOLVED • LEVEL ${level} ⚡`
                  : `🍃 REALM REGRESSED • LEVEL ${level}`}
              </Text>
            </group>
          )}
        </Billboard>
      )}
    </group>
  );
}
