import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

// Star field component
function StarField({ count = 3000 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.2;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#f97316"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Dim secondary stars
function StarField2({ count = 2000 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.02;
    ref.current.rotation.x = -t * 0.15;
    ref.current.rotation.y = t * 0.1;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#a0a0ff"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

// Floating wireframe icosahedron
function FloatingGeometry() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.08;
    meshRef.current.rotation.y = t * 0.12;
    meshRef.current.position.y = Math.sin(t * 0.4) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[3, 0, -5]}>
      <icosahedronGeometry args={[2.5, 1]} />
      <meshStandardMaterial
        color="#f97316"
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

// Secondary smaller geometry
function FloatingGeometry2() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = -t * 0.05;
    meshRef.current.rotation.z = t * 0.07;
    meshRef.current.position.x = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[-4, -1, -6]}>
      <octahedronGeometry args={[1.8, 0]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        transparent
        opacity={0.06}
      />
    </mesh>
  );
}

// Light mode: soft floating orbs
function LightOrbs() {
  const orb1 = useRef();
  const orb2 = useRef();
  const orb3 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    orb1.current.position.x = Math.sin(t * 0.3) * 1.5 + 2;
    orb1.current.position.y = Math.cos(t * 0.2) * 1 + 1;
    orb2.current.position.x = Math.cos(t * 0.25) * 2 - 3;
    orb2.current.position.y = Math.sin(t * 0.35) * 1.2 - 1;
    orb3.current.position.x = Math.sin(t * 0.2) * 1;
    orb3.current.position.y = Math.cos(t * 0.15) * 1.5 + 0.5;
  });

  return (
    <>
      <mesh ref={orb1} position={[2, 1, -4]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.08} />
      </mesh>
      <mesh ref={orb2} position={[-3, -1, -5]}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.06} />
      </mesh>
      <mesh ref={orb3} position={[0, 0.5, -6]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial color="#a855f7" transparent opacity={0.05} />
      </mesh>
    </>
  );
}

function DarkScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#f97316" />
      <StarField />
      <StarField2 />
      <FloatingGeometry />
      <FloatingGeometry2 />
    </>
  );
}

function LightScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#f97316" />
      <LightOrbs />
    </>
  );
}

export default function ThreeBackground() {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        {isDarkMode ? <DarkScene /> : <LightScene />}
      </Canvas>
    </div>
  );
}
