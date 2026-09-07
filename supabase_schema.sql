-- ==============================================================================
-- OMNIVAULT: 24/7 Always-On Cloud Schema (Supabase / PostgreSQL)
-- Multi-User Authentication, Guest Collaboration & Digital Garden
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. VAULT USERS TABLE (Accounts: Owner, Collaborators & Friends)
create table if not exists public.vault_users (
  id text primary key default ('u-' || substr(uuid_generate_v4()::text, 1, 8)),
  email text unique not null,
  name text not null,
  password_hash text not null,
  salt text not null,
  role text not null default 'contributor' check (role in ('owner', 'contributor', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VAULT SESSIONS TABLE (30-day persistent sessions)
create table if not exists public.vault_sessions (
  id text primary key,
  user_id text not null references public.vault_users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- 3. MEDIA ITEMS TABLE (Movies, TV Shows, Books, Articles)
create table if not exists public.media_items (
  id text primary key default ('m-' || substr(uuid_generate_v4()::text, 1, 8)),
  user_id text, -- references vault_users(id) or nullable for guest contributions
  added_by text default 'Nayan Pandey', -- Contributor attribution (e.g. "Nayan Pandey", "Alex")
  type text not null check (type in ('movie', 'tv', 'book', 'article')),
  title text not null,
  creator text not null, -- Director or Author
  release_year integer,
  cover_image text,
  backdrop_image text,
  rating numeric(3,1) check (rating >= 0 and rating <= 10),
  status text not null default 'completed' check (status in ('want_to_consume', 'in_progress', 'completed', 'abandoned')),
  format text check (format in ('physical', 'kindle', 'audiobook', 'article', 'theater', 'streaming', 'other')),
  genres text[] default array[]::text[],
  date_logged date default current_date,
  date_completed date,
  takeaway text,
  notes text, -- Markdown content
  quotes jsonb default '[]'::jsonb, -- Array of { id, quote, page, context, createdAt }
  is_public boolean default true,
  tags text[] default array[]::text[],
  external_id text,
  external_url text,
  page_count integer,
  runtime_minutes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ATOMIC NOTES TABLE (Digital Garden & Bidirectional Thoughts)
create table if not exists public.atomic_notes (
  id text primary key default ('n-' || substr(uuid_generate_v4()::text, 1, 8)),
  user_id text,
  title text not null,
  content text not null, -- Markdown with [[wikilinks]] & #hashtags
  tags text[] default array[]::text[],
  linked_media_ids text[] default array[]::text[],
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. USER SETTINGS TABLE
create table if not exists public.user_settings (
  id text primary key default 'global_settings',
  user_id text,
  tmdb_api_key text,
  user_name text default 'Nayan Pandey',
  theme text default 'dark',
  yearly_reading_goal integer default 25,
  yearly_movie_goal integer default 50,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performance Indices
create index if not exists idx_media_type_status on public.media_items(type, status);
create index if not exists idx_media_is_public on public.media_items(is_public);
create index if not exists idx_media_date_completed on public.media_items(date_completed);
create index if not exists idx_media_added_by on public.media_items(added_by);
create index if not exists idx_notes_is_public on public.atomic_notes(is_public);
create index if not exists idx_vault_users_email on public.vault_users(email);
create index if not exists idx_vault_sessions_user_id on public.vault_sessions(user_id);

-- Row Level Security (RLS)
alter table public.vault_users enable row level security;
alter table public.vault_sessions enable row level security;
alter table public.media_items enable row level security;
alter table public.atomic_notes enable row level security;
alter table public.user_settings enable row level security;

-- Policies: Allow full read/write for service role & public collaboration
create policy "Allow service and public read media" on public.media_items for select using (true);
create policy "Allow collaborative media insert" on public.media_items for insert with check (true);
create policy "Allow collaborative media update" on public.media_items for update using (true);
create policy "Allow collaborative media delete" on public.media_items for delete using (true);

create policy "Allow public read notes" on public.atomic_notes for select using (true);
create policy "Allow notes insert" on public.atomic_notes for insert with check (true);
create policy "Allow notes update" on public.atomic_notes for update using (true);
create policy "Allow notes delete" on public.atomic_notes for delete using (true);

create policy "Allow users auth management" on public.vault_users for all using (true) with check (true);
create policy "Allow sessions management" on public.vault_sessions for all using (true) with check (true);
create policy "Allow settings management" on public.user_settings for all using (true) with check (true);

-- Seed Owner Account (paneynayan79@gmail.com / 11223344)
insert into public.vault_users (id, email, name, password_hash, salt, role)
values (
  'u-owner',
  'paneynayan79@gmail.com',
  'Nayan Pandey',
  'fcb8d8bf62ec4b0e59f0a899cb78bc694e067ba1a5651b6ff221cab69d02d41e9deed2f20d6919e881ab72b896365e7f4cfa87a89d82275174b5b15948de188a',
  '71ce08b94d5acd98523efca92428428f',
  'owner'
)
on conflict (email) do nothing;
