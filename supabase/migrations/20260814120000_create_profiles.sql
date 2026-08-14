-- profiles: one row per auth.users row, created automatically on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_path text,
  role text not null default 'citizen',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('citizen', 'authority', 'admin'))
);

alter table public.profiles enable row level security;

-- A user may read only their own profile.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- A user may update only their own profile row. `id` cannot be repointed at
-- someone else's row because `with check` re-verifies auth.uid() = id on the
-- new row; `role` is separately protected by the trigger below since RLS
-- policies cannot compare a row's old and new values.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Deliberately no insert/delete policy for `authenticated`: rows are created
-- only by handle_new_user() below, and no client can delete a profile.

-- Reject (not silently drop) any attempt to change `role` through an
-- ordinary client update, so self-promotion attempts fail loudly.
create function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'role cannot be changed directly'
      using errcode = '42501';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- Auto-create a profile the moment a new auth user is created, so no
-- authenticated user can ever exist without a matching profile row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'citizen');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
