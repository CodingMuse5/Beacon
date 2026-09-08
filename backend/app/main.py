from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.explainability.router import router as explainability_router
from app.modules.github_intelligence.router import router as github_router
from app.modules.job_intelligence.router import router as jobs_router
from app.modules.matching_engine.router import router as matches_router
from app.modules.resume_processing.router import router as resumes_router

app = FastAPI(title="VStack Talent Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"], 
)

app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(matches_router)
app.include_router(github_router)
app.include_router(explainability_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
