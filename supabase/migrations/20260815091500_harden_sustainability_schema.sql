-- Follow-up hardening for 20260815090000_create_sustainability_schema.sql,
-- applied after reviewing Supabase's security/performance advisors:
--
-- 1. set_updated_at() had a mutable search_path (missed when the rest of
--    that migration's functions got `set search_path = public`).
-- 2. quests/rewards each carried two permissive SELECT policies for
--    `authenticated` (a general policy plus a staff `for all` policy),
--    which Postgres evaluates both of on every read. Split the staff
--    policies into insert/update/delete so SELECT has exactly one policy.
-- 3. issue_upvotes had the same "manage own" (all) + "select all" overlap
--    on SELECT; split into select/insert/delete.
-- 4. Supabase grants EXECUTE on new functions directly to anon and
--    authenticated (independent of the PUBLIC pseudo-role), regardless of
--    SECURITY DEFINER. current_role(), redeem_reward(), and
--    set_updated_at() only make sense for a signed-in user or as a
--    trigger, so anon's grant is revoked and PUBLIC's default grant is
--    closed too (a bare `revoke ... from anon` doesn't touch it).

alter function public.set_updated_at() set search_path = public;

drop policy "quests_write_staff" on public.quests;

create policy "quests_insert_staff"
  on public.quests
  for insert
  to authenticated
  with check (public.current_role() in ('authority', 'admin'));

create policy "quests_update_staff"
  on public.quests
  for update
  to authenticated
  using (public.current_role() in ('authority', 'admin'))
  with check (public.current_role() in ('authority', 'admin'));

create policy "quests_delete_staff"
  on public.quests
  for delete
  to authenticated
  using (public.current_role() in ('authority', 'admin'));

drop policy "rewards_write_staff" on public.rewards;

create policy "rewards_insert_staff"
  on public.rewards
  for insert
  to authenticated
  with check (public.current_role() in ('authority', 'admin'));

create policy "rewards_update_staff"
  on public.rewards
  for update
  to authenticated
  using (public.current_role() in ('authority', 'admin'))
  with check (public.current_role() in ('authority', 'admin'));

create policy "rewards_delete_staff"
  on public.rewards
  for delete
  to authenticated
  using (public.current_role() in ('authority', 'admin'));

drop policy "issue_upvotes_select_all" on public.issue_upvotes;
drop policy "issue_upvotes_manage_own" on public.issue_upvotes;

create policy "issue_upvotes_select_all"
  on public.issue_upvotes
  for select
  to authenticated
  using (true);

create policy "issue_upvotes_insert_own"
  on public.issue_upvotes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "issue_upvotes_delete_own"
  on public.issue_upvotes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke execute on function public.current_role() from public, anon;
grant execute on function public.current_role() to authenticated;

revoke execute on function public.redeem_reward(uuid) from public, anon;
grant execute on function public.redeem_reward(uuid) to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.award_points(uuid, int, text, text, uuid, text) from public;
revoke execute on function public.log_issue_status_change() from public;
revoke execute on function public.sync_issue_upvotes_count() from public;
revoke execute on function public.handle_issue_resolved() from public;
revoke execute on function public.handle_quest_completed() from public;
revoke execute on function public.sync_community_member_count() from public;
