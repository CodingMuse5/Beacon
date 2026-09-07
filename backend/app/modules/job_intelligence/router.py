from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["job-intelligence"])


class JobDescriptionIn(BaseModel):
    title: str
    raw_text: str


@router.post("/analyze")
async def analyze_job_description(payload: JobDescriptionIn):
    return {
        "title": payload.title,
        "status": "received",
        "blueprint": None,
    }
