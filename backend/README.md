# Sustainability Advisor backend

FastAPI service that powers the EcoBot chat screen. No vector DB — reference
docs in `sustainability_knowledge/` are loaded whole and passed to Gemini as
context (see that folder's README for why).

## Setup

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in GEMINI_API_KEY
```

## Run

```
source venv/bin/activate
uvicorn app.main:app --reload
```

- `GET /health` — sanity check, also reports how many characters of
  knowledge-base text were loaded at startup.
- `POST /chat` — body `{"message": "..."}`, returns
  `{"answer": "...", "quests": [{"title": "...", "description": "..."}]}`.

Model is set in `app/gemini_client.py` as `gemini-flash-latest` — an alias
Google keeps pointed at their current recommended flash model, so it
shouldn't need updating as versions roll over.
