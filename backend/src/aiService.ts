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

// Render's free tier spins the ai-service down after inactivity; the first request
// after a while can hit the gateway before the app has finished booting, returning a
// 502/503/504 HTML error page instead of a real response. Retrying with backoff rides
// out that cold-start window instead of surfacing it as a failure.
const COLD_START_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [3000, 8000, 15000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAiService<T>(path: string, body: unknown): Promise<T> {
  let lastError: Error = new Error(`AI service ${path} failed: unknown error`);

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(`${config.aiServiceUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      const text = await res.text();
      lastError = new Error(`AI service ${path} failed: ${res.status} ${text}`);

      if (!COLD_START_STATUSES.has(res.status) || attempt === RETRY_DELAYS_MS.length) {
        throw lastError;
      }
    } catch (err) {
      if (err === lastError) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === RETRY_DELAYS_MS.length) throw lastError;
    }

    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  throw lastError;
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
