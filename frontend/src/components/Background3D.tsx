import { Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

const CYCLE_SECONDS = 7;
const VERDICT_AT = 4.5;
const BURST_COUNT = 28;
const BURST_DURATION = 0.9;
// Scaled past 1.0 so, combined with toneMapped={false}, these clear the bloom threshold and actually glow.
const GOOD_COLOR = new THREE.Color("#7cb686").multiplyScalar(2.5);
const WARN_COLOR = new THREE.Color("#d2704a").multiplyScalar(2.5);

function useBurstDirections(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, () =>
        new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize(),
      ),
    [count],
  );
}

/** A resume sheet gets scanned by a magnifying glass, then a check or an X pops in as the verdict. */
function ResumeScanner() {
  const reducedMotion = usePrefersReducedMotion();
  const parallaxRef = useRef<THREE.Group>(null);
  const sheetRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Group>(null);
  const checkRef = useRef<THREE.Group>(null);
  const xRef = useRef<THREE.Group>(null);
  const burstRef = useRef<THREE.Points>(null);
  const burstMaterialRef = useRef<THREE.PointsMaterial>(null);
  const burstDirections = useBurstDirections(BURST_COUNT);
  const burstPositions = useMemo(() => new Float32Array(BURST_COUNT * 3), []);
  const clock = useRef(0);

  useFrame((state, delta) => {
    if (!reducedMotion) clock.current += delta;
    const t = clock.current % CYCLE_SECONDS;
    const cycleIndex = Math.floor(clock.current / CYCLE_SECONDS);
    const showCheck = cycleIndex % 2 === 0;

    if (sheetRef.current) {
      sheetRef.current.rotation.y = Math.sin(clock.current * 0.4) * 0.12;
      sheetRef.current.rotation.x = Math.sin(clock.current * 0.3) * 0.05;
    }

    if (glassRef.current) {
      const scanT = Math.min(t / VERDICT_AT, 1);
      const x = THREE.MathUtils.lerp(-0.85, 0.85, scanT);
      const y = Math.sin(clock.current * 3) * 0.1 + 0.15;
      glassRef.current.position.set(x, y, 0.5);
      glassRef.current.rotation.z = Math.sin(clock.current * 2.2) * 0.1;
    }

    let scale = 0;
    if (t > VERDICT_AT && t < 6.7) {
      const popT = Math.min((t - VERDICT_AT) / 0.4, 1);
      scale = popT * (1.15 - 0.15 * popT);
      if (t > 6.3) scale *= 1 - (t - 6.3) / 0.4;
    }
    scale = Math.max(0, scale);
    if (checkRef.current) checkRef.current.scale.setScalar(showCheck ? scale : 0);
    if (xRef.current) xRef.current.scale.setScalar(showCheck ? 0 : scale);

    const burstT = t - VERDICT_AT;
    if (burstRef.current && burstMaterialRef.current) {
      if (burstT >= 0 && burstT < BURST_DURATION) {
        const posAttr = burstRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const eased = 1 - (1 - burstT / BURST_DURATION) ** 2;
        const distance = eased * 1.35;
        for (let i = 0; i < BURST_COUNT; i++) {
          const dir = burstDirections[i];
          posAttr.setXYZ(i, dir.x * distance, dir.y * distance, dir.z * distance);
        }
        posAttr.needsUpdate = true;
        burstMaterialRef.current.opacity = 1 - burstT / BURST_DURATION;
        burstMaterialRef.current.color.copy(showCheck ? GOOD_COLOR : WARN_COLOR);
        burstRef.current.visible = true;
      } else {
        burstRef.current.visible = false;
      }
    }

    if (parallaxRef.current) {
      const targetX = state.pointer.y * 0.1;
      const targetY = state.pointer.x * 0.1;
      parallaxRef.current.rotation.x += (targetX - parallaxRef.current.rotation.x) * 0.03;
      parallaxRef.current.rotation.y += (targetY - parallaxRef.current.rotation.y) * 0.03;
    }
  });

  return (
    <group ref={parallaxRef} position={[2.1, 0, 0]}>
      <group ref={sheetRef}>
        <mesh>
          <boxGeometry args={[2.2, 2.8, 0.06]} />
          <meshStandardMaterial color="#e9e4d8" roughness={0.85} />
        </mesh>

        <mesh position={[-0.35, 1.15, 0.05]}>
          <boxGeometry args={[1.3, 0.16, 0.03]} />
          <meshStandardMaterial color="#e8a33d" roughness={0.5} />
        </mesh>

        {[0.75, 0.5, 0.25, -0.05, -0.3, -0.55].map((y, i) => (
          <mesh key={y} position={[-0.35 - (i % 2) * 0.1, y, 0.05]}>
            <boxGeometry args={[1.5 - (i % 3) * 0.3, 0.09, 0.03]} />
            <meshStandardMaterial color="#5b6472" roughness={0.9} />
          </mesh>
        ))}

        {[-0.7, -0.15, 0.4].map((x, i) => (
          <mesh key={x} position={[x, -0.95, 0.05]}>
            <boxGeometry args={[0.42, 0.18, 0.03]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#e8a33d" : "#5fb8b0"}
              emissive={i % 2 === 0 ? "#e8a33d" : "#5fb8b0"}
              emissiveIntensity={0.4}
              toneMapped={false}
            />
          </mesh>
        ))}

        <group position={[0, 0.2, 0.5]}>
          <group ref={checkRef}>
            <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.785]}>
              <boxGeometry args={[0.42, 0.09, 0.08]} />
              <meshStandardMaterial color="#7cb686" emissive="#7cb686" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            <mesh position={[0.2, 0.05, 0]} rotation={[0, 0, 0.876]}>
              <boxGeometry args={[0.78, 0.09, 0.08]} />
              <meshStandardMaterial color="#7cb686" emissive="#7cb686" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
          <group ref={xRef}>
            <mesh rotation={[0, 0, 0.785]}>
              <boxGeometry args={[0.7, 0.09, 0.08]} />
              <meshStandardMaterial color="#d2704a" emissive="#d2704a" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            <mesh rotation={[0, 0, -0.785]}>
              <boxGeometry args={[0.7, 0.09, 0.08]} />
              <meshStandardMaterial color="#d2704a" emissive="#d2704a" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>

          <points ref={burstRef} visible={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={BURST_COUNT} array={burstPositions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial ref={burstMaterialRef} size={0.1} transparent depthWrite={false} toneMapped={false} />
          </points>
        </group>
      </group>

      <group ref={glassRef} position={[-0.85, 0.15, 0.5]}>
        <mesh>
          <torusGeometry args={[0.5, 0.055, 16, 48]} />
          <meshStandardMaterial
            color="#e8a33d"
            metalness={0.7}
            roughness={0.25}
            emissive="#e8a33d"
            emissiveIntensity={0.3}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.44, 32]} />
          <meshPhysicalMaterial color="#dff3f0" transparent opacity={0.35} roughness={0.05} transmission={0.6} thickness={0.2} />
        </mesh>
        <mesh position={[-0.55, -0.55, -0.05]} rotation={[0, 0, 0.785]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 12]} />
          <meshStandardMaterial color="#2b3543" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      <Sparkles count={40} scale={[16, 10, 8]} size={2} speed={reducedMotion ? 0 : 0.2} color="#e8a33d" opacity={0.3} />
      <Sparkles count={25} scale={[16, 10, 8]} size={1.6} speed={reducedMotion ? 0 : 0.15} color="#5fb8b0" opacity={0.25} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={3} color="#e8a33d" />
      <pointLight position={[-5, -3, -2]} intensity={1.5} color="#5fb8b0" />

      <ResumeScanner />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.35}
          mipmapBlur
          radius={0.5}
          resolutionScale={0.5}
        />
      </EffectComposer>
    </>
  );
}

export function Background3D() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
