import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.local_responses import DATA_PATH, match_local_response
from app.main import app
from app.retrieval import retrieve

client = TestClient(app)

EXPECTED_INTENT_IDS = [
    "water_advice",
    "waste_advice",
    "greenery_advice",
    "energy_advice",
    "transport_advice",
    "community_advice",
    "sdg_11",
    "sdg_12",
    "sdg_13",
]

# One natural-language question per category — these should all be answered
# locally, no LLM call.
STATIC_QUERIES = [
    "How can I save water?",
    "How can I reduce waste?",
    "Why are trees important?",
    "How can I save electricity?",
    "How can I travel sustainably?",
    "How can I help my community?",
    "What is SDG 12?",
]

COMPLEX_QUERIES = [
    "How does climate change affect rural water supply systems in Nepal specifically?",
    "Summarize the World Bank's findings on informal waste pickers.",
]


def test_data_file_has_expected_intent_ids_and_modes():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    modes = {intent["id"]: intent["mode"] for intent in data["intents"]}

    for intent_id in EXPECTED_INTENT_IDS:
        assert intent_id in modes
        assert modes[intent_id] == "static"


@pytest.mark.parametrize("message", STATIC_QUERIES)
def test_static_queries_match_with_valid_schema(message):
    reply = match_local_response(message)
    assert reply is not None
    assert isinstance(reply["answer"], str) and reply["answer"]
    assert isinstance(reply["quests"], list)
    for quest in reply["quests"]:
        assert "title" in quest and "description" in quest


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_queries_do_not_match_locally(message):
    assert match_local_response(message) is None


@pytest.mark.parametrize("message", STATIC_QUERIES)
def test_static_queries_skip_llm(message):
    with patch("app.main.ask_ecobot") as mock_ask:
        mock_ask.side_effect = AssertionError("The LLM should not be called for a local match")
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_not_called()
        assert "answer" in response.json()
        assert "quests" in response.json()


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_queries_fall_through_to_llm(message):
    with patch("app.main.ask_ecobot") as mock_ask, patch("app.main.retrieve") as mock_retrieve:
        mock_retrieve.return_value = []
        mock_ask.return_value = {"answer": "stub answer", "quests": []}
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_called_once()


def test_empty_retrieval_index_skips_embedding_model():
    with patch("app.retrieval.get_collection") as mock_get_collection, patch(
        "app.retrieval.embed_texts"
    ) as mock_embed:
        mock_get_collection.return_value.count.return_value = 0

        assert retrieve("How can my community reduce waste?") == []
        mock_embed.assert_not_called()
