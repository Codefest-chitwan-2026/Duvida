import json
import os

from google import genai
from google.genai import types

from .schemas import ChatReply

MODEL_NAME = "gemini-flash-latest"

_client: genai.Client | None = None

SYSTEM_PROMPT_TEMPLATE = """You are EcoBot, a friendly AI sustainability advisor inside a
community app that lets citizens report local issues, complete sustainability quests, and
earn vouchers for verified positive impact.

Ground factual claims in the reference material below. If the question is unrelated to
sustainability, community issues, or civic action, answer exactly: "I don't know based on the
available sustainability documents." Return no quests in that case.

Keep answers concise and practical. Propose zero to three short, concrete quests when they are
relevant to the user's question.

Reference material:
{knowledge}
"""


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def ask_ecobot(user_message: str, knowledge: str) -> ChatReply:
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_TEMPLATE.format(
                knowledge=knowledge or "(no reference documents are currently available)"
            ),
            response_mime_type="application/json",
            response_schema=ChatReply,
        ),
    )

    if response.parsed is not None:
        return response.parsed
    return ChatReply(**json.loads(response.text))
