from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.gemini_client import generate_json

router = APIRouter(prefix="/parse-job", tags=["job-parsing"])

SCHEMA = {
    "type": "object",
    "properties": {
        "seniority": {"type": "string"},
        "summary": {"type": "string"},
        "required_skills": {"type": "array", "items": {"type": "string"}},
        "nice_to_have_skills": {"type": "array", "items": {"type": "string"}},
        "responsibilities": {"type": "array", "items": {"type": "string"}},
        "min_years_experience": {"type": "integer"},
    },
    "required": ["required_skills", "summary"],
}


class ParseJobIn(BaseModel):
    title: str
    raw_text: str


@router.post("")
async def parse_job(payload: ParseJobIn) -> dict[str, Any]:
    prompt = (
        "You are a job description parser. Extract a structured 'Job Blueprint' from the "
        "job description below. Distinguish clearly required skills from nice-to-have ones. "
        "Do not invent requirements that aren't stated or clearly implied.\n\n"
        f"JOB TITLE: {payload.title}\n\nJOB DESCRIPTION:\n{payload.raw_text}"
    )
    return generate_json(prompt, SCHEMA)
