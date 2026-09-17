import { Router } from "express";
import { aiService } from "../../aiService";
import { fetchGithubProfile, fetchGithubRepos, GithubNotFoundError } from "../../githubClient";
import { supabase } from "../../supabase";

const router = Router();

router.get("/:username/score", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();

  try {
    const { data: cached, error: cacheError } = await supabase
      .from("github_profiles")
      .select("tech_stack_score, credibility_score, raw_data")
      .eq("username", username)
      .maybeSingle();
    if (cacheError) throw new Error(`Failed to check GitHub profile cache: ${cacheError.message}`);

    if (cached) {
      res.json({
        username,
        tech_stack_score: cached.tech_stack_score,
        credibility_score: cached.credibility_score,
        reasoning: (cached.raw_data as { reasoning?: string })?.reasoning ?? null,
        notable_repos: (cached.raw_data as { notable_repos?: string[] })?.notable_repos ?? [],
        cached: true,
      });
      return;
    }

    const [profile, repos] = await Promise.all([fetchGithubProfile(username), fetchGithubRepos(username)]);
    const score = await aiService.githubScore(username, profile, repos);

    const { error: insertError } = await supabase.from("github_profiles").insert({
      username,
      tech_stack_score: score.tech_stack_score,
      credibility_score: score.credibility_score,
      raw_data: score,
    });
    if (insertError) throw new Error(`Failed to save GitHub score: ${insertError.message}`);

    res.json({ username, ...score, cached: false });
  } catch (err) {
    if (err instanceof GithubNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : "Unknown error scoring GitHub profile.";
    res.status(502).json({ error: message });
  }
});

export default router;
