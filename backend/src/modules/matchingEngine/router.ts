import { Router } from "express";
import { rankCandidatesForJob } from "../../matching";

const router = Router();

router.get("/:jobId", async (req, res) => {
  try {
    const candidates = await rankCandidatesForJob(req.params.jobId);
    res.json({ job_id: req.params.jobId, candidates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error computing matches.";
    res.status(502).json({ error: message });
  }
});

export default router;
