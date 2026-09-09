from fastapi import APIRouter
from pydantic import BaseModel

from app.gemini_client import embed_text

router = APIRouter(prefix="/embed", tags=["embedding"])


class EmbedIn(BaseModel):
    text: str


class EmbedOut(BaseModel):
    embedding: list[float]


@router.post("")
async def embed(payload: EmbedIn) -> EmbedOut:
    return EmbedOut(embedding=embed_text(payload.text))
