-- Sustainable city app: issues, quests, points/wallet, rewards, badges,
-- communities, and supporting tables. Builds on the profiles foundation
-- from 20260814120000/20260814180000 — auth identity and sessions stay in
-- Supabase's own auth.users / auth.sessions and are not duplicated here.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Shared helpers
-- ---------------------------------------------------------------------

-- Generic "bump updated_at" trigger, reused by every mutable table below.
-- Runs as invoker (no elevated rights needed to touch the row being
-- written by the same statement).
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Reads the caller's own role out of profiles, bypassing profiles' RLS
-- (which only lets a user read their own row) so it can be used inside
-- other tables' policies to gate authority/admin-only writes. Must stay
-- executable by `authenticated` — policies evaluate as that role.
create function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_role() to authenticated;

-- ---------------------------------------------------------------------
-- 2. Extend profiles (additive only — does not touch the hardened
--    role/RLS behavior from the existing migrations)
-- ---------------------------------------------------------------------

alter table public.profiles
  add column username text,
  add column bio text,
  add column city text,
  add column last_active_at timestamptz,
  add column deleted_at timestamptz;

alter table public.profiles
  add constraint profiles_username_key unique (username);

create index profiles_city_idx on public.profiles (city) where deleted_at is null;

-- ---------------------------------------------------------------------
-- 3. issue_categories (reference data)
-- ---------------------------------------------------------------------

create table public.issue_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text,
  description text,
  default_severity text not null default 'medium',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint issue_categories_severity_check
    check (default_severity in ('low', 'medium', 'high', 'critical'))
);

alter table public.issue_categories enable row level security;

create policy "issue_categories_select_all"
  on public.issue_categories
  for select
  to anon, authenticated
  using (is_active);

insert into public.issue_categories (slug, name, icon, default_severity, sort_order) values
  ('pothole',          'Pothole',            'road',       'medium', 1),
  ('garbage',          'Garbage / Litter',   'trash',      'low',    2),
  ('streetlight',      'Broken Streetlight', 'lightbulb',  'medium', 3),
  ('water_leak',       'Water Leak',         'droplet',    'high',   4),
  ('traffic',          'Traffic Hazard',     'traffic-cone','high',  5),
  ('plastic_pollution','Plastic Pollution',  'recycle',    'low',    6),
  ('illegal_dumping',  'Illegal Dumping',    'dumpster',   'medium', 7),
  ('other',            'Other',              'flag',       'low',    99);

-- ---------------------------------------------------------------------
-- 4. communities (created before issues/quests/activities reference it)
-- ---------------------------------------------------------------------

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  city text,
  cover_image_path text,
  member_count int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index communities_city_idx on public.communities (city) where deleted_at is null;

create trigger communities_set_updated_at
  before update on public.communities
  for each row execute function public.set_updated_at();

alter table public.communities enable row level security;

create policy "communities_select_active"
  on public.communities
  for select
  to anon, authenticated
  using (is_active and deleted_at is null);

create policy "communities_insert_own"
  on public.communities
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "communities_update_owner_or_admin"
  on public.communities
  for update
  to authenticated
  using (created_by = (select auth.uid()) or public.current_role() in ('authority', 'admin'))
  with check (created_by = (select auth.uid()) or public.current_role() in ('authority', 'admin'));

