import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, useState } from "react";
import { type Candidate, uploadResume } from "../api";
import { useTilt } from "../hooks/useTilt";
import { ErrorState } from "./ErrorState";
import { MiniIcon3D } from "./MiniIcon3D";
import { PanelChrome } from "./PanelChrome";
import { Spinner } from "./Spinner";
import { Tag } from "./Tag";

export function ResumeUploadPanel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: uploadResume });
  const tilt = useTilt(5, mutation.isSuccess);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    mutation.mutate(file);
  }

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
        <span className="font-display text-lg font-semibold text-text">Add a candidate</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">Resume intake</span>
      </div>
      <div className="relative p-7">
        <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden border border-dashed border-border py-14 text-center transition hover:border-accent/60">
          <span className="motion-safe:animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {!fileName && <MiniIcon3D color="#e8a33d" shape="icosahedron" />}
          <span className="relative px-4 font-display text-2xl font-bold tracking-tight text-text">
            {fileName ?? "Drop your resume"}
          </span>
          {!fileName && <span className="relative font-mono text-[10px] uppercase tracking-[0.1em] text-text-faint">PDF or DOCX</span>}
          <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
          <span className="relative motion-safe:hover:scale-[1.04] motion-safe:active:scale-95 border border-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-accent transition-transform duration-200 ease-spring">
            Browse file
          </span>
        </label>

        {mutation.isPending && (
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
            <Spinner />
            Scanning resume…
          </p>
        )}
        {mutation.isError && (
          <ErrorState error={mutation.error as Error} onRetry={() => mutation.variables && mutation.mutate(mutation.variables)} />
        )}
        {mutation.isSuccess && (
          <CandidateResult candidate={mutation.data.candidate} duplicate={mutation.data.status === "duplicate"} />
        )}
      </div>
    </div>
  );
}

function CandidateResult({ candidate, duplicate }: { candidate: Candidate; duplicate: boolean }) {
  const profile = candidate.parsed_profile;
  return (
    <div className="mt-5 border-t border-border-soft pt-5 motion-safe:animate-result-in">
      {duplicate && (
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-accent">
          Already in your pool — no new candidate created
        </p>
      )}
      <p className="font-display text-2xl font-bold tracking-tight text-text">
        {candidate.full_name ?? "Unnamed candidate"}
      </p>
      <p className="mt-1 font-mono text-[11px] text-text-faint">
        {candidate.email}
        {candidate.phone ? ` · ${candidate.phone}` : ""}
      </p>

      {profile.summary && <p className="mt-3 text-sm leading-relaxed text-text-dim">{profile.summary}</p>}

      {candidate.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {candidate.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      )}

      {profile.work_experience?.map((entry, i) => (
        <div key={`${entry.company}-${i}`} className="mt-4 border-t border-border-soft pt-3">
          <p className="text-sm font-semibold text-text">
            {entry.role}
            {entry.company ? ` at ${entry.company}` : ""}
          </p>
          {entry.duration && <p className="font-mono text-[10.5px] text-text-faint">{entry.duration}</p>}
          {entry.highlights && entry.highlights.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-xs leading-relaxed text-text-dim">
              {entry.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
