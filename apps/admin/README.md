# Admin dashboard

Next.js authority interface. Recommended feature folders:

```text
src/
  app/                   Routes and layouts
  features/
    auth/
    dashboard/
    reports/
    map/
    quests/
    impact/
  components/            Reusable UI components
  lib/supabase/           Browser/server Supabase clients
```

Start with the report queue and report detail/status actions. Fetch privileged data through authenticated server components/actions or RLS-protected Supabase calls; never place a service-role key in browser code.
