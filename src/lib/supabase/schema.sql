-- NearNow Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up all tables and security policies.

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  handle text unique not null,
  avatar text,
  college text,
  year text,
  location text,
  bio text,
  reputation integer default 100,
  xp integer default 0,
  xp_to_next integer default 1000,
  skills text[] default '{}',
  looking_for text[] default '{}',
  github text,
  linkedin text,
  portfolio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Restrict column-level UPDATE grants so clients cannot alter xp or reputation directly
revoke update on public.profiles from authenticated, anon, public;
grant update (name, handle, avatar, college, year, location, bio, skills, looking_for, github, linkedin, portfolio, updated_at)
  on public.profiles to authenticated;

-- 2. ACTIVITIES TABLE
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  content text not null,
  meta text,
  tags text[] default '{}',
  xp integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for activities
alter table public.activities enable row level security;

create policy "Activities are viewable by everyone"
  on public.activities for select
  using (true);

create policy "Authenticated users can create activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own activities"
  on public.activities for update
  using (auth.uid() = user_id);

create policy "Users can delete their own activities"
  on public.activities for delete
  using (auth.uid() = user_id);

-- 3. PROJECTS TABLE
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  tagline text not null,
  description text not null,
  category text not null,
  status text default 'building',
  stack text[] default '{}',
  open_roles jsonb default '[]'::jsonb,
  members jsonb default '[]'::jsonb,
  tasks jsonb default '[]'::jsonb,
  college text,
  github_url text,
  live_url text,
  xp_reward integer default 150,
  applicants integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for projects
alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

-- Note: No INSERT policy for authenticated users. Projects must be created strictly via SECURITY DEFINER create_project_with_xp RPC.

create policy "Project owners can update their projects"
  on public.projects for update
  using (auth.uid() = owner_id);

revoke update on public.projects from authenticated, anon, public;
grant update (name, tagline, description, category, status, stack, open_roles, members, tasks, college, github_url, live_url, applicants)
  on public.projects to authenticated;

create policy "Project owners can delete their projects"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- 4. MISSIONS TABLE
create table if not exists public.missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null,
  xp integer default 100,
  difficulty text default 'Intermediate',
  estimated_time text default '2-3 hours',
  skills text[] default '{}',
  deliverables text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for missions
alter table public.missions enable row level security;

create policy "Missions are viewable by everyone"
  on public.missions for select
  using (true);

-- 5. USER MISSIONS TABLE
create table if not exists public.user_missions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mission_id uuid references public.missions(id) on delete cascade not null,
  status text default 'completed',
  submission_url text,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, mission_id)
);

-- Enable RLS for user_missions
alter table public.user_missions enable row level security;

create policy "User missions are viewable by everyone"
  on public.user_missions for select
  using (true);

-- Note: No INSERT/UPDATE/DELETE policies defined for user_missions for authenticated/anon. Insertions are performed exclusively via SECURITY DEFINER complete_mission_with_xp RPC.

-- 6. OPPORTUNITIES TABLE
create table if not exists public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company_or_org text not null,
  type text not null,
  location text default 'Remote / India',
  stipend_or_prize text,
  deadline text,
  description text not null,
  tags text[] default '{}',
  apply_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for opportunities
alter table public.opportunities enable row level security;

create policy "Opportunities are viewable by everyone"
  on public.opportunities for select
  using (true);

-- 7. COMMUNITIES TABLE
create table if not exists public.communities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text not null,
  category text not null,
  avatar text,
  banner text,
  creator_id uuid references public.profiles(id) on delete set null,
  members_count integer default 0,
  posts_count integer default 0,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.communities enable row level security;

create policy "Communities are viewable by everyone"
  on public.communities for select using (true);

create policy "Authenticated users can create communities"
  on public.communities for insert with check (auth.uid() = creator_id);

create policy "Community creators can update community details"
  on public.communities for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

-- Restrict column-level UPDATE grants so clients cannot alter counters directly
revoke update on public.communities from authenticated, anon, public;
grant update (name, slug, description, category, avatar, banner, tags)
  on public.communities to authenticated;

-- 8. COMMUNITY MEMBERS TABLE
create table if not exists public.community_members (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (community_id, user_id)
);

alter table public.community_members enable row level security;

create policy "Community memberships are viewable by everyone"
  on public.community_members for select using (true);

-- Note: No INSERT policy defined for authenticated/anon. Joining is performed exclusively via SECURITY DEFINER join_community_with_xp RPC (or creator admin setup via service_role).

create policy "Users can leave communities"
  on public.community_members for delete using (auth.uid() = user_id);

-- 9. COMMUNITY POSTS TABLE
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;

create policy "Community posts are viewable by everyone"
  on public.community_posts for select using (true);

create policy "Authenticated users can create community posts"
  on public.community_posts for insert with check (auth.uid() = author_id);

