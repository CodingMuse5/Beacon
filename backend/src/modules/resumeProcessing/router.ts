import { Router } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  res.json({
    filename: req.file?.originalname ?? null,
    status: "received",
    parsed_profile: null,
  });
});

export default router;