-- ---------------------------------------------------------------------
-- 5. issues
-- ---------------------------------------------------------------------

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.issue_categories (id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'submitted',
  severity text not null default 'medium',
  location extensions.geography(Point, 4326) not null,
  latitude double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  longitude double precision generated always as (extensions.st_x(location::extensions.geometry)) stored,
  address text,
  city text,
  upvotes_count int not null default 0,
  assigned_to uuid references public.profiles (id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint issues_title_length check (char_length(title) between 3 and 150),
  constraint issues_status_check
    check (status in ('submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected', 'duplicate', 'closed')),
  constraint issues_severity_check check (severity in ('low', 'medium', 'high', 'critical'))
);

create index issues_reporter_idx on public.issues (reporter_id);
create index issues_category_idx on public.issues (category_id);
create index issues_status_category_idx on public.issues (status, category_id) where deleted_at is null;
create index issues_created_at_idx on public.issues (created_at desc);
create index issues_location_gix on public.issues using gist (location);

create trigger issues_set_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

alter table public.issues enable row level security;

-- Public transparency: any signed-in user can see all non-deleted issues,
-- matching the "civic map" model where reports are visible city-wide.
create policy "issues_select_visible"
  on public.issues
  for select
  to authenticated
  using (deleted_at is null);

create policy "issues_insert_own"
  on public.issues
  for insert
  to authenticated
  with check (reporter_id = (select auth.uid()));

create policy "issues_update_own_or_staff"
  on public.issues
  for update
  to authenticated
  using (
    (reporter_id = (select auth.uid()) and status = 'submitted')
    or public.current_role() in ('authority', 'admin')
  )
  with check (
    (reporter_id = (select auth.uid()) and status = 'submitted')
    or public.current_role() in ('authority', 'admin')
  );

-- ---------------------------------------------------------------------
-- 6. issue_media
-- ---------------------------------------------------------------------

create table public.issue_media (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  media_type text not null,
  storage_path text not null,
  thumbnail_path text,
  caption text,
  created_at timestamptz not null default now(),
  constraint issue_media_type_check check (media_type in ('image', 'video'))
);

create index issue_media_issue_idx on public.issue_media (issue_id);

alter table public.issue_media enable row level security;

create policy "issue_media_select_all"
  on public.issue_media
  for select
  to authenticated
  using (true);

create policy "issue_media_insert_own"
  on public.issue_media
  for insert
  to authenticated
  with check (uploaded_by = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 7. issue_status_history (append-only audit trail, written by trigger
--    below — never directly by clients)
-- ---------------------------------------------------------------------

create table public.issue_status_history (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index issue_status_history_issue_idx on public.issue_status_history (issue_id, created_at);

alter table public.issue_status_history enable row level security;

create policy "issue_status_history_select_all"
  on public.issue_status_history
  for select
  to authenticated
  using (true);

create function public.log_issue_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.issue_status_history (issue_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

revoke execute on function public.log_issue_status_change() from public, anon, authenticated;

create trigger issues_log_status_change
  after update on public.issues
  for each row execute function public.log_issue_status_change();

-- ---------------------------------------------------------------------
-- 8. issue_upvotes (corroboration — multiple residents backing a report)
-- ---------------------------------------------------------------------

create table public.issue_upvotes (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint issue_upvotes_unique unique (issue_id, user_id)
);

create index issue_upvotes_issue_idx on public.issue_upvotes (issue_id);

alter table public.issue_upvotes enable row level security;

create policy "issue_upvotes_select_all"
  on public.issue_upvotes
  for select
  to authenticated
  using (true);

create policy "issue_upvotes_manage_own"
  on public.issue_upvotes
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create function public.sync_issue_upvotes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.issues set upvotes_count = upvotes_count + 1 where id = new.issue_id;
    return new;
  else
    update public.issues set upvotes_count = greatest(upvotes_count - 1, 0) where id = old.issue_id;
    return old;
  end if;
end;
$$;

revoke execute on function public.sync_issue_upvotes_count() from public, anon, authenticated;

create trigger issue_upvotes_sync_count
  after insert or delete on public.issue_upvotes
  for each row execute function public.sync_issue_upvotes_count();

-- ---------------------------------------------------------------------
-- 9. quests
-- ---------------------------------------------------------------------

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  quest_type text not null,
  points_reward int not null default 0,
  location extensions.geography(Point, 4326),
  latitude double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  longitude double precision generated always as (extensions.st_x(location::extensions.geometry)) stored,
  radius_meters int,
  address text,
  city text,
  community_id uuid references public.communities (id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  max_participants int,
  status text not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint quests_points_check check (points_reward >= 0),
  constraint quests_type_check
    check (quest_type in ('cleanup', 'plastic_free', 'tree_planting', 'recycling_drive', 'awareness', 'survey', 'other')),
  constraint quests_status_check
    check (status in ('draft', 'active', 'completed', 'cancelled', 'archived'))
);

create index quests_status_idx on public.quests (status) where deleted_at is null;
create index quests_type_idx on public.quests (quest_type);
create index quests_community_idx on public.quests (community_id);
create index quests_window_idx on public.quests (start_at, end_at);
create index quests_location_gix on public.quests using gist (location);

create trigger quests_set_updated_at
  before update on public.quests
  for each row execute function public.set_updated_at();

alter table public.quests enable row level security;

create policy "quests_select_visible"
  on public.quests
  for select
  to authenticated
  using (deleted_at is null and (status <> 'draft' or created_by = (select auth.uid())));

create policy "quests_write_staff"
  on public.quests
  for all
  to authenticated
  using (public.current_role() in ('authority', 'admin'))
  with check (public.current_role() in ('authority', 'admin'));

-- ---------------------------------------------------------------------
-- 10. quest_participants
-- ---------------------------------------------------------------------

create table public.quest_participants (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'joined',
  progress_percent int not null default 0,
  proof_media_path text,
  points_awarded int not null default 0,
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint quest_participants_unique unique (quest_id, user_id),
  constraint quest_participants_progress_check check (progress_percent between 0 and 100),
  constraint quest_participants_status_check
    check (status in ('joined', 'in_progress', 'submitted', 'verified', 'completed', 'abandoned'))
);

create index quest_participants_user_idx on public.quest_participants (user_id);
create index quest_participants_status_idx on public.quest_participants (status);

create trigger quest_participants_set_updated_at
  before update on public.quest_participants
  for each row execute function public.set_updated_at();

alter table public.quest_participants enable row level security;

create policy "quest_participants_select_own_or_staff"
  on public.quest_participants
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.current_role() in ('authority', 'admin'));

create policy "quest_participants_insert_own"
  on public.quest_participants
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "quest_participants_update_own_or_staff"
  on public.quest_participants
  for update
  to authenticated
  using (user_id = (select auth.uid()) or public.current_role() in ('authority', 'admin'))
  with check (user_id = (select auth.uid()) or public.current_role() in ('authority', 'admin'));

-- ---------------------------------------------------------------------
-- 11. user_points (denormalized, read-optimized wallet summary — one
--     row per user, maintained only by the points engine below)
-- ---------------------------------------------------------------------

create table public.user_points (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  total_earned int not null default 0,
  total_redeemed int not null default 0,
  current_balance int not null default 0,
  current_streak_days int not null default 0,
  last_earned_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger user_points_set_updated_at
  before update on public.user_points
  for each row execute function public.set_updated_at();

alter table public.user_points enable row level security;

create policy "user_points_select_own"
  on public.user_points
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- No insert/update policy for authenticated: balances only change via the
-- security-definer functions below, which bypass RLS as their owner.

-- ---------------------------------------------------------------------
-- 12. wallet_transactions (append-only points ledger — the source of
--     truth user_points is derived from)
-- ---------------------------------------------------------------------

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  transaction_type text not null,
  points_amount int not null,
  balance_after int not null,
  source_type text,
  source_id uuid,
  status text not null default 'completed',
  description text,
  created_at timestamptz not null default now(),
  constraint wallet_transactions_type_check
    check (transaction_type in ('earn', 'redeem', 'refund', 'expire', 'adjustment')),
  constraint wallet_transactions_source_check check (
    source_type is null or source_type in
      ('issue_report', 'quest_completion', 'badge_bonus', 'reward_redemption', 'referral', 'streak_bonus', 'admin_adjustment')
  ),
  constraint wallet_transactions_status_check
    check (status in ('pending', 'completed', 'failed', 'reversed'))
);

create index wallet_transactions_user_idx on public.wallet_transactions (user_id, created_at desc);
create index wallet_transactions_source_idx on public.wallet_transactions (source_type, source_id);

alter table public.wallet_transactions enable row level security;

create policy "wallet_transactions_select_own"
  on public.wallet_transactions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 13. Points engine: the only path that may write to wallet_transactions
--     / user_points. Client code never inserts into either table
--     directly (no policy grants it), which is what makes the ledger
--     tamper-proof against a compromised or modified mobile client.
-- ---------------------------------------------------------------------

create function public.award_points(
  p_user_id uuid,
  p_points int,
  p_transaction_type text,
  p_source_type text,
  p_source_id uuid,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
begin
  insert into public.user_points (user_id, current_balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_points
  set
    current_balance = current_balance + p_points,
    total_earned = total_earned + greatest(p_points, 0),
    total_redeemed = total_redeemed + greatest(-p_points, 0),
    last_earned_at = case when p_points > 0 then now() else last_earned_at end
  where user_id = p_user_id
  returning current_balance into v_balance;

  insert into public.wallet_transactions
    (user_id, transaction_type, points_amount, balance_after, source_type, source_id, description)
  values
    (p_user_id, p_transaction_type, p_points, v_balance, p_source_type, p_source_id, p_description);
end;
$$;

revoke execute on function public.award_points from public, anon, authenticated;

-- Reward redemption is the one client-triggered path into the ledger, so
-- it's exposed as a callable RPC rather than a bare trigger. The row lock
-- via the update below prevents a double-spend from two concurrent
-- redemption requests racing on the same balance.
create function public.redeem_reward(p_reward_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost int;
  v_stock int;
  v_status text;
  v_balance int;
begin
  select cost_points, stock_quantity, status into v_cost, v_stock, v_status
  from public.rewards where id = p_reward_id for update;

  if v_status is null then
    raise exception 'reward not found' using errcode = 'P0002';
  end if;

  if v_status <> 'active' then
    raise exception 'reward is not available' using errcode = '22023';
  end if;

  if v_stock is not null and v_stock <= 0 then
    raise exception 'reward is out of stock' using errcode = '22023';
  end if;

  select current_balance into v_balance
  from public.user_points where user_id = auth.uid() for update;

  if v_balance is null or v_balance < v_cost then
    raise exception 'insufficient points balance' using errcode = '22023';
  end if;

  if v_stock is not null then
    update public.rewards
    set stock_quantity = stock_quantity - 1,
        status = case when stock_quantity - 1 <= 0 then 'out_of_stock' else status end
    where id = p_reward_id;
  end if;

  perform public.award_points(auth.uid(), -v_cost, 'redeem', 'reward_redemption', p_reward_id, 'Reward redeemed');
end;
$$;

grant execute on function public.redeem_reward(uuid) to authenticated;

-- Auto-award the reporter when staff mark an issue resolved.
create function public.handle_issue_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'resolved' and old.status is distinct from 'resolved' then
    new.resolved_at := now();
    perform public.award_points(new.reporter_id, 25, 'earn', 'issue_report', new.id, 'Issue resolved');
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_issue_resolved() from public, anon, authenticated;

create trigger issues_award_points_on_resolve
  before update on public.issues
  for each row execute function public.handle_issue_resolved();

-- Auto-award a participant when their quest attempt is marked completed.
create function public.handle_quest_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points int;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
    select points_reward into v_points from public.quests where id = new.quest_id;
    new.points_awarded := coalesce(v_points, 0);
    perform public.award_points(new.user_id, coalesce(v_points, 0), 'earn', 'quest_completion', new.quest_id, 'Quest completed');
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_quest_completed() from public, anon, authenticated;

create trigger quest_participants_award_points_on_complete
  before update on public.quest_participants
  for each row execute function public.handle_quest_completed();

-- ---------------------------------------------------------------------
-- 14. badges
-- ---------------------------------------------------------------------

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_path text,
  tier text not null default 'bronze',
  criteria_type text not null,
  criteria_value int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint badges_tier_check check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  constraint badges_criteria_type_check
    check (criteria_type in ('points_threshold', 'issues_reported', 'quests_completed', 'streak_days', 'manual'))
);

alter table public.badges enable row level security;

create policy "badges_select_active"
  on public.badges
  for select
  to anon, authenticated
  using (is_active);

insert into public.badges (slug, name, tier, criteria_type, criteria_value) values
  ('first_report',    'First Report',      'bronze',   'issues_reported',  1),
  ('cleanup_crew',     'Cleanup Crew',      'silver',   'quests_completed', 5),
  ('point_collector',  'Point Collector',   'gold',     'points_threshold', 1000),
  ('week_streak',      '7-Day Streak',      'silver',   'streak_days',      7);

-- ---------------------------------------------------------------------
-- 15. user_badges
-- ---------------------------------------------------------------------

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_reason text,
  awarded_at timestamptz not null default now(),
  constraint user_badges_unique unique (user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges (user_id);

alter table public.user_badges enable row level security;

create policy "user_badges_select_all"
  on public.user_badges
  for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 16. rewards
-- ---------------------------------------------------------------------

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  reward_type text not null,
  cost_points int not null,
  stock_quantity int,
  partner_name text,
  status text not null default 'active',
  valid_from timestamptz,
  valid_until timestamptz,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rewards_cost_check check (cost_points >= 0),
  constraint rewards_type_check
    check (reward_type in ('voucher', 'discount', 'merchandise', 'donation', 'badge_unlock')),
  constraint rewards_status_check
    check (status in ('active', 'inactive', 'out_of_stock', 'expired'))
);

create index rewards_status_idx on public.rewards (status) where deleted_at is null;

create trigger rewards_set_updated_at
  before update on public.rewards
  for each row execute function public.set_updated_at();

alter table public.rewards enable row level security;

create policy "rewards_select_active"
  on public.rewards
  for select
  to authenticated
  using (status = 'active' and deleted_at is null);

create policy "rewards_write_staff"
  on public.rewards
  for all
  to authenticated
  using (public.current_role() in ('authority', 'admin'))
  with check (public.current_role() in ('authority', 'admin'));

-- ---------------------------------------------------------------------
-- 17. notifications
-- ---------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check
    check (type in ('issue_update', 'quest_reminder', 'reward_redeemed', 'badge_earned', 'community', 'system'))
);

create index notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "notifications_update_own"
  on public.notifications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 18. community_memberships
-- ---------------------------------------------------------------------

create table public.community_memberships (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  constraint community_memberships_unique unique (community_id, user_id),
  constraint community_memberships_role_check check (role in ('member', 'moderator', 'admin')),
  constraint community_memberships_status_check check (status in ('active', 'left', 'removed'))
);

create index community_memberships_user_idx on public.community_memberships (user_id);
create index community_memberships_community_idx on public.community_memberships (community_id);

alter table public.community_memberships enable row level security;

create policy "community_memberships_select_all"
  on public.community_memberships
  for select
  to authenticated
  using (true);

create policy "community_memberships_insert_own"
  on public.community_memberships
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "community_memberships_update_own_or_staff"
  on public.community_memberships
  for update
  to authenticated
  using (user_id = (select auth.uid()) or public.current_role() in ('authority', 'admin'))
  with check (user_id = (select auth.uid()) or public.current_role() in ('authority', 'admin'));

create function public.sync_community_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'active' then
    update public.communities set member_count = member_count + 1 where id = new.community_id;
  elsif tg_op = 'UPDATE' and new.status <> old.status then
    update public.communities
    set member_count = member_count + case when new.status = 'active' then 1 else -1 end
    where id = new.community_id;
  elsif tg_op = 'DELETE' and old.status = 'active' then
    update public.communities set member_count = greatest(member_count - 1, 0) where id = old.community_id;
  end if;
  return coalesce(new, old);
end;
$$;

revoke execute on function public.sync_community_member_count() from public, anon, authenticated;

create trigger community_memberships_sync_count
  after insert or update or delete on public.community_memberships
  for each row execute function public.sync_community_member_count();

-- ---------------------------------------------------------------------
-- 19. impact_metrics (daily rollups, written by a scheduled job under
--     service_role — no client write path)
-- ---------------------------------------------------------------------

create table public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null,
  scope_key text not null,
  metric_date date not null,
  issues_reported int not null default 0,
  issues_resolved int not null default 0,
  quests_completed int not null default 0,
  co2_saved_kg numeric(10, 2) not null default 0,
  waste_collected_kg numeric(10, 2) not null default 0,
  trees_planted int not null default 0,
  active_participants int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_metrics_unique unique (scope_type, scope_key, metric_date),
  constraint impact_metrics_scope_check check (scope_type in ('city', 'community', 'global'))
);

create index impact_metrics_scope_date_idx on public.impact_metrics (scope_type, scope_key, metric_date desc);

create trigger impact_metrics_set_updated_at
  before update on public.impact_metrics
  for each row execute function public.set_updated_at();

alter table public.impact_metrics enable row level security;

create policy "impact_metrics_select_all"
  on public.impact_metrics
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 20. activities_feed (system-generated timeline; no client insert path)
-- ---------------------------------------------------------------------

create table public.activities_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_type text not null,
  reference_type text,
  reference_id uuid,
  visibility text not null default 'public',
  community_id uuid references public.communities (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activities_feed_type_check check (activity_type in
    ('issue_reported', 'issue_resolved', 'quest_joined', 'quest_completed', 'badge_earned', 'reward_redeemed', 'community_joined', 'level_up')),
  constraint activities_feed_visibility_check check (visibility in ('public', 'community', 'private'))
);

create index activities_feed_user_idx on public.activities_feed (user_id, created_at desc);
create index activities_feed_community_idx on public.activities_feed (community_id, created_at desc);

alter table public.activities_feed enable row level security;

create policy "activities_feed_select_visible"
  on public.activities_feed
  for select
  to authenticated
  using (
    visibility = 'public'
    or user_id = (select auth.uid())
    or (
      visibility = 'community'
      and exists (
        select 1 from public.community_memberships m
        where m.community_id = activities_feed.community_id
          and m.user_id = (select auth.uid())
          and m.status = 'active'
      )
    )
  );

-- ---------------------------------------------------------------------
-- 21. user_devices (push tokens for mobile — the practical stand-in for
--     "auth sessions" in a mobile client; JWT/session lifecycle itself
--     stays entirely inside Supabase Auth)
-- ---------------------------------------------------------------------

create table public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  device_id text not null,
  push_token text,
  platform text not null,
  app_version text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint user_devices_unique unique (user_id, device_id),
  constraint user_devices_platform_check check (platform in ('ios', 'android', 'web'))
);

alter table public.user_devices enable row level security;

create policy "user_devices_manage_own"
  on public.user_devices
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
