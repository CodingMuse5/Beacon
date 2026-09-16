import { Router } from "express";
import { aiService } from "../../aiService";
import { supabase } from "../../supabase";

const router = Router();

router.get("/:matchId", async (req, res) => {
  const { matchId } = req.params;

  try {
    const { data: cached, error: cacheError } = await supabase
      .from("insight_cards")
      .select("content")
      .eq("match_id", matchId)
      .maybeSingle();
    if (cacheError) throw new Error(`Failed to check insight card cache: ${cacheError.message}`);

    if (cached) {
      res.json({ match_id: matchId, cards: [cached.content], cached: true });
      return;
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("job_id, candidate_id, score")
      .eq("id", matchId)
      .single();
    if (matchError) throw new Error(`Match not found: ${matchError.message}`);

    const [{ data: job, error: jobError }, { data: candidate, error: candidateError }] = await Promise.all([
      supabase.from("jobs").select("blueprint").eq("id", match.job_id).single(),
      supabase.from("candidates").select("parsed_profile").eq("id", match.candidate_id).single(),
    ]);
    if (jobError) throw new Error(`Job not found: ${jobError.message}`);
    if (candidateError) throw new Error(`Candidate not found: ${candidateError.message}`);

    const insightCard = await aiService.insightCard(candidate.parsed_profile, job.blueprint, match.score);

    const { error: insertError } = await supabase
      .from("insight_cards")
      .insert({ match_id: matchId, content: insightCard });
    if (insertError) throw new Error(`Failed to save insight card: ${insertError.message}`);

    res.json({ match_id: matchId, cards: [insightCard], cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error generating insight card.";
    res.status(502).json({ error: message });
  }
});

export default router;
