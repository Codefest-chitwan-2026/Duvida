# Sustainability Advisor backend

FastAPI service for EcoBot in `apps/mobile`. It provides:

- deterministic offline answers for common sustainability and SDG questions;
- Groq (`llama-3.3-70b-versatile`) answers for questions that do not match a local response;
- PDF, DOCX, and TXT document loading;
- overlapping document chunks and sentence-transformer embeddings;
- persistent ChromaDB retrieval for document-grounded answers;
- active community-issue lookup from Supabase;
- Groq-powered quest generation from reported issues;
- quest participation and duplicate-join protection;
- optional quest suggestions returned with each answer.

## Setup

From the repository root on Windows PowerShell:

```powershell
python -m venv backend\venv
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
```

Add `GROQ_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY` to `backend/.env`.
The local static responses do not call Groq or Supabase, but unmatched
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
- `POST /community/issues` creates an issue (multipart form + optional media files).
- `POST /community/issues/{issue_id}/media` attaches one more media file to an existing issue.
- `POST /community/issues/{issue_id}/generate-quest` creates and stores an AI quest.
- `POST /community/guest-id` mints a guest reporter identity for unauthenticated submissions.
- `GET /quests/my` lists the current user's joined quests.
- `POST /quests/{quest_id}/accept` joins the current user to a generated quest.
- `POST /quests/{quest_id}/start` marks an accepted quest in progress.
- `POST /quests/{quest_id}/submit` marks an in-progress quest submitted (no proof file).
- `POST /quests/{quest_id}/proof` uploads a proof photo and marks the quest submitted.
- `POST /quests/{quest_id}/verify` marks a submitted quest completed and awards points.

`/quests/{quest_id}/accept` through `/verify` all currently operate against a single
hardcoded demo user (no auth/session yet), and `/verify` has no reject counterpart —
it isn't ready to back a real municipality-side review flow as-is.

## Tests

From the repository root:

```powershell
backend\venv\Scripts\python.exe -m pytest backend\tests -q
```
