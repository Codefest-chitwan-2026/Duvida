# Delivery roadmap

## Phase 1 — Foundation

- Create Supabase project and apply the initial migration.
- Add generated database types to the shared package.
- Configure authentication and role-based routes.
- Establish CI for linting, type checking, and builds.

## Phase 2 — End-to-end reporting MVP

- Mobile GPS selection, category/severity form, media upload, and submission.
- Admin report list, filters, detail view, and status actions.
- Realtime updates on both clients.
- Private evidence access and complete RLS tests.
- Report status audit history.

## Phase 3 — Map and duplicate detection

- Mapbox issue layers and severity/category markers.
- Nearby-candidate query using PostGIS distance.
- Edge Function for text/image similarity.
- Admin merge flow that preserves confirmations and evidence.

## Phase 4 — Quests and rewards

- Safe community/verification quests.
- Personalized sustainability quests.
- Proof submission and moderator verification.
- Append-only reward ledger, XP, badges, and leaderboard.

## Phase 5 — Impact analytics

- Resolution time, participation, and quest metrics.
- Versioned and transparent CO2/waste estimation methods.
- Dashboard trends and exportable authority reports.

## MVP acceptance criteria

- A citizen can submit a geotagged report with evidence.
- The report appears in the authority dashboard without manual refresh.
- An authority can verify and resolve it.
- The citizen sees each status change.
- Unauthorized users cannot change reports or access unrelated private evidence.
