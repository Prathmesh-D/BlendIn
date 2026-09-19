import { supabase } from './supabase';

export interface MatchHistoryEntry {
  roomId: string;
  createdAt: string;
  outcome: 'busted' | 'escaped';
  scoreDelta: number;
  word: string;
}

export async function fetchUserMatchHistory(profileId: string): Promise<MatchHistoryEntry[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      id,
      created_at,
      settings,
      room_participants!inner(profile_id)
    `)
    .eq('status', 'finished')
    .eq('room_participants.profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch match history: ${error.message}`);
  }

  const history: MatchHistoryEntry[] = data.map((row: any) => {
    const settings = row.settings || {};
    const deltas = settings.deltas || {};
    const myDelta = deltas[profileId] || 0;
    
    return {
      roomId: row.id,
      createdAt: row.created_at,
      outcome: settings.outcome || 'escaped',
      scoreDelta: myDelta,
      word: settings.currentWord || 'UNKNOWN',
    };
  });

  return history;
}
