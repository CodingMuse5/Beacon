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
// Measured cold-start time for the Render free-tier ai-service is ~30-35s; these
// delays give a comfortable margin above that (total wait ~65s across 4 retries).
const RETRY_DELAYS_MS = [5000, 10000, 20000, 30000];

// Thrown only when every retry against a 502/503/504 gateway response was exhausted --
// i.e. the ai-service never finished waking up in time. Routes translate this into a
// 503 with a clean, human message; the frontend renders a distinct "still waking up,
// try again" UI for it instead of dumping Render's raw HTML error page on screen.
export class AiServiceUnavailableError extends Error {}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAiService<T>(path: string, body: unknown): Promise<T> {
  let lastStatus = 0;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${config.aiServiceUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      // A network-level failure (connection refused, DNS, etc.) behaves the same as a
      // gateway status here -- worth riding out with the same retry/backoff.
      lastStatus = 0;
      if (attempt === RETRY_DELAYS_MS.length) {
        throw new AiServiceUnavailableError(
          "The AI service is still waking up. This can take up to a minute on the first request after a period of inactivity -- please try again shortly.",
        );
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }

    if (res.ok) {
      return res.json() as Promise<T>;
    }

    lastStatus = res.status;

    if (!COLD_START_STATUSES.has(res.status)) {
      // A real application error (4xx, or a genuine 500 from the app itself) -- surface
      // its actual message immediately rather than retrying something that won't fix
      // itself with time.
      const text = await res.text();
      throw new Error(`AI service ${path} failed: ${res.status} ${text}`);
    }

    if (attempt === RETRY_DELAYS_MS.length) {
      throw new AiServiceUnavailableError(
        "The AI service is still waking up. This can take up to a minute on the first request after a period of inactivity -- please try again shortly.",
      );
    }

    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  throw new AiServiceUnavailableError(
    `The AI service is still waking up (last status: ${lastStatus}). Please try again shortly.`,
  );
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
