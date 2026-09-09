import json
from functools import lru_cache

from google import genai
from google.genai import types

from app.core.config import settings


@lru_cache
def _client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def generate_json(prompt: str, schema: dict) -> dict:
    """Send a prompt to Gemini and get back a JSON object matching schema."""
    response = _client().models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )
    return json.loads(response.text)


def embed_text(text: str) -> list[float]:
    """Embed text into a vector matching settings.embedding_dimensions."""
    response = _client().models.embed_content(
        model=settings.gemini_embedding_model,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=settings.embedding_dimensions),
    )
    return response.embeddings[0].values
