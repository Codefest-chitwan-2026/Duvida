# Team Duvidha — Sustainable Community Digital Twin

Monorepo for the citizen mobile app, authority admin dashboard, and shared Supabase backend.

## MVP flow

1. A citizen signs in on the mobile app.
2. They submit a report with category, description, severity, GPS coordinates, and media.
3. Supabase stores the report and evidence.
4. The admin dashboard receives the report and lets an authority verify, reject, assign, or resolve it.
5. Both clients receive status changes through Supabase Realtime.

## Repository layout

```text
apps/
  admin/                 Next.js authority dashboard
  mobile/                Expo / React Native citizen app
packages/
  shared/                Shared types, validation, constants, and utilities
supabase/
  migrations/            PostgreSQL schema, RLS policies, indexes, and triggers
  functions/             Edge Functions (duplicate detection, notifications, metrics)
docs/
  architecture.md        System boundaries and data flow
  roadmap.md             MVP-first delivery plan
```

## Getting started

Prerequisites: Node.js 20+, pnpm 9+, Expo tooling, and Supabase CLI.

```bash
pnpm install
cp .env.example .env
supabase start
supabase db reset
```

Then scaffold the two clients inside the prepared directories (Next.js in `apps/admin`, Expo Router in `apps/mobile`) and add their normal `dev` scripts. The repository intentionally establishes the architecture and backend contract before committing generated framework boilerplate.

Create app-specific environment files from the examples in `apps/admin` and `apps/mobile`. Use the Supabase **anon key** in clients. Never expose the service-role key in either app.

## Initial work order

- Connect authentication and role-aware profiles.
- Implement mobile report creation and media upload.
- Implement dashboard report queue and status updates.
- Subscribe both clients to report changes.
- Add duplicate detection after the basic reporting loop is reliable.

See [docs/architecture.md](docs/architecture.md) and [docs/roadmap.md](docs/roadmap.md).
