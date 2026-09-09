import { Router } from "express";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { title } = req.body ?? {};
  res.json({
    title: title ?? null,
    status: "received",
    blueprint: null,
  });
});

export default router;
