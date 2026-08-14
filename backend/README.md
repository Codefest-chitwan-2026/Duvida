# Sustainability Advisor API

FastAPI service for the EcoBot tab. It retrieves relevant passages from documents in
`sustainability_knowledge/`, sends that context to Gemini, and returns an answer with optional
quest suggestions.

## Setup

```bash
python -m venv venv
```

Activate the environment, then install dependencies and configure Gemini:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env`, add PDF, DOCX, or TXT reference documents to
`sustainability_knowledge/`, and start the API:

```bash
uvicorn app.main:app --reload
```

The vector index is built automatically at startup. Configure the mobile app with
`EXPO_PUBLIC_API_BASE_URL`; `http://127.0.0.1:8000` works for web and iOS Simulator, while a
physical device needs the computer's LAN address.

- `GET /health` reports API and knowledge-index status.
- `POST /chat` accepts `{"message": "..."}` and returns an answer plus optional quests.
