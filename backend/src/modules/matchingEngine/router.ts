import { Router } from "express";

const router = Router();

router.get("/:jobId", async (req, res) => {
  res.json({
    job_id: req.params.jobId,
    candidates: [],
  });
});

export default router;
