-- ============================================================================
-- BlendIn — Migration: Community Packs (Phase 4)
-- File: supabase/migrations/003_community_packs.sql
--
-- Stores user-published word packs. Anyone can read approved packs.
-- Creators can update/delete their own packs.
-- Moderation flags handled by Phase 5.
-- ============================================================================

drop trigger if exists community_packs_updated_at on community_packs;
drop table if exists pack_votes cascade;
drop table if exists community_packs cascade;

create table if not exists community_packs (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references profiles(id) on delete cascade,
  name        text not null check (length(name) between 2 and 40),
  description text not null default '' check (length(description) <= 200),
  -- Full word list stored as JSONB (matches WordEntry[] shape from client)
  words       jsonb not null default '[]',
  word_count  int generated always as (jsonb_array_length(words)) stored,
  vote_count  int not null default 0,
  -- Moderation
  is_approved boolean not null default false, -- true after admin/auto-approval
  is_flagged  boolean not null default false,
  is_restricted boolean not null default false, -- true if pack requires No-Decoy modes
  -- Timestamps
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table community_packs is 'User-submitted word packs for BlendIn.';
comment on column community_packs.words is 'JSONB array of WordEntry objects. Shape: {id, primary_word, decoy_easy, decoy_medium, decoy_hard, hint_text, mirror_group_id}.';
comment on column community_packs.is_approved is 'Set to true by admin after review. Only approved packs are visible in the community library.';

-- Indexes
create index if not exists cp_creator_idx on community_packs(creator_id);
create index if not exists cp_votes_idx on community_packs(vote_count desc);
create index if not exists cp_approved_idx on community_packs(is_approved) where is_approved = true;

-- Auto-update updated_at
create trigger community_packs_updated_at
  before update on community_packs
  for each row execute function update_updated_at();

-- RLS
alter table community_packs enable row level security;

-- Anyone can read approved, non-flagged packs
create policy "community_packs: public read approved"
  on community_packs for select using (is_approved = true and is_flagged = false);

-- Creators can always read their own packs (draft or approved)
create policy "community_packs: creator read own"
  on community_packs for select using (auth.uid() = creator_id);

-- Authenticated users can submit packs
create policy "community_packs: creator insert"
  on community_packs for insert with check (auth.uid() = creator_id);

-- Creators can update their own packs (but cannot change moderation flags)
create policy "community_packs: creator update"
  on community_packs for update using (auth.uid() = creator_id);

-- Creators can delete their own packs
create policy "community_packs: creator delete"
  on community_packs for delete using (auth.uid() = creator_id);

-- ── Pack votes table ──────────────────────────────────────────────────────────
-- Tracks which users voted on which packs (prevents double-voting)

create table if not exists pack_votes (
  pack_id    uuid not null references community_packs(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pack_id, profile_id)
);

alter table pack_votes enable row level security;

create policy "pack_votes: anyone read"
  on pack_votes for select using (true);

create policy "pack_votes: self insert"
  on pack_votes for insert with check (auth.uid() = profile_id);

create policy "pack_votes: self delete"
  on pack_votes for delete using (auth.uid() = profile_id);

-- ── RPC: vote_pack ────────────────────────────────────────────────────────────
-- Atomically inserts a vote row and increments the pack's vote_count.
-- Idempotent: calling twice unvotes (toggles).

create or replace function vote_pack(p_pack_id uuid)
returns int language plpgsql security definer as $$
declare
  caller uuid := auth.uid();
  already_voted boolean;
  new_count int;
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1 from pack_votes where pack_id = p_pack_id and profile_id = caller
  ) into already_voted;

  if already_voted then
    -- Unvote
    delete from pack_votes where pack_id = p_pack_id and profile_id = caller;
    update community_packs set vote_count = greatest(0, vote_count - 1) where id = p_pack_id returning vote_count into new_count;
  else
    -- Vote
    insert into pack_votes (pack_id, profile_id) values (p_pack_id, caller);
    update community_packs set vote_count = vote_count + 1 where id = p_pack_id returning vote_count into new_count;
  end if;

  return new_count;
end;
$$;

comment on function vote_pack is 'Toggle-vote on a community pack. Returns the new vote count.';
