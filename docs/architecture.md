# Architecture

## Components

| Component | Responsibility | Must not do |
| --- | --- | --- |
| Mobile app | Citizen authentication, map, report submission, evidence upload, status tracking | Perform privileged moderation |
| Admin dashboard | Authority analytics, report review, assignment, verification, resolution | Use a service-role key in the browser |
| Supabase | Auth, PostgreSQL, Storage, Realtime, row-level security | Trust client-provided ownership or roles |
| Edge Functions | Privileged workflows, duplicate checks, notifications, metric aggregation | Replace database authorization policies |
| Shared package | Domain types, constants, validation schemas | Contain platform-specific UI |

## Primary report data flow

```text
Mobile form
  -> upload evidence to private `report-media` bucket
  -> insert report
  -> insert report_media metadata
  -> Supabase Realtime
  -> admin report queue
  -> authority status update + audit event
  -> Supabase Realtime
  -> mobile report detail
```

The database is the source of truth. UI counters and charts should be derived from database views or server-side queries, not stored independently in clients.

## Authentication and authorization

- `profiles.id` matches `auth.users.id`.
- New accounts default to `citizen`.
- Only an existing authority/admin should promote another user; use a protected server workflow.
- Citizens may create reports and read public/owned reports.
- Authorities may review and update reports.
- Every status change is recorded in `report_status_history`.
- Evidence is stored in a private bucket and accessed through authenticated requests or signed URLs.

## Report lifecycle

```text
submitted -> under_review -> verified -> assigned -> in_progress -> resolved
                         \-> rejected
```

Keep `duplicate` as a separate outcome linked by `duplicate_of`; the canonical report retains confirmations and lifecycle state.

## Feature boundaries

Build the reporting loop before adding these modules:

- `quests`: community and personal sustainability challenges.
- `quest_submissions`: proof and moderator verification.
- `rewards`: append-only point transactions and derived balances.
- `duplicate candidates`: GPS, text, and image similarity results.
- `impact metrics`: transparent estimates with a named methodology/version.

## Suggested screens

### Mobile

- Authentication/onboarding
- Map and nearby verified issues
- New report: location -> details -> evidence -> review
- My reports and report detail
- Quests and proof submission
- Profile, points, badges, and impact

### Admin

- Overview metrics
- Report queue with filters
- Report detail with evidence, map, history, and actions
- Map/hotspots
- Quests and proof moderation
- Impact analytics
- User/role management (admin only)
