function RadarGlyph() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span className="motion-safe:animate-ping absolute h-full w-full rounded-full border border-accent/50" />
      <span className="absolute h-2/3 w-2/3 rounded-full border border-accent/70" />
      <span className="h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

export function TopBar() {
  return (
    <div className="relative overflow-hidden border-b border-border-soft bg-surface/60 px-8 py-7 backdrop-blur-sm">
      <span className="motion-safe:animate-header-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-text md:text-5xl">
            B<span className="text-accent [text-shadow:0_0_28px_rgba(232,163,61,0.5)]">EACON</span>
          </h1>
          <span className="flex items-center gap-2 font-body text-sm tracking-wide text-text-dim">
            <RadarGlyph />
            Talent Signal Console
          </span>
        </div>
        <span className="font-body text-sm tracking-wide text-text-dim">No fluff. Just signal.</span>
      </div>
    </div>
  );
}
