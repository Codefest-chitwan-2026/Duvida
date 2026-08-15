"""Deterministic, offline answers for simple/common questions — no LLM call.

This module is just the matching engine. Rules and content live in
backend/data/sustainability_local_responses.json — edit that file to add or
change canned answers, no code changes needed.

Only intents with mode == "static" are matched here. Intents with
mode == "guided" (multi-step conversations, see the JSON's "guided_flows")
are recognized in the data but intentionally NOT actionable yet, so they
fall through to the RAG -> LLM flow in main.py like anything else unmatched.
"""

import json
import pathlib
from typing import List, NamedTuple, Optional, TypedDict

DATA_PATH = pathlib.Path(__file__).resolve().parent.parent / "data" / "sustainability_local_responses.json"


class _Quest(TypedDict):
    title: str
    description: str


class _Reply(TypedDict):
    answer: str
    quests: List[_Quest]


class _Rule(NamedTuple):
    triggers: List[str]
    reply: _Reply


def _load_rules() -> List[_Rule]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    rules: List[_Rule] = []

    for intent in data.get("intents", []):
        if intent.get("mode") != "static":
            continue  # e.g. "guided" intents — not actionable yet, let them fall through to RAG

        quests: List[_Quest] = [
            {"title": quest["title"], "description": quest["description"]}
            for quest in intent.get("quests", [])
        ]
        rules.append(
            _Rule(
                triggers=intent["triggers"],
                reply={"answer": intent["answer"], "quests": quests},
            )
        )

    return rules


_RULES: List[_Rule] = _load_rules()


def match_local_response(message: str) -> Optional[_Reply]:
    """Return a canned reply if the message matches a simple/common pattern, else None."""
    lowered = message.lower()
    for rule in _RULES:
        if any(trigger in lowered for trigger in rule.triggers):
            return rule.reply
    return None
