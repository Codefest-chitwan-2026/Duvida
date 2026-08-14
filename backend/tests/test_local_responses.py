import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.local_responses import DATA_PATH, match_local_response
from app.main import app

client = TestClient(app)

# One trigger phrase per "static" intent in sustainability_local_responses.json —
# these should be answered locally, no Gemini call.
STATIC_QUERIES = [
    "water saving tip",
    "reduce waste",
    "energy saving tip",
    "sustainable transport tip",
    "greenery tip",
    "community action",
    "What is SDG 11?",
    "What is SDG 12?",
    "What is SDG 13?",
    "I need SDG Advice",
]

COMPLEX_QUERIES = [
    "How does climate change affect rural water supply systems in Nepal specifically?",
    "Summarize the World Bank's findings on informal waste pickers.",
]


def test_data_file_has_expected_intent_modes():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    modes = {intent["id"]: intent["mode"] for intent in data["intents"]}

    for intent_id in [
        "water_tip",
        "waste_tip",
        "energy_tip",
        "transport_tip",
        "greenery_tip",
        "community_tip",
        "sdg_11",
        "sdg_12",
        "sdg_13",
        "sdg_advice_menu",
    ]:
        assert modes[intent_id] == "static"


def test_water_tip_matches_locally_with_quests():
    reply = match_local_response("water saving tip")
    assert reply is not None
    assert isinstance(reply["answer"], str) and reply["answer"]
    assert 1 <= len(reply["quests"]) <= 2
    for quest in reply["quests"]:
        assert set(quest.keys()) == {"title", "description"}


def test_sdg_advice_menu_returns_expected_prompt():
    # The mobile UI matches on this exact string to decide when to show the
    # category buttons, so the wording is a real contract, not just content.
    reply = match_local_response("I need SDG Advice")
    assert reply is not None
    assert reply["answer"] == "Sure! 🌱 What would you like advice on?"
    assert reply["quests"] == []


@pytest.mark.parametrize("message", STATIC_QUERIES)
def test_static_intents_match_with_valid_schema(message):
    reply = match_local_response(message)
    assert reply is not None
    assert isinstance(reply["answer"], str) and reply["answer"]
    assert isinstance(reply["quests"], list)
    for quest in reply["quests"]:
        assert set(quest.keys()) == {"title", "description"}


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_queries_do_not_match_locally(message):
    assert match_local_response(message) is None


@pytest.mark.parametrize("message", STATIC_QUERIES)
def test_static_intents_skip_gemini(message):
    with patch("app.main.ask_ecobot") as mock_ask:
        mock_ask.side_effect = AssertionError("Gemini should not be called for a local match")
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_not_called()
        assert "answer" in response.json()
        assert "quests" in response.json()


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_queries_fall_through_to_gemini(message):
    with patch("app.main.ask_ecobot") as mock_ask, patch("app.main.retrieve") as mock_retrieve:
        mock_retrieve.return_value = []
        mock_ask.return_value = {"answer": "stub answer", "quests": []}
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_called_once()
