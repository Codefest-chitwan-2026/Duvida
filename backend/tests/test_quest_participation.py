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
    QuestNotAccepted,
    QuestNotFound,
    QuestNotStarted,
    accept_quest,
    fetch_my_quests,
    start_quest,
    submit_quest,
)

client = TestClient(app)

QUEST_ID = "c1a587e9-e007-4ad6-a97e-5868096cb22d"


def _mock_supabase_client(
    *,
    quest_exists: bool,
    already_joined: bool,
    inserted_row: dict | None = None,
    updated_row: dict | None = None,
    participation_row: dict | None = None,
):
    """Fake supabase client. Returns (client, quests_table_mock, participants_table_mock)
    so tests can assert on exactly what was called, since .table() always returns the
    same mock per table name (not a fresh one each call).

    participation_row, if given, overrides what the participants select().eq().eq()
    chain returns (used by find_participation / submit_quest) — otherwise it falls
    back to the already_joined boolean (used by has_already_joined)."""
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

    if participation_row is not None:
        select_data = [participation_row]
    else:
        select_data = [{"id": "existing-participation"}] if already_joined else []
    participants_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = (
        select_data
    )

    participants_table.insert.return_value.execute.return_value.data = [inserted_row] if inserted_row else []

    participants_table.update.return_value.eq.return_value.eq.return_value.execute.return_value.data = (
        [updated_row] if updated_row else []
    )

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


def test_start_quest_success():
    updated_row = {
        "id": "existing-participation",
        "quest_id": QUEST_ID,
        "user_id": DEFAULT_USER_ID,
        "status": "in_progress",
        "progress_percent": 50,
    }
    mock_client, _, participants_table = _mock_supabase_client(
        quest_exists=True, already_joined=True, updated_row=updated_row
    )

    with patch("app.quest_participation.get_client", return_value=mock_client):
        result = start_quest(QUEST_ID)

    assert result == updated_row
    participants_table.update.assert_called_once_with({"status": "in_progress", "progress_percent": 50})
    update_eq_chain = participants_table.update.return_value.eq
    update_eq_chain.assert_called_once_with("quest_id", QUEST_ID)
    update_eq_chain.return_value.eq.assert_called_once_with("user_id", DEFAULT_USER_ID)


def test_start_quest_raises_when_not_accepted():
    mock_client, _, participants_table = _mock_supabase_client(quest_exists=True, already_joined=False)
    with patch("app.quest_participation.get_client", return_value=mock_client):
        with pytest.raises(QuestNotAccepted):
            start_quest(QUEST_ID)
    participants_table.update.assert_not_called()


def test_start_quest_endpoint_success():
    participation = {"id": "existing-participation", "status": "in_progress", "progress_percent": 50}
    with patch("app.main.start_quest", return_value=participation) as mock_start:
        response = client.post(f"/quests/{QUEST_ID}/start")

        assert response.status_code == 200
        assert response.json() == participation
        mock_start.assert_called_once_with(QUEST_ID)


def test_start_quest_endpoint_not_accepted():
    with patch("app.main.start_quest", side_effect=QuestNotAccepted(QUEST_ID)):
        response = client.post(f"/quests/{QUEST_ID}/start")
        assert response.status_code == 404


def test_start_quest_endpoint_supabase_error():
    with patch("app.main.start_quest", side_effect=RuntimeError("boom")):
        response = client.post(f"/quests/{QUEST_ID}/start")
        assert response.status_code == 503


def test_submit_quest_success():
    updated_row = {
        "id": "existing-participation",
        "quest_id": QUEST_ID,
        "user_id": DEFAULT_USER_ID,
        "status": "submitted",
        "progress_percent": 80,
    }
    mock_client, _, participants_table = _mock_supabase_client(
        quest_exists=True,
        already_joined=True,
        participation_row={"id": "existing-participation", "status": "in_progress"},
        updated_row=updated_row,
    )

    with patch("app.quest_participation.get_client", return_value=mock_client):
        result = submit_quest(QUEST_ID)

    assert result == updated_row
    participants_table.update.assert_called_once_with({"status": "submitted", "progress_percent": 80})
    update_eq_chain = participants_table.update.return_value.eq
    update_eq_chain.assert_called_once_with("quest_id", QUEST_ID)
    update_eq_chain.return_value.eq.assert_called_once_with("user_id", DEFAULT_USER_ID)


def test_submit_quest_raises_when_not_found():
    mock_client, _, participants_table = _mock_supabase_client(
        quest_exists=True, already_joined=False, participation_row=None
    )
    with patch("app.quest_participation.get_client", return_value=mock_client):
        with pytest.raises(QuestNotFound):
            submit_quest(QUEST_ID)
    participants_table.update.assert_not_called()


@pytest.mark.parametrize("bad_status", ["joined", "submitted", "completed", "verified", "abandoned"])
def test_submit_quest_raises_when_not_in_progress(bad_status):
    mock_client, _, participants_table = _mock_supabase_client(
        quest_exists=True,
        already_joined=True,
        participation_row={"id": "existing-participation", "status": bad_status},
    )
    with patch("app.quest_participation.get_client", return_value=mock_client):
        with pytest.raises(QuestNotStarted):
            submit_quest(QUEST_ID)
    participants_table.update.assert_not_called()


def test_submit_quest_endpoint_success():
    participation = {"id": "existing-participation", "status": "submitted", "progress_percent": 80}
    with patch("app.main.submit_quest", return_value=participation) as mock_submit:
        response = client.post(f"/quests/{QUEST_ID}/submit")

        assert response.status_code == 200
        assert response.json() == participation
        mock_submit.assert_called_once_with(QUEST_ID)


def test_submit_quest_endpoint_not_found():
    with patch("app.main.submit_quest", side_effect=QuestNotFound(QUEST_ID)):
        response = client.post(f"/quests/{QUEST_ID}/submit")
        assert response.status_code == 404


def test_submit_quest_endpoint_not_started():
    with patch("app.main.submit_quest", side_effect=QuestNotStarted(QUEST_ID)):
        response = client.post(f"/quests/{QUEST_ID}/submit")
        assert response.status_code == 409


def test_submit_quest_endpoint_supabase_error():
    with patch("app.main.submit_quest", side_effect=RuntimeError("boom")):
        response = client.post(f"/quests/{QUEST_ID}/submit")
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
