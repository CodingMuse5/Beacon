import type { JobBlueprint, ParsedResumeProfile } from "./aiService";

/** Builds a focused string to embed, so candidate and job vectors compare like-for-like. */
export function buildCandidateEmbeddingText(profile: ParsedResumeProfile): string {
  const parts: string[] = [];

  if (profile.summary) parts.push(profile.summary);
  if (profile.skills?.length) parts.push(`Skills: ${profile.skills.join(", ")}`);

  const roles = (profile.work_experience ?? [])
    .map((entry) => [entry.role, entry.company].filter(Boolean).join(" at "))
    .filter(Boolean);
  if (roles.length) parts.push(`Roles: ${roles.join("; ")}`);

  return parts.join("\n");
}

/** Mirrors buildCandidateEmbeddingText's shape, so job and candidate vectors compare like-for-like. */
export function buildJobEmbeddingText(blueprint: JobBlueprint): string {
  const parts: string[] = [];

  if (blueprint.summary) parts.push(blueprint.summary);
  if (blueprint.required_skills?.length) {
    parts.push(`Required skills: ${blueprint.required_skills.join(", ")}`);
  }
  if (blueprint.nice_to_have_skills?.length) {
    parts.push(`Nice to have: ${blueprint.nice_to_have_skills.join(", ")}`);
  }

  return parts.join("\n");
}
