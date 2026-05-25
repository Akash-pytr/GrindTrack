import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function TorusKnot() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Slow 3D tumble in all axes — matches the screenshot angle
    meshRef.current.rotation.x = t * 0.28;
    meshRef.current.rotation.y = t * 0.45;
    meshRef.current.rotation.z = t * 0.15;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.0, 0.38, 180, 20]} />
        <meshStandardMaterial
          color="#c2410c"
          emissive="#92400e"
          emissiveIntensity={0.5}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

export default function BrandingScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 52 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.15} />
      {/* Warm key light from top-right */}
      <pointLight position={[3, 4, 3]} intensity={4} color="#f97316" />
      {/* Cool fill from left */}
      <pointLight position={[-3, -1, 2]} intensity={1.2} color="#7c3aed" />
      {/* Subtle rim from below */}
      <pointLight position={[0, -3, 1]} intensity={0.6} color="#1e3a5f" />
      <TorusKnot />
    </Canvas>
  );
}
