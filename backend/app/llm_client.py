import json
import os

from openai import OpenAI

from .schemas import ChatReply

_client: OpenAI | None = None

# Groq's OpenAI-compatible endpoint — swapping providers later is a base_url
# + api_key + MODEL_NAME change here, not a rewrite of the callers.
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MODEL_NAME = "llama-3.3-70b-versatile"

SYSTEM_PROMPT_TEMPLATE = """You are EcoBot, a friendly AI sustainability advisor inside a \
community app that lets citizens report local issues, complete sustainability quests, and \
earn tokens for verified positive impact.

Ground your factual claims in the reference material below. If the question is unrelated to \
sustainability, community issues, or civic action, respond with exactly this answer and \
nothing else: "I don't know based on the available sustainability documents." Set quests to \
an empty list in that case.

Keep answers concise and practical. Also propose 0-3 short, concrete "quests" the user could \
complete based on their question (skip quests entirely if none are relevant, e.g. small talk \
or a question you don't know the answer to).

Respond with ONLY a JSON object shaped exactly like this, no other text:
{{
  "answer": "your concise, practical answer",
  "quests": [
    {{"title": "short quest title", "description": "1-2 sentence description"}}
  ]
}}

Reference material:
{knowledge}
"""


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ["GROQ_API_KEY"]
        _client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
    return _client


def ask_ecobot(user_message: str, knowledge: str) -> ChatReply:
    client = get_client()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        knowledge=knowledge or "(no reference documents loaded yet)"
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )

    return ChatReply(**json.loads(response.choices[0].message.content))
