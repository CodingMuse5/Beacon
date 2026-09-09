from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.gemini_client import generate_json

router = APIRouter(prefix="/parse-resume", tags=["resume-parsing"])

SCHEMA = {
    "type": "object",
    "properties": {
        "full_name": {"type": "string"},
        "email": {"type": "string"},
        "phone": {"type": "string"},
        "summary": {"type": "string"},
        "skills": {"type": "array", "items": {"type": "string"}},
        "work_experience": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "company": {"type": "string"},
                    "role": {"type": "string"},
                    "duration": {"type": "string"},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["company", "role"],
            },
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "institution": {"type": "string"},
                    "degree": {"type": "string"},
                    "year": {"type": "string"},
                },
                "required": ["institution"],
            },
        },
    },
    "required": ["skills", "summary"],
}


class ParseResumeIn(BaseModel):
    raw_text: str


@router.post("")
async def parse_resume(payload: ParseResumeIn) -> dict[str, Any]:
    prompt = (
        "You are a resume parser. Extract structured information from the resume text "
        "below. If a field isn't present in the text, omit it. Do not invent information "
        "that isn't stated or clearly implied.\n\n"
        f"RESUME TEXT:\n{payload.raw_text}"
    )
    return generate_json(prompt, SCHEMA)
