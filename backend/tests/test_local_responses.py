import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.local_responses import match_local_response
from app.main import app

client = TestClient(app)

LOCAL_QUERIES = [
    "Give me a water saving tip",
    "Any recycling tip for me?",
    "I need an energy tip",
    "sustainable transport tip please",
    "greenery tip for my community",
    "What is SDG 11?",
    "What is SDG 12?",
    "What is SDG 13?",
    "Suggest a quest for me",
]

COMPLEX_QUERIES = [
    "How does climate change affect rural water supply systems in Nepal specifically?",
    "Summarize the World Bank's findings on informal waste pickers.",
]


@pytest.mark.parametrize("message", LOCAL_QUERIES)
def test_local_match_has_valid_schema(message):
    reply = match_local_response(message)
    assert reply is not None
    assert isinstance(reply["answer"], str) and reply["answer"]
    assert isinstance(reply["quests"], list)
    for quest in reply["quests"]:
        assert "title" in quest and "description" in quest


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_queries_do_not_match_locally(message):
    assert match_local_response(message) is None


@pytest.mark.parametrize("message", LOCAL_QUERIES)
def test_local_requests_skip_gemini(message):
    with patch("app.main.ask_ecobot") as mock_ask:
        mock_ask.side_effect = AssertionError("Gemini should not be called for a local match")
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_not_called()
        assert "answer" in response.json()
        assert "quests" in response.json()


@pytest.mark.parametrize("message", COMPLEX_QUERIES)
def test_complex_requests_fall_through_to_gemini(message):
    with patch("app.main.ask_ecobot") as mock_ask, patch("app.main.retrieve") as mock_retrieve:
        mock_retrieve.return_value = []
        mock_ask.return_value = {"answer": "stub answer", "quests": []}
        response = client.post("/chat", json={"message": message})
        assert response.status_code == 200
        mock_ask.assert_called_once()
