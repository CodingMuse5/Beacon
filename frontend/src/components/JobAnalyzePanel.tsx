import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { analyzeJob, type Job } from "../api";
import { useTilt } from "../hooks/useTilt";
import { MiniIcon3D } from "./MiniIcon3D";
import { PanelChrome } from "./PanelChrome";
import { Spinner } from "./Spinner";
import { Tag } from "./Tag";

export function JobAnalyzePanel() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const mutation = useMutation({ mutationFn: () => analyzeJob(title, rawText) });
  const tilt = useTilt();

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{ ...tilt.style, transition: "transform 200ms ease" }}
      className="relative overflow-hidden border border-border-soft bg-surface/75 shadow-[0_0_40px_-15px_rgba(95,184,176,0.25)] backdrop-blur-sm"
    >
      <PanelChrome tint="contact" />
      <span
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.glow.opacity,
          background: `radial-gradient(circle at ${tilt.glow.x}% ${tilt.glow.y}%, rgba(95,184,176,0.12), transparent 55%)`,
        }}
      />
      <div className="relative flex items-center justify-between border-b border-border-soft px-7 py-5">
        <span className="font-display text-lg font-semibold text-text">Post a job</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Blueprint intake</span>
      </div>
      <div className="relative p-7">
        {!title && !rawText && (
          <div className="mb-4 flex justify-center">
            <MiniIcon3D color="#5fb8b0" shape="octahedron" />
          </div>
        )}
        <div className="group relative overflow-hidden">
          <span className="motion-safe:animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-transparent via-contact/10 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
          <input
            className="relative w-full border border-border bg-ground px-4 py-3 text-base text-text placeholder:text-text-faint focus:border-contact focus:outline-none"
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="relative mt-4 h-44 w-full resize-none border border-border bg-ground px-4 py-3 text-base text-text placeholder:text-text-faint focus:border-contact focus:outline-none"
            placeholder="Paste the job description…"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="mt-4 flex items-center gap-2 border border-contact px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-contact transition-transform duration-200 ease-spring hover:bg-contact hover:text-ground motion-safe:hover:scale-[1.03] motion-safe:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          disabled={!title || !rawText || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Spinner />}
          {mutation.isPending ? "Scanning…" : "Scan"}
        </button>

        {mutation.isError && <p className="mt-4 text-sm text-warn">{(mutation.error as Error).message}</p>}
        {mutation.isSuccess && <JobResult job={mutation.data.job} />}
      </div>
    </div>
  );
}

function JobResult({ job }: { job: Job }) {
  const blueprint = job.blueprint;
  return (
    <div className="mt-5 border-t border-border-soft pt-5 motion-safe:animate-result-in">
      <p className="font-display text-2xl font-bold tracking-tight text-text">{job.title}</p>
      {blueprint.seniority && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
          {blueprint.seniority}
          {blueprint.min_years_experience ? ` · ${blueprint.min_years_experience}+ yrs` : ""}
        </p>
      )}

      {blueprint.summary && <p className="mt-3 text-sm leading-relaxed text-text-dim">{blueprint.summary}</p>}

      {blueprint.required_skills && blueprint.required_skills.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Required</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {blueprint.required_skills.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      )}

      {blueprint.nice_to_have_skills && blueprint.nice_to_have_skills.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Nice to have</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {blueprint.nice_to_have_skills.map((s) => (
              <Tag key={s} variant="contact">
                {s}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {blueprint.responsibilities && blueprint.responsibilities.length > 0 && (
        <ul className="mt-4 list-disc pl-4 text-xs leading-relaxed text-text-dim">
          {blueprint.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
