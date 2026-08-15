# Team Duvidha — Sustainable Community Digital Twin

Monorepo for the citizen mobile app, municipal web tools, EcoBot backend, and shared application contracts.

## Project structure

```text
apps/
  mobile/                 Expo Router citizen application
  web/
    admin/                Authority operations dashboard
    dashboard/            Municipal analytics dashboard
backend/                  FastAPI EcoBot and quest-generation service
packages/
  shared/                 Shared types, constants, mock data, and utilities
docs/                     Architecture notes and project documentation
```

The mobile and web sections are independent applications. Shared application code belongs in `packages/shared`, while EcoBot and server-side integrations belong in `backend`.

## Development

Install all workspace dependencies from the repository root:

```powershell
pnpm install
```

Run an application independently:

```powershell
pnpm dev:mobile
pnpm dev:admin
pnpm dev:dashboard
```

Run all applications together:

```powershell
pnpm dev
```

## Main application flow

1. Citizens use the mobile app to report issues, complete quests, and talk to EcoBot.
2. The FastAPI backend supplies EcoBot advice, retrieval, community issues, and generated quests.
3. Authority users review and manage reports through the web applications.
4. Shared types and constants keep the clients aligned.

Keep secrets in the ignored environment files for each application. Do not commit service-role or Gemini API keys.
