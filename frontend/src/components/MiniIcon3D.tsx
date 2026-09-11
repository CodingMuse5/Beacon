import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

function RotatingShape({ color, shape }: { color: string; shape: "icosahedron" | "octahedron" }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.5;
    ref.current.rotation.x += delta * 0.2;
  });

  return (
    <mesh ref={ref}>
      {shape === "icosahedron" ? <icosahedronGeometry args={[0.9, 0]} /> : <octahedronGeometry args={[1, 0]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.3} />
    </mesh>
  );
}

/** A small, self-contained rotating icon — bounded to its own box, scrolls normally with the page. */
export function MiniIcon3D({ color, shape }: { color: string; shape: "icosahedron" | "octahedron" }) {
  return (
    <div className="pointer-events-none h-16 w-16">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={1} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={20} color={color} />
        <RotatingShape color={color} shape={shape} />
      </Canvas>
    </div>
  );
}
