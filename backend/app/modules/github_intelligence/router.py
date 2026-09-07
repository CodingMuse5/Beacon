from fastapi import APIRouter

router = APIRouter(prefix="/github", tags=["github-intelligence"])


@router.get("/{username}/score")
async def credibility_score(username: str):
    return {
        "username": username,
        "tech_stack_score": None,
        "credibility_score": None,
    }
