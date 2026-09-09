from fastapi import FastAPI

from app.routers.embedding import router as embedding_router
from app.routers.github import router as github_router
from app.routers.insight import router as insight_router
from app.routers.job import router as job_router
from app.routers.resume import router as resume_router

app = FastAPI(title="VStack AI Service")

app.include_router(resume_router)
app.include_router(job_router)
app.include_router(embedding_router)
app.include_router(insight_router)
app.include_router(github_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
