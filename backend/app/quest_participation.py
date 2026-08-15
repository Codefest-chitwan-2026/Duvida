from datetime import datetime, timezone
from typing import List, Optional

from .supabase_client import get_client

# No auth system exists in this project yet (see the Supabase architecture
# analysis — no sign-in flow, no session/user-id source anywhere). Same
# placeholder pattern as DEFAULT_COMMUNITY_ID in quest_generator.py: a real
# profile id, standing in for "the current authenticated user" until real
# auth is wired up. profiles.id has an FK to auth.users.id (enforced), so
# this can't just be any UUID — it was minted via
# report_submission.register_guest_reporter(), the same admin-API flow used
# for guest report submitters.
DEFAULT_USER_ID = "2efd6a4e-dbca-48a3-abc4-33f576db1b5a"

# Created manually in the Supabase dashboard, not by this code.
PROOF_BUCKET = "quest-proofs"


class QuestNotFound(Exception):
    pass


class AlreadyJoined(Exception):
    pass


class QuestNotAccepted(Exception):
    pass


class QuestNotStarted(Exception):
    pass


class QuestNotSubmitted(Exception):
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


def start_quest(quest_id: str) -> dict:
    """Mark an already-accepted quest as in progress. Raises QuestNotAccepted if not joined."""
    user_id = DEFAULT_USER_ID

    if not has_already_joined(quest_id, user_id):
        raise QuestNotAccepted(quest_id)

    response = (
        get_client()
        .table("quest_participants")
        .update({"status": "in_progress", "progress_percent": 50})
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0]


def find_participation(quest_id: str, user_id: str) -> Optional[dict]:
    response = (
        get_client()
        .table("quest_participants")
        .select("*")
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def submit_quest(quest_id: str) -> dict:
    """Submit an in-progress quest for review. Raises QuestNotFound / QuestNotStarted."""
    user_id = DEFAULT_USER_ID

    participation = find_participation(quest_id, user_id)
    if participation is None:
        raise QuestNotFound(quest_id)

    if participation["status"] != "in_progress":
        raise QuestNotStarted(quest_id)

    response = (
        get_client()
        .table("quest_participants")
        .update({"status": "submitted", "progress_percent": 80})
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0]


def upload_quest_proof(
    quest_id: str, filename: str, file_bytes: bytes, content_type: Optional[str]
) -> dict:
    """Upload a proof photo for an in-progress quest and mark it submitted.

    Raises QuestNotFound / QuestNotStarted.
    """
    user_id = DEFAULT_USER_ID

    participation = find_participation(quest_id, user_id)
    if participation is None:
        raise QuestNotFound(quest_id)

    if participation["status"] != "in_progress":
        raise QuestNotStarted(quest_id)

    storage_path = f"{user_id}/{quest_id}/{filename}"
    file_options = {"content-type": content_type} if content_type else None
    get_client().storage.from_(PROOF_BUCKET).upload(storage_path, file_bytes, file_options)

    response = (
        get_client()
        .table("quest_participants")
        .update({"proof_media_path": storage_path, "status": "submitted", "progress_percent": 80})
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0]


def verify_quest(quest_id: str) -> dict:
    """Mark a submitted quest as completed and award its points.

    No admin/reviewer system exists yet — for the hackathon demo this simply
    completes the quest outright. Raises QuestNotFound / QuestNotSubmitted.
    """
    user_id = DEFAULT_USER_ID

    participation = find_participation(quest_id, user_id)
    if participation is None:
        raise QuestNotFound(quest_id)

    if participation["status"] != "submitted":
        raise QuestNotSubmitted(quest_id)

    quest = fetch_quest_by_id(quest_id) or {}
    points_reward = quest.get("points_reward") or 0

    response = (
        get_client()
        .table("quest_participants")
        .update(
            {
                "status": "completed",
                "progress_percent": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "points_awarded": points_reward,
            }
        )
        .eq("quest_id", quest_id)
        .eq("user_id", user_id)
        .execute()
    )
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
