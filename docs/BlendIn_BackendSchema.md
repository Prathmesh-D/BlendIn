# BlendIn — Backend Schema (Supabase / Postgres)

This document defines the relational schema, key relationships, Realtime channel usage, and Row Level Security (RLS) intent for the Supabase backend. Column types are indicative (Postgres types); exact constraints can be refined during implementation.

## 1. Entity Overview

- **users** — Supabase Auth-backed identity (anonymous or upgraded).
- **profiles** — public-facing profile data linked 1:1 to a user.
- **rooms** — a multi-device game room/session.
- **room_players** — a player's membership + role assignment within a room.
- **rounds** — an individual round played within a room (or logged locally for single-device sessions that opt to sync).
- **round_results** — outcome + scoring of a completed round.
- **categories** — built-in category metadata.
- **word_packs** — both built-in and user-created/community packs.
- **words** — individual word entries belonging to a pack, including decoy/hint relationships.
- **pack_plays** — record of a pack being used in a completed session (drives rating eligibility + play count).
- **pack_ratings** — user ratings on packs.
- **pack_favorites** — user-favorited packs.
- **pack_reports** — moderation reports against packs.
- **moderation_actions** — audit log of moderation decisions (auto or manual).

## 2. Table Definitions

### 2.1 `users`
Managed by Supabase Auth (`auth.users`). Not redefined here; referenced by `id` (uuid) throughout.

### 2.2 `profiles`
| Column | Type | Notes |
|---|---|---|
| user_id | uuid, PK, FK → auth.users.id | |
| display_name | text | |
| is_anonymous | boolean | true until upgraded to full account |
| created_at | timestamptz | |
| repeat_offender_flag | boolean, default false | set by moderation logic; requires manual review on future pack submissions |

### 2.3 `rooms`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| join_code | text, unique | short human-enterable code |
| host_user_id | uuid, FK → profiles.user_id | |
| status | text | `lobby`, `in_round`, `discussion`, `resolved`, `closed` |
| imposter_variant | text | `classic_pair`, `hint_imposter`, `category_only`, `blank_imposter`, `mirror_round` |
| imposter_count | smallint | 1 or 2; constrained by player count at application layer |
| category_pack_ids | uuid[] | selected packs for this room's session |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.4 `room_players`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| room_id | uuid, FK → rooms.id | |
| user_id | uuid, FK → profiles.user_id, nullable | nullable to allow ad hoc/local-only nicknames in single-device mode if not synced |
| display_name | text | |
| is_imposter | boolean | set at round start |
| assigned_word | text, nullable | null for blank imposter or civilians in category-only variant |
| assigned_hint | text, nullable | used for hint_imposter variant |
| assigned_category_only | boolean, default false | true if this player only received the category name |
| joined_at | timestamptz | |
| current_round_id | uuid, FK → rounds.id, nullable | |

Row Level Security intent: a player's row (`assigned_word`, `assigned_hint`, `is_imposter`) is only selectable by that row's own `user_id` (or an equivalent device-bound anonymous identity) and never by other players in the same room.

### 2.5 `rounds`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| room_id | uuid, FK → rooms.id, nullable | nullable for locally-played, unsynced single-device rounds |
| starting_player_id | uuid, FK → room_players.id | |
| imposter_variant | text | duplicated from room at time of round in case room settings change between rounds |
| word_pack_id | uuid, FK → word_packs.id | |
| created_at | timestamptz | |

### 2.6 `round_results`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| round_id | uuid, FK → rounds.id | |
| outcome | text | `busted` or `escaped` |
| imposter_player_ids | uuid[] | references room_players.id for all imposters that round |
| scored_at | timestamptz | |

### 2.7 `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | e.g. "Actors", "Food", "Anime" |
| is_builtin | boolean | true for launch categories |
| created_at | timestamptz | |

### 2.8 `word_packs`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| category_id | uuid, FK → categories.id, nullable | nullable if a custom pack defines its own ad hoc category name instead |
| custom_category_name | text, nullable | used when category_id is null |
| creator_user_id | uuid, FK → profiles.user_id, nullable | null for built-in packs |
| title | text | |
| description | text, nullable | |
| tone_tag | text | `family_friendly` or `party_mature` |
| status | text | `builtin`, `private`, `pending_review`, `published`, `hidden`, `removed` |
| play_count | integer, default 0 | denormalized counter, updated on pack_plays insert |
| rating_avg | numeric, default 0 | denormalized, recalculated on pack_ratings changes |
| rating_count | integer, default 0 | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.9 `words`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| primary_word | text | the "civilian" word |
| decoy_word | text, nullable | used for classic_pair variant |
| hint_text | text, nullable | used for hint_imposter variant |
| mirror_group_id | uuid, nullable | groups related words together for use in the All-Imposter (Mirror) Round, so multiple distinct-but-related words can be drawn from the same set |

