import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getGithubScore, type GithubScore } from "../api";
import { useTilt } from "../hooks/useTilt";
import { MiniIcon3D } from "./MiniIcon3D";
import { PanelChrome } from "./PanelChrome";
import { ScoreRing } from "./ScoreRing";
import { Spinner } from "./Spinner";
import { Tag } from "./Tag";

export function GithubIntelligencePanel() {
  const [username, setUsername] = useState("");
  const mutation = useMutation({ mutationFn: () => getGithubScore(username.trim()) });
  const tilt = useTilt(5, mutation.isSuccess);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.handleMouseMove}
      onMouseLeave={tilt.handleMouseLeave}
      style={{ ...tilt.style, transition: "transform 200ms ease" }}
      className="relative overflow-hidden border border-border-soft bg-surface/75 shadow-[0_0_40px_-15px_rgba(232,163,61,0.25)] backdrop-blur-sm"
    >
      <PanelChrome tint="accent" />
      <span
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.glow.opacity,
          background: `radial-gradient(circle at ${tilt.glow.x}% ${tilt.glow.y}%, rgba(232,163,61,0.12), transparent 55%)`,
        }}
      />
      <div className="relative flex items-center justify-between border-b border-border-soft px-7 py-5">
        <span className="font-display text-lg font-semibold text-text">GitHub signal</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">GitHub intelligence</span>
      </div>
      <div className="relative p-7">
        {!username && !mutation.isSuccess && (
          <div className="mb-4 flex justify-center">
            <MiniIcon3D color="#e8a33d" shape="icosahedron" />
          </div>
        )}
        <div className="group relative overflow-hidden">
          <span className="motion-safe:animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-transparent via-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
          <input
            className="relative w-full border border-border bg-ground px-4 py-3 text-base text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            placeholder="GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && username.trim() && !mutation.isPending) mutation.mutate();
            }}
          />
        </div>
        <button
          type="button"
          className="mt-4 flex items-center gap-2 border border-accent px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-accent transition-transform duration-200 ease-spring hover:bg-accent hover:text-ground motion-safe:hover:scale-[1.03] motion-safe:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          disabled={!username.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Spinner />}
          {mutation.isPending ? "Scoring…" : "Check profile"}
        </button>

        {mutation.isError && <p className="mt-4 text-sm text-warn">{(mutation.error as Error).message}</p>}
        {mutation.isSuccess && <GithubScoreResult score={mutation.data} />}
      </div>
    </div>
  );
}

function GithubScoreResult({ score }: { score: GithubScore }) {
  return (
    <div className="mt-5 border-t border-border-soft pt-5 motion-safe:animate-result-in">
      <p className="font-display text-2xl font-bold tracking-tight text-text">@{score.username}</p>
      {score.cached && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Cached result</p>
      )}

      <div className="mt-4 flex gap-6">
        <div className="flex flex-col items-center gap-2">
          <ScoreRing percent={Math.round(score.tech_stack_score)} color="#e8a33d" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-faint">Tech stack</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ScoreRing percent={Math.round(score.credibility_score)} color="#5fb8b0" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-faint">Credibility</span>
        </div>
      </div>

      {score.reasoning && <p className="mt-4 text-sm leading-relaxed text-text-dim">{score.reasoning}</p>}

      {score.notable_repos.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Notable repos</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {score.notable_repos.map((r) => (
              <Tag key={r} variant="contact">
                {r}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
