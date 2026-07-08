-- ============================================================================
-- Migration 002: NextAuth compatibility
-- Changes user_id from uuid (auth.users FK) to text (email-based)
-- since the app uses NextAuth (Google OAuth), not Supabase Auth.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Drop existing RLS policies
-- --------------------------------------------------------------------------
drop policy if exists "Users can view their own properties"   on public.properties;
drop policy if exists "Users can insert their own properties"  on public.properties;
drop policy if exists "Users can update their own properties"  on public.properties;
drop policy if exists "Users can delete their own properties"  on public.properties;

drop policy if exists "Users can view their own config"   on public.user_config;
drop policy if exists "Users can insert their own config"  on public.user_config;
drop policy if exists "Users can update their own config"  on public.user_config;
drop policy if exists "Users can delete their own config"  on public.user_config;

-- --------------------------------------------------------------------------
-- 2. Alter user_id columns from uuid to text
-- --------------------------------------------------------------------------
alter table public.properties
  drop constraint if exists properties_user_id_fkey,
  alter column user_id type text using user_id::text;

alter table public.user_config
  drop constraint if exists user_config_user_id_fkey,
  alter column user_id type text using user_id::text;

-- --------------------------------------------------------------------------
-- 3. New RLS policies — match user_id via request header
--    The app sends user_id as x-user-id header via Supabase client config.
--    For service-role access (server API routes), RLS is bypassed.
-- --------------------------------------------------------------------------

-- Properties
create policy "properties_select" on public.properties for select
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "properties_insert" on public.properties for insert
  with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "properties_update" on public.properties for update
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id')
  with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "properties_delete" on public.properties for delete
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id');

-- User config
create policy "user_config_select" on public.user_config for select
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "user_config_insert" on public.user_config for insert
  with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "user_config_update" on public.user_config for update
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id')
  with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');

create policy "user_config_delete" on public.user_config for delete
  using (user_id = current_setting('request.headers', true)::json->>'x-user-id');
