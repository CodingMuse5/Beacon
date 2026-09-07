from fastapi import APIRouter

router = APIRouter(prefix="/insight-cards", tags=["explainability"])


@router.get("/{match_id}")
async def get_insight_cards(match_id: str):
    return {
        "match_id": match_id,
        "cards": [],
    }
