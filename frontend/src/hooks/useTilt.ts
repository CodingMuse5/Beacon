import { type CSSProperties, useEffect, useRef, useState } from "react";

export function useTilt(maxTiltDeg = 5, disabled = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  // A tilt already in progress when results appear (disabling the effect) would
  // otherwise stay frozen at its last angle until the next mouse event.
  useEffect(() => {
    if (disabled) {
      setStyle({});
      setGlow((g) => ({ ...g, opacity: 0 }));
    }
  }, [disabled]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxTiltDeg * 2;
    const rotateX = (0.5 - py) * maxTiltDeg * 2;
    setStyle({ transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` });
    setGlow({ x: px * 100, y: py * 100, opacity: 1 });
  }

  function handleMouseLeave() {
    setStyle({ transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)" });
    setGlow((g) => ({ ...g, opacity: 0 }));
  }

  return { ref, style, glow, handleMouseMove, handleMouseLeave };
}
