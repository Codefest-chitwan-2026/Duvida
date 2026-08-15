-- Geospatial duplicate-check RPC: replaces the mobile app's crude
-- lat/lng bounding-box scan with a real PostGIS radius query against
-- the indexed `issues.location` geography column.
create function public.find_nearby_issues(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_meters int default 500,
  p_limit int default 10
)
returns table (
  id uuid,
  category_id uuid,
  title text,
  description text,
  status text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz,
  distance_meters double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    i.id,
    i.category_id,
    i.title,
    i.description,
    i.status,
    i.address,
    i.latitude,
    i.longitude,
    i.created_at,
    extensions.st_distance(
      i.location,
      extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326)::extensions.geography
    ) as distance_meters
  from public.issues i
  where i.deleted_at is null
    and extensions.st_dwithin(
      i.location,
      extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326)::extensions.geography,
      p_radius_meters
    )
  order by distance_meters asc
  limit p_limit;
$$;

revoke execute on function public.find_nearby_issues(double precision, double precision, int, int) from public, anon;
grant execute on function public.find_nearby_issues(double precision, double precision, int, int) to authenticated;
