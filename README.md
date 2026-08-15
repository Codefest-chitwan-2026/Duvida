# Team Duvidha — Sustainable Community Digital Twin

Monorepo for the citizen mobile app, the municipal web dashboard, and the EcoBot/quest-generation backend.

## Project structure

```text
apps/
  mobile/                 Expo Router citizen app (report issues, run quests, chat with EcoBot)
  web/
    dashboard/            Municipal analytics + quest-verification dashboard (Next.js)
backend/                  FastAPI service: EcoBot RAG chat, quest generation, report/quest REST API
packages/
  shared/                 Shared TS types/constants — not currently imported by any app
docs/                     Architecture and planning notes
supabase_schema.sql       An early schema draft — see "Database" below before trusting it
```

There is no `apps/web/admin` — it was removed; don't recreate references to it.

## Tech stack

| Layer | Stack |
| --- | --- |
| Mobile | Expo Router, React Native, TypeScript, Mapbox (`@rnmapbox/maps`), Supabase JS client |
| Dashboard | Next.js 15 (App Router), TypeScript, plain CSS custom properties, Recharts |
| Backend | FastAPI, Groq (`llama-3.3-70b-versatile`) for chat/quest generation, `sentence-transformers` (local `all-MiniLM-L6-v2`) for embeddings, ChromaDB for retrieval, Supabase Python client |
| Package manager | pnpm workspaces (`pnpm@9.15.0`) |

## Development

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

Run an application independently:

```bash
pnpm dev:mobile
pnpm dev:dashboard
```

Run everything except the backend together:

```bash
pnpm dev
```

The backend is a separate Python service and isn't part of the pnpm workspace — start it on its own (see `backend/README.md`).

### Environment variables

Each app reads its own `.env` (copy from the matching `.env.example`, never commit the real file):

- `apps/mobile/.env` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`, `EXPO_PUBLIC_MAPBOX_STYLE_URL`, `EXPO_PUBLIC_API_BASE_URL` (points at the local backend, e.g. `http://127.0.0.1:8000`; use your machine's LAN IP instead of `127.0.0.1` when testing on a physical phone).
- `backend/.env` — `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`. (Ignore any mention of a Gemini key elsewhere — the backend calls Groq.)
- `apps/web/dashboard` has no `.env` yet — it currently runs entirely on mock data (see below).

## How the pieces actually fit together

1. Citizens use the mobile app to report issues (photo + GPS + category), which POSTs to the FastAPI backend and lands in Supabase.
2. From the EcoBot/Advisor screen, a citizen can ask the backend to AI-generate a sustainability quest from an open issue (Groq + retrieval over `backend/sustainability_knowledge/`), then accept it. Accepted quests then show up under the mobile app's Quests tab.
3. Completing a quest is a state machine in `quest_participants` (`joined → in_progress → submitted → completed`), driven by REST calls from the mobile app; proof photos upload straight to the backend, not to Supabase Storage from the client.
4. The municipal dashboard is where an authority would review reports and verify submitted quest proof — today it's built against mock data behind a swappable provider interface (`apps/web/dashboard/src/lib/data/`), not live Supabase, so it can be wired up without touching any component code.

## Database

**`supabase_schema.sql` at the repo root does not match what the backend code actually queries** — it looks like an early draft that was never kept in sync (e.g. it has `issues.media_urls[]` and `quests.issue_id`; the real backend expects a separate `issue_media` table and `quests.community_id`, among other differences). Treat the backend's Python modules (`backend/app/report_submission.py`, `quest_generator.py`, `quest_participation.py`) as the source of truth for the live schema shape, not the SQL file, until the file is regenerated from the actual Supabase project.

## Current known gaps

Worth knowing before building on top of these:

- Mobile auth is a placeholder in-memory flag (`apps/mobile/src/lib/auth.tsx`) — no real Supabase sign-in is wired up yet.
- The backend's `POST /quests/{quest_id}/verify` hardcodes a single demo user and has no reject path — it isn't ready to back the dashboard's verification queue yet.
- `packages/shared` isn't imported anywhere; mobile, dashboard, and backend each define their own types independently.

## Testing

```bash
pnpm --recursive typecheck
backend/venv/Scripts/python.exe -m pytest backend/tests -q   # from backend/, after backend setup
```

Keep secrets in the ignored environment files for each application. Do not commit service-role or Groq API keys.
