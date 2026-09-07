from fastapi import APIRouter

router = APIRouter(prefix="/matches", tags=["matching-engine"])


@router.get("/{job_id}")
async def ranked_queue(job_id: str):
    return {
        "job_id": job_id,
        "candidates": [],
    }
