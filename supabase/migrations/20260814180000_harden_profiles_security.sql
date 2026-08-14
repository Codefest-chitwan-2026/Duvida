-- Follow-up hardening for the profiles migration (20260814120000):
-- 1. Revoke direct client EXECUTE on the two trigger functions — they should
--    only ever run as triggers, never be callable as RPCs.
-- 2. Rewrite auth.uid() as (select auth.uid()) in both profiles RLS policies
--    so Postgres evaluates it once per statement instead of once per row.
-- No table structure, role model, or application behavior changes.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;

alter policy "profiles_select_own" on public.profiles
  using ((select auth.uid()) = id);

alter policy "profiles_update_own" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
