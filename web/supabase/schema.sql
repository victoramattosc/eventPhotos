-- ============================================================
-- Event Photos — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Events table
create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  event_date    date,
  access_token  text unique not null default encode(gen_random_bytes(24), 'base64'),
  created_at    timestamptz not null default now()
);

-- Photos table
create table if not exists photos (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  storage_path   text not null,
  author_session text,
  created_at     timestamptz not null default now()
);

create index if not exists photos_event_id_idx on photos(event_id);
create index if not exists photos_created_at_idx on photos(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table events enable row level security;
alter table photos enable row level security;

-- Anyone can read events (validation happens server-side via access_token)
create policy "events_select" on events for select using (true);

-- Only service role can insert/update/delete events
create policy "events_insert" on events for insert with check (false);
create policy "events_update" on events for update using (false);
create policy "events_delete" on events for delete using (false);

-- Anyone can read photos (access controlled by middleware)
create policy "photos_select" on photos for select using (true);

-- Anyone can insert photos (middleware validates session token)
create policy "photos_insert" on photos for insert with check (true);

-- Only service role can delete photos
create policy "photos_delete" on photos for delete using (false);

-- ============================================================
-- Storage bucket (run separately or via Supabase dashboard)
-- ============================================================
-- Create a bucket called "photos" with public read access
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
