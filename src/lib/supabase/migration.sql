-- NearNow Safe Idempotent Database Migration Script
-- Safe to run on any existing Supabase instance without data loss or table drop errors.

-- 1. EXTEND PROFILES TABLE WITH MISSING COLUMNS
alter table public.profiles add column if not exists year text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists reputation integer default 100;
alter table public.profiles add column if not exists xp integer default 0;
alter table public.profiles add column if not exists xp_to_next integer default 1000;
alter table public.profiles add column if not exists skills text[] default '{}';
alter table public.profiles add column if not exists looking_for text[] default '{}';
alter table public.profiles add column if not exists github text;
alter table public.profiles add column if not exists linkedin text;
alter table public.profiles add column if not exists portfolio text;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Enable RLS for profiles if not already enabled
alter table public.profiles enable row level security;

-- Safe policy creation for profiles
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone') then
    create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert their own profile') then
    create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update their own profile') then
    create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- 2. ENSURE ACTIVITIES TABLE & POLICIES EXIST
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

alter table public.activities enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'activities' and policyname = 'Activities are viewable by everyone') then
    create policy "Activities are viewable by everyone" on public.activities for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activities' and policyname = 'Authenticated users can create activities') then
    create policy "Authenticated users can create activities" on public.activities for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activities' and policyname = 'Users can update their own activities') then
    create policy "Users can update their own activities" on public.activities for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activities' and policyname = 'Users can delete their own activities') then
    create policy "Users can delete their own activities" on public.activities for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 3. CREATE PROJECTS TABLE & POLICIES
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

alter table public.projects enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Projects are viewable by everyone') then
    create policy "Projects are viewable by everyone" on public.projects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Authenticated users can create projects') then
    create policy "Authenticated users can create projects" on public.projects for insert with check (auth.uid() = owner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Project owners can update their projects') then
    create policy "Project owners can update their projects" on public.projects for update using (auth.uid() = owner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'Project owners can delete their projects') then
    create policy "Project owners can delete their projects" on public.projects for delete using (auth.uid() = owner_id);
  end if;
end $$;

-- 4. CREATE MISSIONS TABLE & POLICIES
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

alter table public.missions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'missions' and policyname = 'Missions are viewable by everyone') then
    create policy "Missions are viewable by everyone" on public.missions for select using (true);
  end if;
end $$;

-- 5. CREATE USER MISSIONS TABLE & POLICIES
create table if not exists public.user_missions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mission_id uuid references public.missions(id) on delete cascade not null,
  status text default 'completed',
  submission_url text,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, mission_id)
);

alter table public.user_missions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_missions' and policyname = 'User missions are viewable by everyone') then
    create policy "User missions are viewable by everyone" on public.user_missions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_missions' and policyname = 'Authenticated users can log user missions') then
    create policy "Authenticated users can log user missions" on public.user_missions for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- 6. CREATE OPPORTUNITIES TABLE & POLICIES
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

alter table public.opportunities enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'opportunities' and policyname = 'Opportunities are viewable by everyone') then
    create policy "Opportunities are viewable by everyone" on public.opportunities for select using (true);
  end if;
end $$;

-- 7. CREATE PROJECT APPLICATIONS TABLE & POLICIES
create table if not exists public.project_applications (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  message text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, applicant_id, role)
);

alter table public.project_applications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'project_applications' and policyname = 'Project owner or applicant can read applications') then
    create policy "Project owner or applicant can read applications" on public.project_applications for select
      using (auth.uid() = applicant_id or exists (select 1 from public.projects where id = project_id and owner_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_applications' and policyname = 'Authenticated users can apply for roles') then
    create policy "Authenticated users can apply for roles" on public.project_applications for insert with check (auth.uid() = applicant_id);
  end if;
end $$;
