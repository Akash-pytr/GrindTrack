import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function TimerRingMesh({ progress, isDistracted, isActive }) {
  const torusRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();

  // Brand: violet #7c3aed  |  accent: cyan #06b6d4
  const violet = new THREE.Color('#7c3aed');
  const cyan   = new THREE.Color('#06b6d4');
  const red    = new THREE.Color('#ef4444');
  const gray   = new THREE.Color('#27272a');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Idle: gentle pulse
    if (!isActive) {
      const scale = 1 + Math.sin(t * 1.2) * 0.015;
      torusRef.current.scale.setScalar(scale);
    } else {
      // Active: smooth spin
      torusRef.current.rotation.z = t * (isDistracted ? -1.5 : 0.8);
      const scale = 1 + Math.sin(t * 2) * 0.008;
      torusRef.current.scale.setScalar(scale);
    }

    // Glow sphere pulse
    if (glowRef.current) {
      const g = 1 + Math.sin(t * 1.5) * 0.05;
      glowRef.current.scale.setScalar(g);
    }

    // Inner ring counter-rotation
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * 0.4;
    }

    // Color interpolation — violet when active, red when distracted
    const activeColor = isDistracted ? red : violet;
    const targetColor = isActive ? activeColor : gray;
    torusRef.current.material.color.lerp(targetColor, 0.05);
    torusRef.current.material.emissive.lerp(isActive ? activeColor : new THREE.Color('#000000'), 0.05);
  });

  return (
    <>
      {/* Glow backdrop sphere */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <sphereGeometry args={[1.65, 32, 32]} />
        <meshStandardMaterial
          color={isDistracted ? '#ef4444' : '#7c3aed'}
          transparent
          opacity={isActive ? 0.06 : 0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main torus — violet/red gradient feel */}
      <mesh ref={torusRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.45, 0.085, 32, 200, Math.PI * 2 * Math.max(progress, 0.02)]} />
        <meshStandardMaterial
          color={isActive ? (isDistracted ? '#ef4444' : '#7c3aed') : '#27272a'}
          emissive={isActive ? (isDistracted ? '#ef4444' : '#8b5cf6') : '#000000'}
          emissiveIntensity={isActive ? 0.55 : 0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner decorative ring — cyan accent */}
      <mesh ref={innerRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.012, 8, 80]} />
        <meshStandardMaterial
          color={isActive ? '#06b6d4' : '#3f3f46'}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Static background track */}
      <mesh position={[0, 0, -0.01]}>
        <torusGeometry args={[1.45, 0.085, 32, 200]} />
        <meshStandardMaterial
          color="#1c1c1e"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

export default function ThreeTimerRing({ progress = 1, isDistracted = false, isActive = false }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        {/* Violet key light + cyan fill light */}
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#8b5cf6" />
        <pointLight position={[-3, -3, 2]} intensity={0.6} color="#06b6d4" />
        <TimerRingMesh
          progress={progress}
          isDistracted={isDistracted}
          isActive={isActive}
        />
      </Canvas>
    </div>
  );
}
