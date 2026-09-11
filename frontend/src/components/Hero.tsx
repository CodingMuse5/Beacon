import { Background3D } from "./Background3D";

const STATS = [
  { value: "384", label: "Embedding dimensions" },
  { value: "2", label: "AI pipelines" },
  { value: "PDF / DOCX", label: "Supported files" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden md:min-h-[85vh]">
      <Background3D />

      <div className="relative mx-auto flex max-w-5xl flex-col justify-center px-6 py-24 md:min-h-[85vh]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">— AI Talent Signal</p>

        <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-text md:text-6xl">
          Every resume has a <span className="font-serif italic font-normal text-accent">signal</span>.
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-text-dim">
          Beacon reads resumes and job descriptions with AI, surfaces real skills instead of buzzwords, and shows you
          exactly why a match works.
        </p>

        <div className="mt-8">
          <a
            href="#console"
            className="inline-block border border-accent bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ground transition-transform duration-200 ease-spring motion-safe:hover:scale-[1.03] motion-safe:active:scale-95"
          >
            Start scanning
          </a>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold text-text">{stat.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
