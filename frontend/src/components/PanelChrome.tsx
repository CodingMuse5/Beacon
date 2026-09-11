/** A soft radial accent tint, layered behind a panel's content. */
export function PanelChrome({ tint }: { tint: "accent" | "contact" }) {
  const tintColor = tint === "accent" ? "rgba(232,163,61,0.08)" : "rgba(95,184,176,0.08)";

  return (
    <span
      className="pointer-events-none absolute inset-0"
      style={{ background: `radial-gradient(120% 100% at 100% 0%, ${tintColor}, transparent 60%)` }}
    />
  );
}