create policy "Authors can update their community posts"
  on public.community_posts for update using (auth.uid() = author_id);

create policy "Authors can delete their community posts"
  on public.community_posts for delete using (auth.uid() = author_id);

-- 10. XP LOGS TABLE
create table if not exists public.xp_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  reason text not null,
  source_key text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.xp_logs enable row level security;

create policy "XP logs are viewable by everyone"
  on public.xp_logs for select using (true);

-- Drop deprecated unconstrained increment_user_xp function if it exists
drop function if exists public.increment_user_xp(uuid, integer);
drop function if exists public.increment_user_xp;

-- 11. ATOMIC XP AWARD & TRANSACTION LOGGING FUNCTION
create or replace function public.award_user_xp(user_id_input uuid, xp_amount integer, reason_input text)
returns void as $$
begin
  -- 1. Explicit service_role / trusted context authorization check
  if auth.role() != 'service_role' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Unauthorized: award_user_xp can only be executed by trusted server context';
  end if;

  -- 2. Verify target profile exists
  if not exists (select 1 from public.profiles where id = user_id_input) then
    raise exception 'Target user profile does not exist';
  end if;

  -- 3. Enforce strict XP bounds
  if xp_amount <= 0 or xp_amount > 500 then
    raise exception 'Invalid XP amount: must be between 1 and 500';
  end if;

  -- 4. Atomic increment on profiles
  update public.profiles
  set xp = coalesce(xp, 0) + xp_amount
  where id = user_id_input;

  -- 5. Atomic insertion into xp_logs
  insert into public.xp_logs (user_id, amount, reason)
  values (user_id_input, xp_amount, reason_input);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.award_user_xp(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.award_user_xp(uuid, integer, text) to service_role;


-- 12. ATOMIC DOMAIN TRANSACTIONS FOR LEGITIMATE USER ACTIONS
create or replace function public.complete_mission_with_xp(
  user_id_input uuid,
  mission_id_input uuid,
  submission_url_input text default null
)
returns jsonb as $$
declare
  target_mission record;
  already_completed boolean := false;
  xp_already_awarded boolean := false;
  source_key_val text;
begin
  if auth.role() != 'service_role' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Unauthorized: complete_mission_with_xp can only be executed by trusted server context';
  end if;

  if not exists (select 1 from public.profiles where id = user_id_input) then
    raise exception 'Target user profile does not exist';
  end if;

  select * into target_mission from public.missions where id = mission_id_input;
  if not found then
    raise exception 'Mission does not exist';
  end if;

  source_key_val := 'mission:' || user_id_input || ':' || mission_id_input;

  select exists(
    select 1 from public.user_missions
    where user_id = user_id_input and mission_id = mission_id_input
  ) into already_completed;

  select exists(
    select 1 from public.xp_logs
    where user_id = user_id_input and source_key = source_key_val
  ) into xp_already_awarded;

  if already_completed and xp_already_awarded then
    return jsonb_build_object('success', false, 'already_completed', true, 'message', 'You have already completed this mission.');
  end if;

  if not already_completed then
    insert into public.user_missions (user_id, mission_id, submission_url, status, completed_at)
    values (user_id_input, mission_id_input, submission_url_input, 'completed', timezone('utc'::text, now()));
  end if;

  if not xp_already_awarded then
    update public.profiles
    set xp = coalesce(xp, 0) + target_mission.xp
    where id = user_id_input;

    insert into public.xp_logs (user_id, amount, reason, source_key)
    values (user_id_input, target_mission.xp, 'Completed Skill Mission: ' || target_mission.title, source_key_val);
  end if;

  return jsonb_build_object('success', true, 'xp_awarded', target_mission.xp);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.complete_mission_with_xp(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.complete_mission_with_xp(uuid, uuid, text) to service_role;


create or replace function public.join_community_with_xp(
  user_id_input uuid,
  comm_id_input uuid
)
returns jsonb as $$
declare
  target_comm record;
  already_joined boolean := false;
  xp_already_awarded boolean := false;
  source_key_val text;
begin
  if auth.role() != 'service_role' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Unauthorized: join_community_with_xp can only be executed by trusted server context';
  end if;

  if not exists (select 1 from public.profiles where id = user_id_input) then
    raise exception 'Target user profile does not exist';
  end if;

  select * into target_comm from public.communities where id = comm_id_input;
  if not found then
    raise exception 'Community does not exist';
  end if;

  source_key_val := 'community_join:' || user_id_input || ':' || comm_id_input;

  select exists(
    select 1 from public.community_members
    where user_id = user_id_input and community_id = comm_id_input
  ) into already_joined;

  select exists(
    select 1 from public.xp_logs
    where user_id = user_id_input and source_key = source_key_val
  ) into xp_already_awarded;

  if already_joined and xp_already_awarded then
    return jsonb_build_object('success', false, 'already_joined', true, 'message', 'You are already a member of this community.');
  end if;

  if not already_joined then
    insert into public.community_members (community_id, user_id, role)
    values (comm_id_input, user_id_input, 'member');
  end if;

  if not xp_already_awarded then
    update public.profiles
    set xp = coalesce(xp, 0) + 20
    where id = user_id_input;

    insert into public.xp_logs (user_id, amount, reason, source_key)
    values (user_id_input, 20, 'Joined community: ' || target_comm.name, source_key_val);
  end if;

  return jsonb_build_object('success', true, 'xp_awarded', 20);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.join_community_with_xp(uuid, uuid) from public, anon, authenticated;
grant execute on function public.join_community_with_xp(uuid, uuid) to service_role;


create or replace function public.create_project_with_xp(
  user_id_input uuid,
  name_input text,
  tagline_input text,
  description_input text,
  category_input text,
  stack_input text[],
  open_roles_input jsonb,
  tasks_input jsonb,
  college_input text,
  github_url_input text,
  live_url_input text
)
returns jsonb as $$
declare
  new_project_id uuid;
  project_xp_awarded_count integer := 0;
  should_award_xp boolean := false;
  source_key_val text;
begin
  if auth.role() != 'service_role' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Unauthorized: create_project_with_xp can only be executed by trusted server context';
  end if;

  if not exists (select 1 from public.profiles where id = user_id_input) then
    raise exception 'Target user profile does not exist';
  end if;

  if name_input is null or trim(name_input) = '' then
    raise exception 'Project name cannot be empty';
  end if;

  insert into public.projects (
    owner_id, name, tagline, description, category, status,
    stack, open_roles, tasks, college, github_url, live_url, xp_reward
  )
  values (
    user_id_input, trim(name_input), trim(tagline_input), trim(description_input),
    category_input, 'building', stack_input, open_roles_input, tasks_input,
    college_input, github_url_input, live_url_input, 150
  )
  returning id into new_project_id;

  source_key_val := 'project_launch:' || user_id_input || ':' || new_project_id;

  -- Transaction advisory lock to guarantee race-safe XP cap enforcement under concurrent creation
  perform pg_advisory_xact_lock(hashtext('project_xp_cap:' || user_id_input::text));

  select count(*) into project_xp_awarded_count
  from public.xp_logs
  where user_id = user_id_input and source_key like 'project_launch:%';

  if project_xp_awarded_count < 3 then
    should_award_xp := true;
  end if;

  if should_award_xp then
    update public.profiles
    set xp = coalesce(xp, 0) + 150
    where id = user_id_input;

    insert into public.xp_logs (user_id, amount, reason, source_key)
    values (user_id_input, 150, 'Launched project: ' || trim(name_input), source_key_val);
  end if;

  return jsonb_build_object(
    'success', true,
    'project_id', new_project_id,
    'xp_awarded', case when should_award_xp then 150 else 0 end
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.create_project_with_xp(uuid, text, text, text, text, text[], jsonb, jsonb, text, text, text) from public, anon, authenticated;
grant execute on function public.create_project_with_xp(uuid, text, text, text, text, text[], jsonb, jsonb, text, text, text) to service_role;


-- 13. AUTOMATIC COMMUNITY COUNTER TRIGGERS
create or replace function public.update_community_member_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.communities
    set members_count = coalesce(members_count, 0) + 1
    where id = NEW.community_id;
  elsif (TG_OP = 'DELETE') then
    update public.communities
    set members_count = greatest(0, coalesce(members_count, 0) - 1)
    where id = OLD.community_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.update_community_member_count() from public, anon, authenticated;

drop trigger if exists trg_community_member_count on public.community_members;
create trigger trg_community_member_count
  after insert or delete on public.community_members
  for each row execute function public.update_community_member_count();

create or replace function public.update_community_post_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.communities
    set posts_count = coalesce(posts_count, 0) + 1
    where id = NEW.community_id;
  elsif (TG_OP = 'DELETE') then
    update public.communities
    set posts_count = greatest(0, coalesce(posts_count, 0) - 1)
    where id = OLD.community_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.update_community_post_count() from public, anon, authenticated;

drop trigger if exists trg_community_post_count on public.community_posts;
create trigger trg_community_post_count
  after insert or delete on public.community_posts
  for each row execute function public.update_community_post_count();

-- 14. INDEXES FOR PERFORMANCE
create index if not exists idx_community_members_comm_id on public.community_members(community_id);
create index if not exists idx_community_members_user_id on public.community_members(user_id);
create index if not exists idx_community_posts_comm_id on public.community_posts(community_id);
create index if not exists idx_xp_logs_user_id on public.xp_logs(user_id);
create index if not exists idx_xp_logs_source_key on public.xp_logs(source_key);
create index if not exists idx_profiles_college on public.profiles(college);
create index if not exists idx_projects_college on public.projects(college);
