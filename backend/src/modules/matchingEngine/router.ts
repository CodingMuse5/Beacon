import { Router } from "express";
import { rankCandidatesForJob } from "../../matching";

const router = Router();

router.get("/:jobId", async (req, res) => {
  try {
    const candidates = await rankCandidatesForJob(req.params.jobId);
    res.json({ job_id: req.params.jobId, candidates });
  } catch (err) {
    console.error("[matches/:jobId]", err);
    res.status(502).json({ error: "Something went wrong while finding matches for this job. Please try again." });
  }
});

export default router;
