-- ============================================================================
-- Hunian App — Combined Schema (NextAuth compatible)
-- Run this INSTEAD of 001 + 002 on a fresh Supabase project.
-- user_id is text (email) since auth is handled by NextAuth, not Supabase Auth.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Properties table
-- --------------------------------------------------------------------------
create table if not exists public.properties (
  id            text primary key,
  user_id       text not null,

  -- Basic info
  name          text not null,
  type          text not null check (type in ('apartemen', 'kontrakan', 'kost')),
  status        text not null default 'active'
                  check (status in ('active', 'further_survey', 'favorite', 'taken', 'rejected', 'chosen')),

  -- Price
  rent_price    numeric not null default 0,
  rent_period   text not null default 'bulan' check (rent_period in ('bulan', 'tahun')),

  -- Location
  latitude      double precision,
  longitude     double precision,
  location_accuracy text not null default 'approximate'
                  check (location_accuracy in ('verified', 'approximate')),
  address       text,
  area          text,

  -- Condition
  size_sqm      numeric,
  bedrooms      integer,
  bathrooms     integer,
  building_condition integer check (building_condition between 1 and 5),
  furnish_level text check (furnish_level in ('unfurnished', 'semi', 'furnished')),
  floor         integer,
  facing        text,

  -- Environment
  security      text check (security in ('satpam24', 'one_gate', 'none')),
  flood_history text check (flood_history in ('never', 'yes', 'unknown')),
  available_periods text[] check (
    available_periods <@ array['bulanan', '3bulan', '6bulan', 'tahunan']::text[]
  ),
  deposit_months integer,

  -- Costs & photos (flexible key-value data)
  costs         jsonb not null default '{}'::jsonb,
  photos        jsonb not null default '{}'::jsonb,

  -- Notes
  notes         text,

  -- Survey completeness
  survey_completeness text not null default 'quick'
                  check (survey_completeness in ('quick', 'full')),

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 2. User config table (one row per user)
-- --------------------------------------------------------------------------
create table if not exists public.user_config (
  user_id             text primary key,

  budget_ideal        numeric not null default 0,
  budget_max          numeric not null default 0,
  stretch_percent     numeric not null default 0,
  planned_stay_months integer not null default 12,

  office_address      text,
  office_latitude     double precision,
  office_longitude    double precision,

  weights             jsonb not null default '{
    "affordability": 1,
    "accessibility": 1,
    "condition": 1,
    "livability": 1,
    "environment": 1,
    "value": 1,
    "commitment": 1
  }'::jsonb,

  deal_breakers       jsonb not null default '[]'::jsonb,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 3. Indexes
-- --------------------------------------------------------------------------
create index if not exists idx_properties_user_id  on public.properties (user_id);
create index if not exists idx_properties_status   on public.properties (user_id, status);
create index if not exists idx_properties_type     on public.properties (user_id, type);
create index if not exists idx_properties_created  on public.properties (created_at desc);

-- --------------------------------------------------------------------------
-- 4. Automatic updated_at trigger
-- --------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
  before update on public.properties
  for each row execute function public.handle_updated_at();

drop trigger if exists set_user_config_updated_at on public.user_config;
create trigger set_user_config_updated_at
  before update on public.user_config
  for each row execute function public.handle_updated_at();

-- --------------------------------------------------------------------------
-- 5. Row Level Security — disabled for now (auth via NextAuth + service role)
--    The /api/sync route uses service_role key and filters by user_id server-side.
-- --------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.user_config enable row level security;

-- Allow service_role full access (default behavior)
-- Allow anon/authenticated no direct access (all goes through /api/sync)
create policy "service_role_properties" on public.properties
  for all using (true) with check (true);

create policy "service_role_user_config" on public.user_config
  for all using (true) with check (true);

-- --------------------------------------------------------------------------
-- 6. Storage: photos bucket
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('photos', 'photos', true)
  on conflict (id) do nothing;
