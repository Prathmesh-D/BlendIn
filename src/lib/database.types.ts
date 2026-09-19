/**
 * BlendIn — Supabase Database Types (Phase 2)
 *
 * Manually authored type-safe schema definition.
 * After Phase 2 is deployed, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type ImposterVariant =
  | 'classic_easy'
  | 'classic_medium'
  | 'classic_hard'
  | 'hint'
  | 'category_only'
  | 'blank'
  | 'mirror';

export interface RoomSettings {
  variant: ImposterVariant;
  imposterCount: 1 | 2;
  selectedPackIds: string[];
}

// ─── Table row types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string; // uuid, references auth.users
  display_name: string;
  avatar_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string; // uuid
  code: string; // 6-char alphanumeric join code
  host_id: string; // uuid, references profiles.id
  status: RoomStatus;
  settings: RoomSettings;
  created_at: string;
  updated_at: string;
}

export interface RoomParticipant {
  room_id: string;
  profile_id: string;
  display_name: string; // Snapshot of name at join time
  score: number;
  is_ready: boolean;
  joined_at: string;
}

export interface GameRound {
  id: string; // uuid
  room_id: string;
  round_number: number;
  /** Opaque server-authoritative round state — never fully exposed to clients */
  state: Json;
  created_at: string;
}

// ─── Insert types (subset of full rows) ───────────────────────────────────────

export type ProfileInsert = Pick<Profile, 'id' | 'display_name'> & {
  avatar_id?: string | null;
};

export type RoomInsert = Pick<Room, 'host_id' | 'settings'> & {
  code?: string; // Generated server-side if omitted
};

export type RoomParticipantInsert = Pick<
  RoomParticipant,
  'room_id' | 'profile_id' | 'display_name'
>;
