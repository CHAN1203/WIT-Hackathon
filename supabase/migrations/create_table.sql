-- Create user_preferences table
create table public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  programming_objective text,
  skill_level text,
  timeframe_weeks integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_courses table
create table public.user_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_name text not null,
  progress integer default 0,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_preferences enable row level security;
alter table public.user_courses enable row level security;

-- Create policies
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can view own courses"
  on public.user_courses for select
  using (auth.uid() = user_id);

create policy "Users can update own courses"
  on public.user_courses for update
  using (auth.uid() = user_id);

create policy "Users can insert own courses"
  on public.user_courses for insert
  with check (auth.uid() = user_id);

