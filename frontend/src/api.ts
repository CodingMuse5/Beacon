const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface WorkExperienceEntry {
  company?: string;
  role?: string;
  duration?: string;
  highlights?: string[];
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  year?: string;
}

export interface ParsedResumeProfile {
  full_name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  work_experience?: WorkExperienceEntry[];
  education?: EducationEntry[];
}

export interface Candidate {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  parsed_profile: ParsedResumeProfile;
  skills: string[];
  created_at: string;
}

export interface JobBlueprint {
  summary?: string;
  seniority?: string;
  required_skills?: string[];
  nice_to_have_skills?: string[];
  responsibilities?: string[];
  min_years_experience?: number;
}

export interface Job {
  id: string;
  title: string;
  raw_text: string;
  blueprint: JobBlueprint;
  created_at: string;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed with status ${res.status}`);
  return data as T;
}

export async function uploadResume(file: File): Promise<{ status: string; candidate: Candidate }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/resumes/upload`, { method: "POST", body: formData });
  return parseJsonOrThrow(res);
}

export async function analyzeJob(title: string, rawText: string): Promise<{ status: string; job: Job }> {
  const res = await fetch(`${API_URL}/jobs/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, raw_text: rawText }),
  });
  return parseJsonOrThrow(res);
}

export interface RankedCandidate {
  match_id: string;
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

export async function getMatches(jobId: string): Promise<{ job_id: string; candidates: RankedCandidate[] }> {
  const res = await fetch(`${API_URL}/matches/${jobId}`);
  return parseJsonOrThrow(res);
}

export interface InsightCard {
  headline: string;
  matching_points: { point: string; resume_citation?: string }[];
  gaps?: string[];
}

export async function getInsightCard(matchId: string): Promise<{ match_id: string; cards: InsightCard[]; cached: boolean }> {
  const res = await fetch(`${API_URL}/insight-cards/${matchId}`);
  return parseJsonOrThrow(res);
}

export interface GithubScore {
  username: string;
  tech_stack_score: number;
  credibility_score: number;
  reasoning: string | null;
  notable_repos: string[];
  cached: boolean;
}

export async function getGithubScore(username: string): Promise<GithubScore> {
  const res = await fetch(`${API_URL}/github/${encodeURIComponent(username)}/score`);
  return parseJsonOrThrow(res);
}
