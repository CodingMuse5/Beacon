import json
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.gemini_client import generate_json

router = APIRouter(prefix="/insight-card", tags=["explainability"])

SCHEMA = {
    "type": "object",
    "properties": {
        "headline": {"type": "string"},
        "matching_points": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "point": {"type": "string"},
                    "resume_citation": {"type": "string"},
                },
                "required": ["point"],
            },
        },
        "gaps": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["headline", "matching_points"],
}


class InsightCardIn(BaseModel):
    candidate_profile: dict[str, Any]
    job_blueprint: dict[str, Any]
    score: float


@router.post("")
async def generate_insight_card(payload: InsightCardIn) -> dict[str, Any]:
    prompt = (
        "You are explaining why a candidate matches a job to a recruiter, so they can "
        "trust and verify an AI-ranked shortlist. Given the candidate profile and job "
        "blueprint below, write a short headline and a list of concrete matching points, "
        "each backed by a citation from the candidate's resume data (e.g. a specific job "
        "title, project, or skill they listed). Also note any real gaps. Do not invent "
        "citations that aren't present in the candidate profile.\n\n"
        f"MATCH SCORE: {payload.score}\n\n"
        f"CANDIDATE PROFILE:\n{json.dumps(payload.candidate_profile)}\n\n"
        f"JOB BLUEPRINT:\n{json.dumps(payload.job_blueprint)}"
    )
    return generate_json(prompt, SCHEMA)
