import { Router } from "express";

const router = Router();

router.get("/:matchId", async (req, res) => {
  res.json({
    match_id: req.params.matchId,
    cards: [],
  });
});

export default router;
