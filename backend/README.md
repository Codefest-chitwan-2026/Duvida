# Sustainability Advisor backend

FastAPI service for EcoBot in `apps/mobile`. It provides:

- deterministic offline answers for common sustainability and SDG questions;
- Gemini answers for questions that do not match a local response;
- PDF, DOCX, and TXT document loading;
- overlapping document chunks and sentence-transformer embeddings;
- persistent ChromaDB retrieval for document-grounded answers;
- active community-issue lookup from Supabase;
- Gemini-powered quest generation from reported issues;
- quest participation and duplicate-join protection;
- optional quest suggestions returned with each answer.

## Setup

From the repository root on Windows PowerShell:

```powershell
python -m venv backend\venv
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
```

Add `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY` to `backend/.env`.
The local static responses do not call Gemini or Supabase, but unmatched
questions and community quest features require those services.

## Add knowledge and build the retrieval index

Place PDF, DOCX, or TXT reference documents in `sustainability_knowledge/`,
then run from `backend/`:

```powershell
.\venv\Scripts\python.exe scripts\debug_vector_store.py
```

The first build downloads the `all-MiniLM-L6-v2` embedding model. The generated
Chroma index is stored in `backend/chroma_db/` and is ignored by Git.

## Run

From `backend/`:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

For a physical phone, set `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env` to
the computer's LAN address, for example `http://192.168.1.20:8000`, then
restart Expo. `127.0.0.1` refers to the phone itself and will not reach the
computer.

## API

- `GET /health` returns service status and loaded knowledge character count.
- `POST /chat` accepts `{"message": "..."}` and returns
  `{"answer": "...", "quests": [{"title": "...", "description": "..."}]}`.
- `GET /community/issues` returns active, non-deleted Supabase issues.
- `POST /community/issues/{issue_id}/generate-quest` creates and stores an AI quest.
- `POST /quests/{quest_id}/accept` joins the current user to a generated quest.

## Tests

From the repository root:

```powershell
backend\venv\Scripts\python.exe -m pytest backend\tests -q
```