### 2.10 `pack_plays`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| user_id | uuid, FK → profiles.user_id | |
| room_id | uuid, FK → rooms.id, nullable | |
| played_at | timestamptz | |

Used to (a) increment `word_packs.play_count`, and (b) gate rating eligibility — a user may only rate a pack they have a `pack_plays` row for.

### 2.11 `pack_ratings`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| user_id | uuid, FK → profiles.user_id | |
| score | smallint | e.g. 1–5, or a thumbs-up/down boolean-equivalent depending on final UX decision |
| created_at | timestamptz | |
| unique (word_pack_id, user_id) | | one rating per user per pack |

### 2.12 `pack_favorites`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| user_id | uuid, FK → profiles.user_id | |
| created_at | timestamptz | |
| unique (word_pack_id, user_id) | | |

### 2.13 `pack_reports`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| reporter_user_id | uuid, FK → profiles.user_id | |
| reason | text | `inappropriate`, `spam_low_effort`, `offensive`, `duplicate`, `other` |
| notes | text, nullable | |
| created_at | timestamptz | |
| reporter_graph_weight | numeric, default 1.0 | computed weight based on reporter's distinctness from other reporters of the same pack (used by moderation Edge Function to avoid brigading) |

### 2.14 `moderation_actions`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| word_pack_id | uuid, FK → word_packs.id | |
| action | text | `auto_hidden`, `approved`, `removed`, `restored`, `creator_restricted` |
| triggered_by | text | `system` or an admin user_id |
| reason | text, nullable | |
| created_at | timestamptz | |

## 3. Key Relationships Summary

- `rooms` 1—N `room_players`
- `rooms` 1—N `rounds`
- `rounds` 1—1 `round_results`
- `word_packs` 1—N `words`
- `word_packs` 1—N `pack_plays`, `pack_ratings`, `pack_favorites`, `pack_reports`, `moderation_actions`
- `profiles` 1—N `word_packs` (as creator), `pack_plays`, `pack_ratings`, `pack_favorites`, `pack_reports`

## 4. Row Level Security (RLS) Summary

- `room_players`: a row's sensitive columns (`assigned_word`, `assigned_hint`, `is_imposter`, `assigned_category_only`) are only readable by a request authenticated as that row's own `user_id`. No policy should allow one player to query another player's role columns directly, even within the same room.
- `rooms`, non-sensitive `room_players` fields (e.g. `display_name`, `joined_at`): readable by any authenticated participant of that room, to support the live lobby/player list.
- `word_packs` with `status = 'published'`: publicly readable by all users. `status = 'private'`: readable only by `creator_user_id`. `status = 'pending_review'` / `hidden`: readable by the creator and admin roles only.
- `pack_ratings` insert: permitted only if a matching `pack_plays` row exists for the requesting user and pack (enforced via policy or a gating Edge Function).
- `moderation_actions` and the admin review queue: readable/writable only by accounts with an admin role claim.
- `profiles.repeat_offender_flag`: writable only by system/Edge Function logic, not directly by any client.

## 5. Realtime Channels

- One Realtime channel per `room_id`, subscribed to by all joined devices, broadcasting non-sensitive events: `player_joined`, `round_started`, `moved_to_discussion`, `round_resolved`, `scoreboard_updated`.
- Sensitive role/word data is never broadcast on the shared room channel — each device fetches its own `room_players` row directly via its authenticated, RLS-scoped query after a `round_started` event is received.

## 6. Edge Functions (Server-Authoritative Logic)

- `create_room` — generates room + join code.
- `join_room` — validates join code/QR payload, creates `room_players` row.
- `start_round` — performs fair-rotation imposter selection, draws word(s) per the selected imposter variant, writes per-player assignment rows, creates a `rounds` row.
- `resolve_round` — accepts outcome (`busted`/`escaped`), writes `round_results`, updates scores.
- `submit_pack` — runs the profanity/basic content pre-filter, sets initial `word_packs.status`.
- `report_pack` — writes a `pack_reports` row, computes `reporter_graph_weight`, evaluates auto-hide threshold, writes `moderation_actions` row if triggered.
- `rate_pack` — validates play eligibility via `pack_plays`, writes/updates `pack_ratings`, recalculates `word_packs.rating_avg`/`rating_count`.
