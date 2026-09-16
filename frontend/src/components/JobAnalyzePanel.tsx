import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { analyzeJob, getInsightCard, getMatches, type Job, type RankedCandidate } from "../api";
import { useTilt } from "../hooks/useTilt";
import { MiniIcon3D } from "./MiniIcon3D";
import { PanelChrome } from "./PanelChrome";
import { Spinner } from "./Spinner";
import { Tag } from "./Tag";

export function JobAnalyzePanel() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const mutation = useMutation({ mutationFn: () => analyzeJob(title, rawText) });
  const tilt = useTilt(5, mutation.isSuccess);

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

      <MatchResults jobId={job.id} jobTitle={job.title} />
    </div>
  );
}

function MatchResults({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const mutation = useMutation({ mutationFn: () => getMatches(jobId) });

  return (
    <div className="mt-6 border-t border-border-soft pt-6">
      <button
        type="button"
        className="flex items-center gap-2 border border-contact px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-contact transition-transform duration-200 ease-spring hover:bg-contact hover:text-ground motion-safe:hover:scale-[1.03] motion-safe:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending && <Spinner />}
        {mutation.isPending ? "Finding matches…" : "Find matches"}
      </button>

      {mutation.isError && <p className="mt-4 text-sm text-warn">{(mutation.error as Error).message}</p>}

      {mutation.isSuccess && (
        <div className="mt-6 motion-safe:animate-result-in">
          <p className="font-display text-lg font-semibold text-text">Ranked candidates</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">
            {mutation.data.candidates.length} candidate{mutation.data.candidates.length === 1 ? "" : "s"} scored
            against &quot;{jobTitle}&quot;
          </p>

          {mutation.data.candidates.length === 0 && (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-text-faint">
              No candidates in the pool yet.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-4">
            {mutation.data.candidates.map((c, i) => (
              <CandidateMatchRow key={c.candidate_id} rank={i + 1} candidate={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ percent }: { percent: number }) {
  const size = 64;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2b3543" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#5fb8b0"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-sm font-semibold text-contact">{percent}%</span>
    </div>
  );
}

function CandidateMatchRow({ rank, candidate }: { rank: number; candidate: RankedCandidate }) {
  const percent = Math.round(candidate.score * 100);
  const shortId = candidate.candidate_id.slice(0, 8);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border-soft bg-ground/40 p-4">
      <div className="flex items-center gap-4">
        <ScoreRing percent={percent} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-xs text-text-faint">#{rank}</span>
            <p className="font-display text-base font-semibold text-text">{candidate.full_name ?? "Unnamed candidate"}</p>
            <span className="font-mono text-[10px] text-text-faint">· #{shortId}</span>
          </div>
          {candidate.email && <p className="font-mono text-[10.5px] text-text-faint">{candidate.email}</p>}

          {candidate.matched_required_skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {candidate.matched_required_skills.map((s) => (
                <Tag key={s} variant="contact">
                  {s}
                </Tag>
              ))}
            </div>
          )}

          {candidate.missing_required_skills.length > 0 && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
              Missing: {candidate.missing_required_skills.join(", ")}
            </p>
          )}

          <button
            type="button"
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-contact hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide reasoning ▲" : "Why this match? ▼"}
          </button>
        </div>
      </div>

      {expanded && <InsightCardSection matchId={candidate.match_id} />}
    </div>
  );
}

function InsightCardSection({ matchId }: { matchId: string }) {
  const mutation = useMutation({ mutationFn: () => getInsightCard(matchId) });
  const { mutate } = mutation;

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="mt-4 border-t border-border-soft pt-4">
      {mutation.isPending && (
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">
          <Spinner /> Generating reasoning…
        </p>
      )}

      {mutation.isError && <p className="font-mono text-[10px] text-warn">{(mutation.error as Error).message}</p>}

      {mutation.isSuccess &&
        mutation.data.cards.map((card, i) => (
          <div key={i} className="motion-safe:animate-result-in">
            <p className="font-display text-sm font-semibold text-text">{card.headline}</p>

            {card.matching_points.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {card.matching_points.map((mp, j) => (
                  <li key={j} className="text-xs leading-relaxed text-text-dim">
                    <span className="text-contact">✓</span> {mp.point}
                    {mp.resume_citation && (
                      <span className="ml-1 font-mono text-[10px] italic text-text-faint">— "{mp.resume_citation}"</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {card.gaps && card.gaps.length > 0 && (
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Gaps</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {card.gaps.map((gap, j) => (
                    <li key={j} className="text-xs leading-relaxed text-warn">
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
