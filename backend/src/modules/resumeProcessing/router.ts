import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { aiService, AiServiceUnavailableError } from "../../aiService";
import { buildCandidateEmbeddingText } from "../../embeddingText";
import { supabase } from "../../supabase";
import { extractResumeText, SUPPORTED_RESUME_MIME_TYPES } from "../../textExtraction";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!SUPPORTED_RESUME_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Upload a PDF or DOCX.`));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded. Send it under the 'file' field." });
    return;
  }

  try {
    const rawText = await extractResumeText(file.buffer, file.mimetype);
    if (!rawText.trim()) {
      res.status(422).json({ error: "Couldn't extract any text from this file." });
      return;
    }

    const storagePath = `${crypto.randomUUID()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, file.buffer, { contentType: file.mimetype });
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const parsedProfile = await aiService.parseResume(rawText);

    const embeddingText = buildCandidateEmbeddingText(parsedProfile);
    const { embedding } = await aiService.embed(embeddingText || rawText);

    const { data: candidate, error: insertError } = await supabase
      .from("candidates")
      .insert({
        full_name: parsedProfile.full_name ?? null,
        email: parsedProfile.email ?? null,
        phone: parsedProfile.phone ?? null,
        resume_storage_path: storagePath,
        raw_text: rawText,
        parsed_profile: parsedProfile,
        skills: parsedProfile.skills ?? [],
      })
      .select()
      .single();
    if (insertError) throw new Error(`Failed to save candidate: ${insertError.message}`);

    const { error: embeddingError } = await supabase
      .from("candidate_embeddings")
      .insert({ candidate_id: candidate.id, embedding });
    if (embeddingError) throw new Error(`Failed to save embedding: ${embeddingError.message}`);

    res.status(201).json({
      status: "parsed",
      candidate,
    });
  } catch (err) {
    if (err instanceof AiServiceUnavailableError) {
      res.status(503).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : "Unknown error processing resume.";
    res.status(502).json({ error: message });
  }
});

export default router;
