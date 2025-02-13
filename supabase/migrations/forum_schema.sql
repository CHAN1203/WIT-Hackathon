-- Create forum_posts table with moderation fields
create table public.forum_posts (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    content text not null,
    author_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    moderation_status text check (moderation_status in ('pending', 'approved', 'rejected')) default 'pending',
    moderation_confidence float,
    moderation_message text,
    likes integer default 0,
    comments integer default 0
);

-- Enable RLS
alter table public.forum_posts enable row level security;

-- Create policies
create policy "Users can view approved posts"
on public.forum_posts for select
using (moderation_status = 'approved' or auth.uid() = author_id);

create policy "Users can insert their own posts"
on public.forum_posts for insert
with check (auth.uid() = author_id);

create policy "Users can update their own posts"
on public.forum_posts for update
using (auth.uid() = author_id);

