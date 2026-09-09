import cors from "cors";
import express from "express";
import { config } from "./config";
import explainabilityRouter from "./modules/explainability/router";
import githubIntelligenceRouter from "./modules/githubIntelligence/router";
import jobIntelligenceRouter from "./modules/jobIntelligence/router";
import matchingEngineRouter from "./modules/matchingEngine/router";
import resumeProcessingRouter from "./modules/resumeProcessing/router";

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

app.use("/resumes", resumeProcessingRouter);
app.use("/jobs", jobIntelligenceRouter);
app.use("/matches", matchingEngineRouter);
app.use("/github", githubIntelligenceRouter);
app.use("/insight-cards", explainabilityRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Beacon backend listening on http://localhost:${config.port}`);
});
