import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.quest_participation import (
    DEFAULT_USER_ID,
    AlreadyJoined,
    QuestNotFound,
    accept_quest,
    fetch_my_quests,
)

client = TestClient(app)

QUEST_ID = "c1a587e9-e007-4ad6-a97e-5868096cb22d"


def _mock_supabase_client(*, quest_exists: bool, already_joined: bool, inserted_row: dict | None = None):
    """Fake supabase client. Returns (client, quests_table_mock, participants_table_mock)
    so tests can assert on exactly what was called, since .table() always returns the
    same mock per table name (not a fresh one each call)."""
    quests_table = MagicMock()
    participants_table = MagicMock()

    mock_client = MagicMock()
    mock_client.table.side_effect = lambda name: {
        "quests": quests_table,
        "quest_participants": participants_table,
    }[name]

    quests_table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = (
        [{"id": QUEST_ID, "title": "Some quest"}] if quest_exists else []
    )

    participants_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = (
        [{"id": "existing-participation"}] if already_joined else []
    )

    participants_table.insert.return_value.execute.return_value.data = [inserted_row] if inserted_row else []

    return mock_client, quests_table, participants_table


def test_accept_quest_success():
    inserted_row = {
        "id": "new-participation-id",
        "quest_id": QUEST_ID,
        "user_id": DEFAULT_USER_ID,
        "status": "joined",
        "progress_percent": 0,
        "points_awarded": 0,
    }
    mock_client, _, participants_table = _mock_supabase_client(
        quest_exists=True, already_joined=False, inserted_row=inserted_row
    )

    with patch("app.quest_participation.get_client", return_value=mock_client):
        result = accept_quest(QUEST_ID)

    assert result == inserted_row
    participants_table.insert.assert_called_once_with(
        {
            "quest_id": QUEST_ID,
            "user_id": DEFAULT_USER_ID,
            "status": "joined",
            "progress_percent": 0,
            "points_awarded": 0,
        }
    )


def test_accept_quest_raises_when_quest_missing():
    mock_client, _, participants_table = _mock_supabase_client(quest_exists=False, already_joined=False)
    with patch("app.quest_participation.get_client", return_value=mock_client):
        with pytest.raises(QuestNotFound):
            accept_quest(QUEST_ID)
    participants_table.insert.assert_not_called()


def test_accept_quest_raises_when_already_joined():
    mock_client, _, participants_table = _mock_supabase_client(quest_exists=True, already_joined=True)
    with patch("app.quest_participation.get_client", return_value=mock_client):
        with pytest.raises(AlreadyJoined):
            accept_quest(QUEST_ID)
    participants_table.insert.assert_not_called()


def test_accept_quest_endpoint_success():
    participation = {"id": "new-participation-id", "quest_id": QUEST_ID, "status": "joined"}
    with patch("app.main.accept_quest", return_value=participation) as mock_accept:
        response = client.post(f"/quests/{QUEST_ID}/accept")

        assert response.status_code == 200
        assert response.json() == participation
        mock_accept.assert_called_once_with(QUEST_ID)


def test_accept_quest_endpoint_quest_not_found():
    with patch("app.main.accept_quest", side_effect=QuestNotFound(QUEST_ID)):
        response = client.post(f"/quests/{QUEST_ID}/accept")
        assert response.status_code == 404


def test_accept_quest_endpoint_already_joined():
    with patch("app.main.accept_quest", side_effect=AlreadyJoined(QUEST_ID)):
        response = client.post(f"/quests/{QUEST_ID}/accept")
        assert response.status_code == 409


def test_accept_quest_endpoint_supabase_error():
    with patch("app.main.accept_quest", side_effect=RuntimeError("boom")):
        response = client.post(f"/quests/{QUEST_ID}/accept")
        assert response.status_code == 503


def test_fetch_my_quests_maps_joined_rows():
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {
            "status": "joined",
            "progress_percent": 0,
            "points_awarded": 0,
            "quests": {
                "id": QUEST_ID,
                "title": "Park Entrance Litter Cleanup",
                "description": "Clean it up.",
                "quest_type": "cleanup",
                "points_reward": 30,
            },
        }
    ]

    with patch("app.quest_participation.get_client", return_value=mock_client):
        result = fetch_my_quests()

    mock_client.table.assert_called_once_with("quest_participants")
    mock_client.table.return_value.select.return_value.eq.assert_called_once_with(
        "user_id", DEFAULT_USER_ID
    )
    assert result == [
        {
            "quest_id": QUEST_ID,
            "title": "Park Entrance Litter Cleanup",
            "description": "Clean it up.",
            "quest_type": "cleanup",
            "points_reward": 30,
            "participation_status": "joined",
            "progress_percent": 0,
            "points_awarded": 0,
        }
    ]


def test_fetch_my_quests_empty_when_none_joined():
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    with patch("app.quest_participation.get_client", return_value=mock_client):
        result = fetch_my_quests()

    assert result == []


def test_my_quests_endpoint_success():
    quests = [
        {
            "quest_id": QUEST_ID,
            "title": "Some quest",
            "description": "A quest",
            "quest_type": "cleanup",
            "points_reward": 30,
            "participation_status": "joined",
            "progress_percent": 0,
            "points_awarded": 0,
        }
    ]
    with patch("app.main.fetch_my_quests", return_value=quests):
        response = client.get("/quests/my")
        assert response.status_code == 200
        assert response.json() == quests


def test_my_quests_endpoint_empty_list():
    with patch("app.main.fetch_my_quests", return_value=[]):
        response = client.get("/quests/my")
        assert response.status_code == 200
        assert response.json() == []


def test_my_quests_endpoint_supabase_error():
    with patch("app.main.fetch_my_quests", side_effect=RuntimeError("boom")):
        response = client.get("/quests/my")
        assert response.status_code == 503
