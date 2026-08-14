create extension if not exists pgcrypto;
create extension if not exists postgis;

create type public.user_role as enum ('citizen', 'authority', 'admin');
create type public.report_category as enum (
  'pothole', 'garbage', 'streetlight', 'traffic', 'environmental',
  'water', 'infrastructure', 'civic'
);
create type public.report_severity as enum ('low', 'medium', 'high');
create type public.report_status as enum (
  'submitted', 'under_review', 'verified', 'assigned',
  'in_progress', 'resolved', 'rejected', 'duplicate'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role public.user_role not null default 'citizen',
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  category public.report_category not null,
  severity public.report_severity not null,
  status public.report_status not null default 'submitted',
  description text not null check (char_length(description) between 3 and 2000),
  location geography(point, 4326) not null,
  address text,
  assigned_to uuid references public.profiles(id),
  duplicate_of uuid references public.reports(id),
  verified_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'duplicate' and duplicate_of is not null) or status <> 'duplicate'),
  check (duplicate_of is null or duplicate_of <> id)
);

create index reports_location_gix on public.reports using gist (location);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_reporter_idx on public.reports (reporter_id, created_at desc);
create index reports_category_severity_idx on public.reports (category, severity);

create table public.report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id),
  storage_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  created_at timestamptz not null default now()
);

create table public.report_confirmations (
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table public.report_status_history (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.reports(id) on delete cascade,
  from_status public.report_status,
  to_status public.report_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Community member'));
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_authority()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('authority', 'admin')
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger reports_touch_updated_at before update on public.reports
for each row execute function public.touch_updated_at();

create or replace function public.record_report_status_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.report_status_history
      (report_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger reports_record_status after update of status on public.reports
for each row execute function public.record_report_status_change();

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_media enable row level security;
alter table public.report_confirmations enable row level security;
alter table public.report_status_history enable row level security;

create policy "profiles readable by authenticated users" on public.profiles
for select to authenticated using (true);
create policy "users update their basic profile" on public.profiles
for update to authenticated using (id = auth.uid())
with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create policy "citizens read public and owned reports" on public.reports
for select to authenticated using (
  public.is_authority() or reporter_id = auth.uid()
  or status in ('verified', 'assigned', 'in_progress', 'resolved')
);
create policy "citizens create their reports" on public.reports
for insert to authenticated with check (
  reporter_id = auth.uid() and status = 'submitted' and assigned_to is null
  and duplicate_of is null
);
create policy "authorities update reports" on public.reports
for update to authenticated using (public.is_authority())
with check (public.is_authority());

create policy "authenticated users read report media metadata" on public.report_media
for select to authenticated using (
  public.is_authority() or uploader_id = auth.uid()
  or exists (
    select 1 from public.reports r
    where r.id = report_id
      and r.status in ('verified', 'assigned', 'in_progress', 'resolved')
  )
);
create policy "reporters add their report media" on public.report_media
for insert to authenticated with check (
  uploader_id = auth.uid() and exists (
    select 1 from public.reports r
    where r.id = report_id and r.reporter_id = auth.uid()
  )
);

create policy "authenticated users read confirmations" on public.report_confirmations
for select to authenticated using (true);
create policy "users confirm as themselves" on public.report_confirmations
for insert to authenticated with check (user_id = auth.uid());
create policy "users remove own confirmations" on public.report_confirmations
for delete to authenticated using (user_id = auth.uid());

create policy "history readable by reporter and authorities" on public.report_status_history
for select to authenticated using (
  public.is_authority() or exists (
    select 1 from public.reports r
    where r.id = report_id and r.reporter_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('report-media', 'report-media', false)
on conflict (id) do nothing;

create policy "users upload report media into own folder" on storage.objects
for insert to authenticated with check (
  bucket_id = 'report-media' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "owners and authorities read report media" on storage.objects
for select to authenticated using (
  bucket_id = 'report-media' and (
    (storage.foldername(name))[1] = auth.uid()::text or public.is_authority()
  )
);

alter publication supabase_realtime add table public.reports;
