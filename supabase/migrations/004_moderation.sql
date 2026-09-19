-- ============================================================================
-- BlendIn — Migration: Moderation System (Phase 5)
-- File: supabase/migrations/004_moderation.sql
--
-- Moderation logic for community packs:
-- - Reporter diversity weighting (anti-brigading)
-- - Auto-hide threshold evaluation
-- - Profanity pre-filter on submission
-- - Admin audit logs
-- ============================================================================

-- ── 1. Modify Profiles ────────────────────────────────────────────────────────
alter table profiles 
add column if not exists repeat_offender_flag boolean not null default false;

-- ── 2. Moderation Tables ──────────────────────────────────────────────────────

create table if not exists pack_reports (
  id uuid primary key default gen_random_uuid(),
  word_pack_id uuid not null references community_packs(id) on delete cascade,
  reporter_user_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (reason in ('inappropriate', 'spam_low_effort', 'offensive', 'duplicate', 'other')),
  notes text,
  reporter_graph_weight numeric not null default 1.0,
  created_at timestamptz not null default now(),
  unique (word_pack_id, reporter_user_id)
);

alter table pack_reports enable row level security;
-- Only admins can view reports (RLS policy added below after admin function)
-- Users can insert their own reports (handled via RPC security definer)

create table if not exists moderation_actions (
  id uuid primary key default gen_random_uuid(),
  word_pack_id uuid not null references community_packs(id) on delete cascade,
  action text not null check (action in ('auto_hidden', 'approved', 'removed', 'restored', 'creator_restricted')),
  triggered_by text not null, -- 'system' or admin uuid
  reason text,
  created_at timestamptz not null default now()
);

alter table moderation_actions enable row level security;

-- ── 3. Helper Functions ───────────────────────────────────────────────────────

alter table profiles add column if not exists is_admin boolean not null default false;

create or replace function is_admin(user_id uuid)
returns boolean language sql security definer as $$
  -- For now, we will define admins as specific users. 
  -- In a real production app, this could check a 'roles' table or JWT claim.
  -- For demo purposes, we will return true if the user's email ends with '@blendin.admin' (handled at app level)
  -- Or just add an admin flag to profiles. Let's add an is_admin flag to profiles for simplicity.
  select coalesce((select true from profiles p where p.id = user_id and p.is_admin = true), false);
$$;

drop policy if exists "pack_reports: admin read" on pack_reports;
create policy "pack_reports: admin read" on pack_reports for select using (is_admin(auth.uid()));

drop policy if exists "moderation_actions: admin read" on moderation_actions;
create policy "moderation_actions: admin read" on moderation_actions for select using (is_admin(auth.uid()));

drop policy if exists "community_packs: admin all" on community_packs;
create policy "community_packs: admin all" on community_packs for all using (is_admin(auth.uid()));


-- ── 4. RPC: submit_pack ───────────────────────────────────────────────────────
-- Submits a pack with a basic profanity filter check.

create or replace function submit_pack(
  p_name text,
  p_description text,
  p_words jsonb,
  p_is_restricted boolean default false
) returns uuid language plpgsql security definer as $$
declare
  caller uuid := auth.uid();
  v_is_flagged boolean := false;
  v_is_approved boolean := false;
  v_pack_id uuid;
  v_profanity_regex text := '(?i)\b(fuck|shit|bitch|asshole|cunt|dick|cock|pussy|whore|slut|nigger|faggot)\b';
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  -- Basic profanity check
  if p_name ~ v_profanity_regex or p_description ~ v_profanity_regex or p_words::text ~ v_profanity_regex then
    v_is_flagged := true;
  end if;

  -- Insert the pack
  insert into community_packs (creator_id, name, description, words, is_flagged, is_approved, is_restricted)
  values (caller, p_name, p_description, p_words, v_is_flagged, v_is_approved, p_is_restricted)
  returning id into v_pack_id;

  -- If it was auto-flagged for profanity, log it
  if v_is_flagged then
    insert into moderation_actions (word_pack_id, action, triggered_by, reason)
    values (v_pack_id, 'auto_hidden', 'system', 'Profanity pre-filter triggered');
  end if;

  return v_pack_id;
end;
$$;


-- ── 5. RPC: report_pack ───────────────────────────────────────────────────────
-- Reports a pack, calculates weight, and auto-hides if threshold is met.

create or replace function report_pack(
  p_pack_id uuid,
  p_reason text,
  p_notes text
) returns void language plpgsql security definer as $$
declare
  caller uuid := auth.uid();
  v_shares_room boolean;
  v_weight numeric := 1.0;
  v_total_weight numeric;
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Check if user already reported this pack
  if exists (select 1 from pack_reports where word_pack_id = p_pack_id and reporter_user_id = caller) then
    raise exception 'You have already reported this pack.';
  end if;

  -- 2. Calculate diversity weight
  -- Does this reporter share any past rooms with other users who reported this pack?
  select exists (
    select 1 
    from room_participants rp1
    join room_participants rp2 on rp1.room_id = rp2.room_id
    where rp1.profile_id = caller 
      and rp2.profile_id in (select reporter_user_id from pack_reports where word_pack_id = p_pack_id)
      and rp1.profile_id != rp2.profile_id
  ) into v_shares_room;

  if v_shares_room then
    v_weight := 0.5; -- Reduced weight if brigading from a friend group is suspected
  end if;

  -- 3. Insert report
  insert into pack_reports (word_pack_id, reporter_user_id, reason, notes, reporter_graph_weight)
  values (p_pack_id, caller, p_reason, p_notes, v_weight);

  -- 4. Evaluate threshold
  select coalesce(sum(reporter_graph_weight), 0) into v_total_weight
  from pack_reports
  where word_pack_id = p_pack_id;

  -- If threshold >= 3.0, auto-hide the pack
  if v_total_weight >= 3.0 then
    -- Check if it's already flagged to avoid duplicate moderation_actions
    if not exists (select 1 from community_packs where id = p_pack_id and is_flagged = true) then
      update community_packs set is_flagged = true, is_approved = false where id = p_pack_id;
      
      insert into moderation_actions (word_pack_id, action, triggered_by, reason)
      values (p_pack_id, 'auto_hidden', 'system', 'Report threshold reached (' || v_total_weight || ' weight)');
    end if;
  end if;

end;
$$;
