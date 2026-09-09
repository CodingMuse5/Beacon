import { Router } from "express";

const router = Router();

router.get("/:username/score", async (req, res) => {
  res.json({
    username: req.params.username,
    tech_stack_score: null,
    credibility_score: null,
  });
});

export default router;
