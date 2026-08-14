# Edge Functions

Add functions only for workflows that need secrets or privileged coordination:

- `find-duplicate-candidates`: combines nearby, text, and image similarity.
- `notify-report-status`: sends push/email notifications after a status change.
- `calculate-impact`: applies a versioned, transparent estimation method.

Basic CRUD and authorization should remain in PostgreSQL with row-level security.
