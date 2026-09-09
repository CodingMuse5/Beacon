import json
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.gemini_client import generate_json

router = APIRouter(prefix="/github-score", tags=["github-intelligence"])

SCHEMA = {
    "type": "object",
    "properties": {
        "tech_stack_score": {"type": "number"},
        "credibility_score": {"type": "number"},
        "reasoning": {"type": "string"},
        "notable_repos": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["tech_stack_score", "credibility_score", "reasoning"],
}


class GithubScoreIn(BaseModel):
    username: str
    profile: dict[str, Any]
    repos: list[dict[str, Any]]


@router.post("")
async def score_github_profile(payload: GithubScoreIn) -> dict[str, Any]:
    prompt = (
        "You are assessing a candidate's technical credibility from their GitHub activity, "
        "for a recruiter vetting a shortlist. Given the profile and repository data below, "
        "score them 0-100 on: tech_stack_score (breadth/depth of technologies genuinely "
        "used, judged from repo languages and descriptions, not just listed) and "
        "credibility_score (signs of real, sustained, original work vs forked tutorials or "
        "abandoned projects). Explain your reasoning briefly and list which repos most "
        "influenced your judgment.\n\n"
        f"GITHUB USERNAME: {payload.username}\n\n"
        f"PROFILE:\n{json.dumps(payload.profile)}\n\n"
        f"REPOSITORIES:\n{json.dumps(payload.repos)}"
    )
    return generate_json(prompt, SCHEMA)
