from typing import List, Optional

from .supabase_client import get_client

# No auth system exists in this project yet (see the Supabase architecture
# analysis — no sign-in flow, no session/user-id source anywhere). Same
# placeholder pattern as DEFAULT_COMMUNITY_ID in quest_generator.py: a real
# profile id, standing in for "the current authenticated user" until real
# auth is wired up.
DEFAULT_USER_ID = "cc7f660b-1d6b-4ca9-8363-cea9e3681356"


class QuestNotFound(Exception):
    pass


class AlreadyJoined(Exception):
    pass


def fetch_quest_by_id(quest_id: str) -> Optional[dict]:
    response = get_client().table("quests").select("*").eq("id", quest_id).limit(1).execute()
    return response.data[0] if response.data else None


def has_already_joined(quest_id: str, user_id: str) -> bool:
    response = (
        get_client()
        .table("quest_participants")
        .select("id")
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return len(response.data) > 0


def accept_quest(quest_id: str) -> dict:
    """Join the current user to a quest. Raises QuestNotFound / AlreadyJoined."""
    user_id = DEFAULT_USER_ID

    if fetch_quest_by_id(quest_id) is None:
        raise QuestNotFound(quest_id)

    if has_already_joined(quest_id, user_id):
        raise AlreadyJoined(quest_id)

    row = {
        "quest_id": quest_id,
        "user_id": user_id,
        "status": "joined",
        "progress_percent": 0,
        "points_awarded": 0,
    }
    response = get_client().table("quest_participants").insert(row).execute()
    return response.data[0]


def fetch_my_quests() -> List[dict]:
    """Quests the current user has joined, most recently generated quest fields included."""
    response = (
        get_client()
        .table("quest_participants")
        .select("status,progress_percent,points_awarded,quests(id,title,description,quest_type,points_reward)")
        .eq("user_id", DEFAULT_USER_ID)
        .execute()
    )

    results: List[dict] = []
    for row in response.data:
        quest = row.get("quests") or {}
        results.append(
            {
                "quest_id": quest.get("id"),
                "title": quest.get("title"),
                "description": quest.get("description"),
                "quest_type": quest.get("quest_type"),
                "points_reward": quest.get("points_reward"),
                "participation_status": row["status"],
                "progress_percent": row["progress_percent"],
                "points_awarded": row["points_awarded"],
            }
        )
    return results
