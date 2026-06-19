-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  birth_date text not null,
  birth_time text not null,
  birth_place text not null,
  chart_data jsonb not null,
  created_at timestamptz not null default now()
);

create index charts_user_created_idx on public.charts (user_id, created_at desc);

alter table public.charts enable row level security;

create policy "Users read own charts"
  on public.charts
  for select
  using (auth.uid() = user_id);

create policy "Users insert own charts"
  on public.charts
  for insert
  with check (auth.uid() = user_id);

create policy "Users delete own charts"
  on public.charts
  for delete
  using (auth.uid() = user_id);
