/**
 * BlendIn — Room Service (Phase 3 Foundation)
 *
 * All Supabase operations for creating, joining, and managing rooms.
 * These functions call the RPCs defined in the SQL migration.
 *
 * Phase 2: createRoom + joinRoom scaffolded but not yet called from UI.
 * Phase 3: Realtime subscriptions added; called from RoomLobbyScreen.
 */

import { supabase } from './supabase';
import type { Room, RoomParticipant, RoomSettings } from './database.types';

// ─── Create room ──────────────────────────────────────────────────────────────

/**
 * Create a new game room. Calls the `create_room` Postgres RPC which
 * atomically creates the room and adds the host as the first participant.
 *
 * Returns the full room row including the generated join code.
 */
export async function createRoom(settings: RoomSettings): Promise<Room> {
  const { data, error } = await supabase.rpc('create_room', {
    settings: settings as unknown as Record<string, unknown>,
  });

  if (error) throw new Error(`Failed to create room: ${error.message}`);
  return data as Room;
}

// ─── Join room ────────────────────────────────────────────────────────────────

/**
 * Join an existing room by its 6-character code.
 * The `join_room` RPC validates the code, checks the room is in 'waiting'
 * status, and inserts the caller as a participant.
 */
export async function joinRoom(code: string): Promise<Room> {
  const { data, error } = await supabase.rpc('join_room', {
    room_code: code.trim().toUpperCase(),
  });

  if (error) throw new Error(`Failed to join room: ${error.message}`);
  return data as Room;
}

// ─── Get room participants ─────────────────────────────────────────────────────

export async function getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
  const { data, error } = await supabase
    .from('room_participants')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch participants: ${error.message}`);
  return data as RoomParticipant[];
}

// ─── Update room status ───────────────────────────────────────────────────────

export async function updateRoomStatus(
  roomId: string,
  status: Room['status'],
  settingsPatch?: any
): Promise<void> {
  const updateData: any = { status };
  
  if (settingsPatch) {
    const { data } = await supabase.from('rooms').select('settings').eq('id', roomId).single();
    if (data) {
      updateData.settings = { ...(data.settings as any), ...settingsPatch };
    }
  }

  const { error } = await supabase
    .from('rooms')
    .update(updateData)
    .eq('id', roomId);

  if (error) throw new Error(`Failed to update room status: ${error.message}`);
}

// ─── Toggle ready state ───────────────────────────────────────────────────────

export async function setParticipantReady(
  roomId: string,
  profileId: string,
  isReady: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('room_participants')
    .update({ is_ready: isReady })
    .eq('room_id', roomId)
    .eq('profile_id', profileId);

  if (error) throw new Error(`Failed to update ready state: ${error.message}`);
}

// ─── Leave room ───────────────────────────────────────────────────────────────

export async function leaveRoom(roomId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('room_participants')
    .delete()
    .eq('room_id', roomId)
    .eq('profile_id', profileId);

  if (error) throw new Error(`Failed to leave room: ${error.message}`);
}

// ─── Update participant scores ──────────────────────────────────────────────────

export async function updateMyScore(
  roomId: string,
  profileId: string,
  newScore: number,
): Promise<void> {
  const { error } = await supabase
    .from('room_participants')
    .update({ score: newScore })
    .eq('room_id', roomId)
    .eq('profile_id', profileId);

  if (error) throw new Error(`Failed to update score: ${error.message}`);
}

// ─── Realtime: subscribe to participant changes ────────────────────────────────

/**
 * Subscribe to live participant list updates for a room.
 * Used in the lobby screen to show who has joined and their ready status.
 *
 * Returns an unsubscribe function.
 * Phase 3: Hook this up in RoomLobbyScreen.
 */
export function subscribeToParticipants(
  roomId: string,
  onUpdate: (participants: RoomParticipant[]) => void,
): () => void {
  const channel = supabase
    .channel(`room_participants:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        // Re-fetch the full list on any change (insert/update/delete)
        try {
          const participants = await getRoomParticipants(roomId);
          onUpdate(participants);
        } catch (err) {
          console.error('[BlendIn] Failed to refresh participants:', err);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Realtime: subscribe to room status ──────────────────────────────────────

/**
 * Subscribe to room status changes.
 * Used to detect when the host transitions the room from 'waiting' → 'playing'.
 *
 * Phase 3: Hook this up in RoomLobbyScreen to redirect all clients to game flow.
 */
export function subscribeToRoomStatus(
  roomId: string,
  onRoomChange: (room: Room) => void,
): () => void {
  const channel = supabase
    .channel(`rooms:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        const newRow = payload.new as Room;
        onRoomChange(newRow);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
