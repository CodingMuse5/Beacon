import { config } from "./config";

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
  parseResume: (rawText: string) => callAiService("/parse-resume", { raw_text: rawText }),

  parseJob: (title: string, rawText: string) =>
    callAiService("/parse-job", { title, raw_text: rawText }),

  embed: (text: string) => callAiService<{ embedding: number[] }>("/embed", { text }),

  insightCard: (candidateProfile: unknown, jobBlueprint: unknown, score: number) =>
    callAiService("/insight-card", {
      candidate_profile: candidateProfile,
      job_blueprint: jobBlueprint,
      score,
    }),

  githubScore: (username: string, profile: unknown, repos: unknown[]) =>
    callAiService("/github-score", { username, profile, repos }),
};
