import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';

// Falling gold star particles
function FallingStars({ count = 600 }) {
  const ref = useRef();

  const [positions, speeds, xDrifts] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const drift = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      spd[i]  = Math.random() * 0.01 + 0.004;
      drift[i] = (Math.random() - 0.5) * 0.003;
    }
    return [pos, spd, drift];
  }, [count]);

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i];
      pos[i * 3]     += xDrifts[i];
      if (pos[i * 3 + 1] < -8) {
        pos[i * 3 + 1] = 8;
        pos[i * 3]     = (Math.random() - 0.5) * 20;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#fbbf24"
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.75}
      />
    </Points>
  );
}

// Slower orange confetti
function Confetti({ count = 300 }) {
  const ref = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      spd[i] = Math.random() * 0.006 + 0.002;
    }
    return [pos, spd];
  }, [count]);

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i];
      if (pos[i * 3 + 1] < -7) {
        pos[i * 3 + 1] = 7;
        pos[i * 3] = (Math.random() - 0.5) * 18;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#f97316"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

// Floating trophy crown geometry
function FloatingCrown() {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={[0, 0.5, -3]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeLeaderboardStars() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 70 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 5, 3]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-4, -3, 2]} intensity={0.8} color="#f97316" />
        <FallingStars />
        <Confetti />
        <FloatingCrown />
      </Canvas>
    </div>
  );
}
