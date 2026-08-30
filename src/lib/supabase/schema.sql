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
  using (auth.uid() = id);

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

create policy "Authenticated users can create projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "Project owners can update their projects"
  on public.projects for update
  using (auth.uid() = owner_id);

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

create policy "Authenticated users can log user missions"
  on public.user_missions for insert
  with check (auth.uid() = user_id);

-- 6. OPPORTUNITIES TABLE
create table if not exists public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company_or_org text not null,
  type text not null, -- 'hackathon', 'grant', 'bounty', 'internship', 'fellowship'
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
