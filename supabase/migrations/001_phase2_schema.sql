-- ============================================================================
-- BlendIn — Supabase Database Migration (Phase 2)
-- File: supabase/migrations/001_phase2_schema.sql
--
-- Run this in your Supabase project's SQL Editor, or via the Supabase CLI:
--   npx supabase db push
--
-- This creates the full schema needed for Phase 2 (auth + profile) and
-- Phase 3 (multi-device rooms). RLS policies are included.
-- ============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
-- pgcrypto for gen_random_bytes (used to generate room codes)
create extension if not exists pgcrypto;

-- ── Enums ─────────────────────────────────────────────────────────────────────
create type room_status as enum ('waiting', 'playing', 'finished');

-- ── profiles ──────────────────────────────────────────────────────────────────
-- One row per Supabase auth user. Created/updated via upsert on sign-in.

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 30),
  avatar_id    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table profiles is 'Public profile data for each BlendIn user.';

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- RLS: Enable and configure
alter table profiles enable row level security;

-- Anyone can read profiles (needed to show player names in rooms)
create policy "profiles: anyone can read"
  on profiles for select using (true);

-- Users can only insert/update their own profile
create policy "profiles: own insert"
  on profiles for insert with check (auth.uid() = id);

create policy "profiles: own update"
  on profiles for update using (auth.uid() = id);

-- ── rooms ─────────────────────────────────────────────────────────────────────
-- Each game session hosted by one user.

create table if not exists rooms (
  id         uuid primary key default gen_random_uuid(),
  -- 6-char uppercase alphanumeric join code (no ambiguous chars: 0/O, 1/I/L)
  code       text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  host_id    uuid not null references profiles(id) on delete cascade,
  status     room_status not null default 'waiting',
  settings   jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table rooms is 'Active and historical game rooms.';
comment on column rooms.code is 'Short alphanumeric join code shown to players.';
comment on column rooms.settings is 'Snapshot of RoomSettings: variant, imposterCount, selectedPackIds.';

create trigger rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at();

-- Index for fast code lookup (join flow)
create index if not exists rooms_code_idx on rooms(code);
-- Index for host's rooms
create index if not exists rooms_host_idx on rooms(host_id);

alter table rooms enable row level security;

-- Anyone can read rooms (needed to join by code)
create policy "rooms: anyone can read"
  on rooms for select using (true);

-- Any authenticated user can create a room (they become the host)
create policy "rooms: authenticated insert"
  on rooms for insert with check (auth.uid() = host_id);

-- Only the host can update the room (change status, settings)
create policy "rooms: host update"
  on rooms for update using (auth.uid() = host_id);

-- Only the host can delete (close) a room
create policy "rooms: host delete"
  on rooms for delete using (auth.uid() = host_id);

-- ── room_participants ──────────────────────────────────────────────────────────
-- Junction table: which users are in which room.

create table if not exists room_participants (
  room_id      uuid not null references rooms(id) on delete cascade,
  profile_id   uuid not null references profiles(id) on delete cascade,
  display_name text not null, -- Snapshot at join time (display_name can change)
  score        int not null default 0,
  is_ready     boolean not null default false,
  joined_at    timestamptz not null default now(),
  primary key (room_id, profile_id)
);

comment on table room_participants is 'Players currently in a room.';

create index if not exists rp_room_idx on room_participants(room_id);
create index if not exists rp_profile_idx on room_participants(profile_id);

alter table room_participants enable row level security;

-- Anyone in a room can see all participants
create policy "room_participants: room members can read"
  on room_participants for select using (true);

-- Users can insert themselves (join a room)
create policy "room_participants: self insert"
  on room_participants for insert with check (auth.uid() = profile_id);

-- Users can only update their own row (ready toggle)
create policy "room_participants: self update"
  on room_participants for update using (auth.uid() = profile_id);

-- Users can remove themselves (leave). Host can remove anyone (kick).
create policy "room_participants: self or host delete"
  on room_participants for delete using (
    auth.uid() = profile_id
    or auth.uid() = (select host_id from rooms where id = room_id)
  );

-- ── game_rounds ───────────────────────────────────────────────────────────────
-- Stores server-authoritative round state. Used for reconnection + telemetry.
-- The `state` JSONB column is opaque — never served in full to any client.
-- Individual player roles are served via Edge Function only.

create table if not exists game_rounds (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references rooms(id) on delete cascade,
  round_number int not null check (round_number > 0),
  state        jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  unique (room_id, round_number)
);

comment on table game_rounds is 'Server-authoritative state per round. Never fully exposed to clients.';
comment on column game_rounds.state is 'Contains word, category, all roles. Role reveals served via Edge Function only.';

create index if not exists gr_room_idx on game_rounds(room_id);

alter table game_rounds enable row level security;

-- Only the host (via service role in Edge Function) can read/write rounds.
-- Individual players get their role via a dedicated RPC call, not direct table access.
create policy "game_rounds: host read"
  on game_rounds for select using (
    auth.uid() = (select host_id from rooms where id = room_id)
  );

create policy "game_rounds: host insert"
  on game_rounds for insert with check (
    auth.uid() = (select host_id from rooms where id = room_id)
  );

-- ── Helper function: generate unique room code ─────────────────────────────────
-- Used by the create_room RPC to generate a collision-resistant code.

create or replace function generate_room_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- No ambiguous: 0/O/1/I/L
  code  text;
  tries int := 0;
begin
  loop
    -- Pick 6 random chars
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;

    -- Ensure uniqueness
    if not exists (select 1 from rooms where rooms.code = code and status != 'finished') then
      return code;
    end if;

    tries := tries + 1;
    if tries > 100 then
      raise exception 'Could not generate a unique room code after 100 attempts';
    end if;
  end loop;
end;
$$;

-- ── RPC: create_room ──────────────────────────────────────────────────────────
-- Called by the host to atomically create a room + join as first participant.
-- Returns the new room row including the generated code.

create or replace function create_room(settings jsonb)
returns rooms language plpgsql security definer as $$
declare
  new_room rooms;
  host     uuid := auth.uid();
begin
  if host is null then
    raise exception 'Not authenticated';
  end if;

  -- Create room
  insert into rooms (host_id, code, settings)
  values (host, generate_room_code(), settings)
  returning * into new_room;

  -- Auto-join host as first participant
  insert into room_participants (room_id, profile_id, display_name)
  select new_room.id, host, display_name
  from profiles
  where id = host;

  return new_room;
end;
$$;

comment on function create_room is 'Atomically create a room and join the host as the first participant.';

-- ── RPC: join_room ────────────────────────────────────────────────────────────
-- Called by joining players. Validates code + room status.

create or replace function join_room(room_code text)
returns rooms language plpgsql security definer as $$
declare
  target_room rooms;
  caller      uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select * into target_room
  from rooms
  where code = upper(room_code) and status = 'waiting';

  if not found then
    raise exception 'Room not found or not accepting players';
  end if;

  -- Insert participant (ignore if already in room)
  insert into room_participants (room_id, profile_id, display_name)
  select target_room.id, caller, display_name
  from profiles
  where id = caller
  on conflict (room_id, profile_id) do nothing;

  return target_room;
end;
$$;

comment on function join_room is 'Join a room by 6-char code. Validates the room is in waiting status.';
