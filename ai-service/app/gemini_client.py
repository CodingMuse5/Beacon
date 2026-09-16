import json
import time
from functools import lru_cache
from typing import Callable, TypeVar

from google import genai
from google.genai import errors, types

from app.core.config import settings

T = TypeVar("T")

# Gemini occasionally returns transient errors (503 "model overloaded", 429 rate
# limits) that resolve on their own within seconds. Retrying with backoff rides
# those out instead of failing the whole resume/job parse on a momentary blip.
RETRYABLE_CODES = {429, 500, 503}
RETRY_DELAYS_SECONDS = [2, 5, 10]


@lru_cache
def _client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def _with_retry(call: Callable[[], T]) -> T:
    last_error: errors.APIError | None = None
    for attempt, delay in enumerate([*RETRY_DELAYS_SECONDS, None]):
        try:
            return call()
        except errors.APIError as err:
            if err.code not in RETRYABLE_CODES or delay is None:
                raise
            last_error = err
            time.sleep(delay)
    raise last_error  # pragma: no cover - unreachable, satisfies type checker


def generate_json(prompt: str, schema: dict) -> dict:
    """Send a prompt to Gemini and get back a JSON object matching schema."""

    def call() -> dict:
        response = _client().models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return json.loads(response.text)

    return _with_retry(call)


def embed_text(text: str) -> list[float]:
    """Embed text into a vector matching settings.embedding_dimensions."""

    def call() -> list[float]:
        response = _client().models.embed_content(
            model=settings.gemini_embedding_model,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=settings.embedding_dimensions),
        )
        return response.embeddings[0].values

    return _with_retry(call)
