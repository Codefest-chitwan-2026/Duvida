import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.quest_generator import (
    DEFAULT_COMMUNITY_ID,
    InvalidGeneratedQuest,
    build_retrieval_query,
    generate_quest_for_issue,
    insert_quest,
)
from app.schemas import GeneratedQuest

client = TestClient(app)

SAMPLE_ISSUE = {
    "id": "170e5f86-dff6-47f2-bc0e-948cf4992669",
    "title": "Garbage dumping near community park entrance",
    "description": "Several bags of household garbage have been dumped near the public park entrance.",
    "category_id": "c3c85c54-1650-448a-b25a-fc1b46b17828",
    "status": "submitted",
    "severity": "low",
    "issue_categories": {"name": "Garbage / Litter"},
}


def _fake_llm_response(quest: GeneratedQuest):
    response = MagicMock()
    response.choices[0].message.content = quest.model_dump_json()
    return response


def test_build_retrieval_query_combines_title_description_category_severity():
    query = build_retrieval_query(SAMPLE_ISSUE)
    assert "Garbage dumping near community park entrance" in query
    assert "Several bags of household garbage" in query
    assert "Garbage / Litter" in query
    assert "low" in query


def test_build_retrieval_query_skips_missing_fields():
    query = build_retrieval_query({"title": "Only a title"})
    assert query == "Only a title"


def test_generate_quest_for_issue_success():
    valid_quest = GeneratedQuest(
        title="Clean up garbage near the park",
        description="Organize a small group to collect and dispose of the dumped garbage.",
        quest_type="cleanup",
        status="active",
        points_reward=25,
        community_id="some-id-the-model-made-up",
    )
    with patch("app.quest_generator.retrieve", return_value=[]) as mock_retrieve, patch(
        "app.quest_generator.get_llm_client"
    ) as mock_get_client:
        mock_get_client.return_value.chat.completions.create.return_value = _fake_llm_response(valid_quest)

        result = generate_quest_for_issue(SAMPLE_ISSUE)

        mock_retrieve.assert_called_once()
        assert result["title"] == "Clean up garbage near the park"
        assert result["quest_type"] == "cleanup"
        assert result["status"] == "active"
        assert result["points_reward"] == 25
        # community_id must always be the real one, never trusted from the model
        assert result["community_id"] == DEFAULT_COMMUNITY_ID


@pytest.mark.parametrize("bad_quest_type", ["invalid", "personal", ""])
def test_generate_quest_for_issue_rejects_invalid_quest_type(bad_quest_type):
    quest = GeneratedQuest(
        title="t", description="d", quest_type=bad_quest_type, status="active",
        points_reward=10, community_id=DEFAULT_COMMUNITY_ID,
    )
    with patch("app.quest_generator.retrieve", return_value=[]), patch(
        "app.quest_generator.get_llm_client"
    ) as mock_get_client:
        mock_get_client.return_value.chat.completions.create.return_value = _fake_llm_response(quest)
        with pytest.raises(InvalidGeneratedQuest):
            generate_quest_for_issue(SAMPLE_ISSUE)


@pytest.mark.parametrize("bad_status", ["pending", "closed", ""])
def test_generate_quest_for_issue_rejects_invalid_status(bad_status):
    quest = GeneratedQuest(
        title="t", description="d", quest_type="cleanup", status=bad_status,
        points_reward=10, community_id=DEFAULT_COMMUNITY_ID,
    )
    with patch("app.quest_generator.retrieve", return_value=[]), patch(
        "app.quest_generator.get_llm_client"
    ) as mock_get_client:
        mock_get_client.return_value.chat.completions.create.return_value = _fake_llm_response(quest)
        with pytest.raises(InvalidGeneratedQuest):
            generate_quest_for_issue(SAMPLE_ISSUE)


def test_insert_quest_uses_supabase_client():
    fake_quest = {"title": "t", "quest_type": "cleanup", "status": "active"}
    created_row = {**fake_quest, "id": "new-quest-id"}

    with patch("app.quest_generator.get_supabase_client") as mock_get_client:
        mock_table = mock_get_client.return_value.table.return_value
        mock_table.insert.return_value.execute.return_value.data = [created_row]

        result = insert_quest(fake_quest)

        mock_get_client.return_value.table.assert_called_once_with("quests")
        mock_table.insert.assert_called_once_with(fake_quest)
        assert result == created_row


def test_generate_quest_endpoint_success():
    fake_quest = {"title": "Clean up garbage", "quest_type": "cleanup", "status": "active"}
    created_row = {**fake_quest, "id": "new-quest-id"}

    with patch("app.main.fetch_issue_by_id", return_value=SAMPLE_ISSUE), patch(
        "app.main.generate_quest_for_issue", return_value=fake_quest
    ), patch("app.main.insert_quest", return_value=created_row) as mock_insert:
        response = client.post(f"/community/issues/{SAMPLE_ISSUE['id']}/generate-quest")

        assert response.status_code == 200
        assert response.json() == created_row
        mock_insert.assert_called_once_with(fake_quest)


def test_generate_quest_endpoint_issue_not_found():
    with patch("app.main.fetch_issue_by_id", return_value=None), patch(
        "app.main.generate_quest_for_issue"
    ) as mock_generate:
        response = client.post("/community/issues/does-not-exist/generate-quest")

        assert response.status_code == 404
        mock_generate.assert_not_called()


def test_generate_quest_endpoint_invalid_quest_returns_502():
    with patch("app.main.fetch_issue_by_id", return_value=SAMPLE_ISSUE), patch(
        "app.main.generate_quest_for_issue", side_effect=InvalidGeneratedQuest("bad quest_type")
    ), patch("app.main.insert_quest") as mock_insert:
        response = client.post(f"/community/issues/{SAMPLE_ISSUE['id']}/generate-quest")

        assert response.status_code == 502
        mock_insert.assert_not_called()
