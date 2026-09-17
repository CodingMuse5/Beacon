import { Router } from "express";
import { aiService, AiServiceUnavailableError } from "../../aiService";
import { buildJobEmbeddingText } from "../../embeddingText";
import { supabase } from "../../supabase";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { title, raw_text: rawText } = req.body ?? {};
  if (!title || !rawText) {
    res.status(400).json({ error: "Both 'title' and 'raw_text' are required." });
    return;
  }

  try {
    const blueprint = await aiService.parseJob(title, rawText);

    const embeddingText = buildJobEmbeddingText(blueprint);
    const { embedding } = await aiService.embed(embeddingText || rawText);

    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        title,
        raw_text: rawText,
        blueprint,
        embedding,
      })
      .select()
      .single();
    if (insertError) throw new Error(`Failed to save job: ${insertError.message}`);

    res.status(201).json({
      status: "parsed",
      job,
    });
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) {
      res.status(503).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : "Unknown error processing job description.";
    res.status(502).json({ error: message });
  }
});

export default router;
