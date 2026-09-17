import { config } from "./config";

const GITHUB_API = "https://api.github.com";

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
  topics: string[];
}

class GithubNotFoundError extends Error {}

async function githubFetch(path: string): Promise<unknown> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(config.githubToken ? { Authorization: `Bearer ${config.githubToken}` } : {}),
    },
  });

  if (res.status === 404) throw new GithubNotFoundError("GitHub user not found.");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchGithubProfile(username: string): Promise<GithubProfile> {
  const data = (await githubFetch(`/users/${encodeURIComponent(username)}`)) as Record<string, unknown>;
  return {
    login: data.login as string,
    name: (data.name as string) ?? null,
    bio: (data.bio as string) ?? null,
    public_repos: (data.public_repos as number) ?? 0,
    followers: (data.followers as number) ?? 0,
    created_at: data.created_at as string,
  };
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const data = (await githubFetch(
    `/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=30`,
  )) as Record<string, unknown>[];

  return data.slice(0, 20).map((repo) => ({
    name: repo.name as string,
    description: (repo.description as string) ?? null,
    language: (repo.language as string) ?? null,
    stargazers_count: (repo.stargazers_count as number) ?? 0,
    fork: (repo.fork as boolean) ?? false,
    pushed_at: repo.pushed_at as string,
    topics: (repo.topics as string[]) ?? [],
  }));
}

export { GithubNotFoundError };
