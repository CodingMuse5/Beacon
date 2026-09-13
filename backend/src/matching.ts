import type { JobBlueprint } from "./aiService";
import { supabase } from "./supabase";

const VECTOR_WEIGHT = 0.6;
const SKILL_WEIGHT = 0.4;
const MAX_CANDIDATES = 50;

interface CandidateEmbeddingMatch {
  candidate_id: string;
  similarity: number;
}

export interface RankedCandidate {
  candidate_id: string;
  full_name: string | null;
  email: string | null;
  skills: string[];
  score: number;
  vector_similarity: number;
  skill_overlap: number | null;
  matched_required_skills: string[];
  missing_required_skills: string[];
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function parseEmbedding(raw: unknown): number[] {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as number[]);
}

export async function rankCandidatesForJob(jobId: string): Promise<RankedCandidate[]> {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, blueprint, embedding")
    .eq("id", jobId)
    .single();
  if (jobError) throw new Error(`Job not found: ${jobError.message}`);
  if (!job.embedding) throw new Error("This job has no embedding yet.");

  const embedding = parseEmbedding(job.embedding);
  const blueprint = job.blueprint as JobBlueprint;
  const requiredSkills = (blueprint.required_skills ?? []).map(normalizeSkill);

  const { data: matches, error: rpcError } = await supabase.rpc("match_candidates", {
    query_embedding: embedding,
    match_count: MAX_CANDIDATES,
  });
  if (rpcError) throw new Error(`Vector search failed: ${rpcError.message}`);

  const candidateMatches = matches as CandidateEmbeddingMatch[];
  if (candidateMatches.length === 0) return [];

  const candidateIds = candidateMatches.map((m) => m.candidate_id);
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, full_name, email, skills")
    .in("id", candidateIds);
  if (candidatesError) throw new Error(`Failed to load candidates: ${candidatesError.message}`);

  const candidateById = new Map(candidates.map((c) => [c.id, c]));

  const ranked: RankedCandidate[] = candidateMatches.map((m) => {
    const candidate = candidateById.get(m.candidate_id);
    const candidateSkills = new Set((candidate?.skills ?? []).map(normalizeSkill));

    const matched = requiredSkills.filter((s) => candidateSkills.has(s));
    const missing = requiredSkills.filter((s) => !candidateSkills.has(s));
    const skillOverlap = requiredSkills.length > 0 ? matched.length / requiredSkills.length : null;

    const vectorSimilarity = Math.max(0, Math.min(1, m.similarity));
    const score = skillOverlap === null ? vectorSimilarity : VECTOR_WEIGHT * vectorSimilarity + SKILL_WEIGHT * skillOverlap;

    return {
      candidate_id: m.candidate_id,
      full_name: candidate?.full_name ?? null,
      email: candidate?.email ?? null,
      skills: candidate?.skills ?? [],
      score: Math.round(score * 1000) / 1000,
      vector_similarity: Math.round(vectorSimilarity * 1000) / 1000,
      skill_overlap: skillOverlap === null ? null : Math.round(skillOverlap * 1000) / 1000,
      matched_required_skills: matched,
      missing_required_skills: missing,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  const { error: upsertError } = await supabase
    .from("matches")
    .upsert(
      ranked.map((r) => ({ job_id: jobId, candidate_id: r.candidate_id, score: r.score })),
      { onConflict: "job_id,candidate_id" },
    );
  if (upsertError) throw new Error(`Failed to save matches: ${upsertError.message}`);

  return ranked;
}
