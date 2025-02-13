-- Create chat_history table
create table public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  response text not null,
  context jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_history enable row level security;

-- Create policies
create policy "Users can insert their own chat history"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own chat history"
  on public.chat_history for select
  using (auth.uid() = user_id);

