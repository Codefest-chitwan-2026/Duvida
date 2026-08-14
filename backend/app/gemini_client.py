import json
import os

from google import genai
from google.genai import types

from .schemas import ChatReply

_client: genai.Client | None = None

MODEL_NAME = "gemini-flash-latest"

SYSTEM_PROMPT_TEMPLATE = """You are EcoBot, a friendly AI sustainability advisor inside a \
community app that lets citizens report local issues, complete sustainability quests, and \
earn tokens for verified positive impact.

Ground your factual claims in the reference material below when it is relevant to the \
question. If the reference material doesn't cover something, answer from general \
sustainability knowledge instead of refusing.

Keep answers concise and practical. Also propose 0-3 short, concrete "quests" the user could \
complete based on their question (skip quests entirely if none are relevant, e.g. small talk).

Reference material:
{knowledge}
"""


def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ["GEMINI_API_KEY"]
        _client = genai.Client(api_key=api_key)
    return _client


def ask_ecobot(user_message: str, knowledge: str) -> ChatReply:
    client = get_client()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        knowledge=knowledge or "(no reference documents loaded yet)"
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=ChatReply,
        ),
    )

    if response.parsed is not None:
        return response.parsed
    return ChatReply(**json.loads(response.text))
