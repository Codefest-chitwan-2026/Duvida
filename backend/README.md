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
uvicorn app.main:app --reload --host 0.0.0.0
```

`--host 0.0.0.0` is required for the Expo mobile app to reach this server —
without it, uvicorn binds to `127.0.0.1` only, which is unreachable from a
phone (or any device other than this machine) running Expo Go on the same
network. `mobile/.env`'s `EXPO_PUBLIC_API_BASE_URL` needs to point at this
machine's LAN IP (not `127.0.0.1`) for the same reason.

- `GET /health` — sanity check, also reports how many characters of
  knowledge-base text were loaded at startup.
- `POST /chat` — body `{"message": "..."}`, returns
  `{"answer": "...", "quests": [{"title": "...", "description": "..."}]}`.

Model is set in `app/gemini_client.py` as `gemini-flash-latest` — an alias
Google keeps pointed at their current recommended flash model, so it
shouldn't need updating as versions roll over.
