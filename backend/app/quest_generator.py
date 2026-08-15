import json

from google.genai import types

from .gemini_client import MODEL_NAME
from .gemini_client import get_client as get_gemini_client
from .retrieval import format_retrieved_chunks, retrieve
from .schemas import GeneratedQuest
from .supabase_client import get_client as get_supabase_client

ALLOWED_QUEST_TYPES = {"cleanup", "awareness", "survey", "other"}
ALLOWED_QUEST_STATUSES = {"active", "draft", "completed", "archived"}

DEFAULT_COMMUNITY_ID = "40fc5626-ea42-4611-8882-da6c971c75b3"

SYSTEM_PROMPT_TEMPLATE = """You turn a reported community sustainability issue into ONE actionable \
community quest, grounded in the reference material below where relevant.

Respond with ONLY a JSON object shaped exactly like this, no other text:
{{
  "title": "short, specific quest title",
  "description": "1-3 sentences describing the concrete action volunteers should take",
  "quest_type": "one of: cleanup, awareness, survey, other",
  "status": "active",
  "points_reward": integer between 10 and 100, higher for higher severity issues,
  "community_id": "{community_id}"
}}

Reference material:
{knowledge}
"""


class InvalidGeneratedQuest(ValueError):
    """Raised when Gemini returns a quest that fails validation."""


def build_retrieval_query(issue: dict) -> str:
    category = issue.get("issue_categories") or {}
    parts = [
        issue.get("title"),
        issue.get("description"),
        category.get("name") if isinstance(category, dict) else None,
        issue.get("severity"),
    ]
    return " ".join(part for part in parts if part)


def _validate_quest(quest: dict) -> None:
    if quest.get("quest_type") not in ALLOWED_QUEST_TYPES:
        raise InvalidGeneratedQuest(f"Invalid quest_type: {quest.get('quest_type')!r}")
    if quest.get("status") not in ALLOWED_QUEST_STATUSES:
        raise InvalidGeneratedQuest(f"Invalid status: {quest.get('status')!r}")


def generate_quest_for_issue(issue: dict) -> dict:
    """Retrieve sustainability context for the issue, ask Gemini for a quest, validate it."""
    query = build_retrieval_query(issue)
    knowledge = format_retrieved_chunks(retrieve(query, top_k=5))

    category = issue.get("issue_categories") or {}
    issue_summary = (
        f"Issue title: {issue.get('title')}\n"
        f"Description: {issue.get('description')}\n"
        f"Category: {category.get('name') if isinstance(category, dict) else 'Unknown'}\n"
        f"Severity: {issue.get('severity')}"
    )

    response = get_gemini_client().models.generate_content(
        model=MODEL_NAME,
        contents=issue_summary,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT_TEMPLATE.format(
                community_id=DEFAULT_COMMUNITY_ID,
                knowledge=knowledge or "(no reference documents available)",
            ),
            response_mime_type="application/json",
            response_schema=GeneratedQuest,
        ),
    )

    quest = response.parsed if response.parsed is not None else GeneratedQuest(**json.loads(response.text))
    quest_dict = quest.model_dump()
    # Never trust the model for the community id — always the real one.
    quest_dict["community_id"] = DEFAULT_COMMUNITY_ID

    _validate_quest(quest_dict)
    return quest_dict


def insert_quest(quest: dict) -> dict:
    response = get_supabase_client().table("quests").insert(quest).execute()
    return response.data[0]
