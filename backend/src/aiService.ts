import { config } from "./config";

export interface WorkExperienceEntry {
  company: string;
  role: string;
  duration?: string;
  highlights?: string[];
}

export interface EducationEntry {
  institution: string;
  degree?: string;
  year?: string;
}

export interface ParsedResumeProfile {
  full_name?: string;
  email?: string;
  phone?: string;
  summary: string;
  skills: string[];
  work_experience?: WorkExperienceEntry[];
  education?: EducationEntry[];
}

export interface JobBlueprint {
  seniority?: string;
  summary: string;
  required_skills: string[];
  nice_to_have_skills?: string[];
  responsibilities?: string[];
  min_years_experience?: number;
}

export interface InsightCard {
  headline: string;
  matching_points: { point: string; resume_citation?: string }[];
  gaps?: string[];
}

export interface GithubScore {
  tech_stack_score: number;
  credibility_score: number;
  reasoning: string;
  notable_repos?: string[];
}

async function callAiService<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.aiServiceUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI service ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export const aiService = {
  parseResume: (rawText: string) =>
    callAiService<ParsedResumeProfile>("/parse-resume", { raw_text: rawText }),

  parseJob: (title: string, rawText: string) =>
    callAiService<JobBlueprint>("/parse-job", { title, raw_text: rawText }),

  embed: (text: string) => callAiService<{ embedding: number[] }>("/embed", { text }),

  insightCard: (candidateProfile: unknown, jobBlueprint: unknown, score: number) =>
    callAiService<InsightCard>("/insight-card", {
      candidate_profile: candidateProfile,
      job_blueprint: jobBlueprint,
      score,
    }),

  githubScore: (username: string, profile: unknown, repos: unknown[]) =>
    callAiService<GithubScore>("/github-score", { username, profile, repos }),
};
