/**
 * BlendIn — Pack Service (Phase 4)
 *
 * Supabase operations for community packs:
 *   - Fetch paginated community packs
 *   - Submit a user-created pack to the community
 *   - Toggle vote on a pack
 *   - Report a pack for moderation
 */

import { supabase } from './supabase';
import type { CommunityPack } from '../store/packStore';
import type { WordEntry } from '../data/builtinPacks';

// ─── Supabase row shape ───────────────────────────────────────────────────────
interface CommunityPackRow {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  words: WordEntry[];
  word_count: number;
  vote_count: number;
  is_approved: boolean;
  is_flagged: boolean;
  is_restricted: boolean;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

// ─── Row → CommunityPack ──────────────────────────────────────────────────────
function rowToCommunityPack(row: CommunityPackRow, hasVoted = false): CommunityPack {
  return {
    // WordPack fields
    id: `community-${row.id}`,
    name: row.name,
    description: row.description,
    words: row.words ?? [],
    is_restricted: row.is_restricted,
    // CommunityPack fields
    communityId: row.id,
    creatorId: row.creator_id,
    creatorName: row.profiles?.display_name ?? 'Unknown',
    voteCount: row.vote_count,
    isApproved: row.is_approved,
    hasVoted,
  };
}

// ─── Fetch community packs (paginated) ────────────────────────────────────────
export async function fetchCommunityPacks(opts?: {
  page?: number;
  pageSize?: number;
  search?: string;
  myVotedIds?: string[];
}): Promise<CommunityPack[]> {
  const page = opts?.page ?? 0;
  const pageSize = opts?.pageSize ?? 20;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('community_packs')
    .select('*, profiles!community_packs_creator_id_fkey(display_name)')
    .eq('is_flagged', false)
    .order('vote_count', { ascending: false })
    .range(from, to);

  if (opts?.search) {
    query = query.ilike('name', `%${opts.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch community packs: ${error.message}`);

  const votedSet = new Set(opts?.myVotedIds ?? []);
  return (data as CommunityPackRow[]).map((row) =>
    rowToCommunityPack(row, votedSet.has(row.id)),
  );
}

// ─── Fetch creator's own packs (drafts + approved) ────────────────────────────
export async function fetchMyPacks(): Promise<CommunityPack[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('community_packs')
    .select('*, profiles!community_packs_creator_id_fkey(display_name)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch your packs: ${error.message}`);
  return (data as CommunityPackRow[]).map((row) => rowToCommunityPack(row));
}

// ─── Submit a pack to the community ──────────────────────────────────────────
export async function submitCommunityPack(pack: {
  name: string;
  description: string;
  words: WordEntry[];
  is_restricted?: boolean;
}): Promise<CommunityPack> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: packId, error: rpcError } = await supabase.rpc('submit_pack', {
    p_name: pack.name,
    p_description: pack.description,
    p_words: pack.words,
    p_is_restricted: pack.is_restricted ?? false,
  });

  if (rpcError) throw new Error(`Failed to submit pack: ${rpcError.message}`);

  // Fetch the full inserted row since RPC only returns the ID
  const { data, error } = await supabase
    .from('community_packs')
    .select('*, profiles!community_packs_creator_id_fkey(display_name)')
    .eq('id', packId)
    .single();

  if (error) throw new Error(`Failed to fetch submitted pack: ${error.message}`);
  return rowToCommunityPack(data as CommunityPackRow);
}

// ─── Update own pack ──────────────────────────────────────────────────────────
export async function updateCommunityPack(
  communityId: string,
  patch: Partial<{ name: string; description: string; words: WordEntry[]; is_restricted: boolean }>,
): Promise<void> {
  const { error } = await supabase
    .from('community_packs')
    .update(patch)
    .eq('id', communityId);

  if (error) throw new Error(`Failed to update pack: ${error.message}`);
}

// ─── Fetch pack by ID ─────────────────────────────────────────────────────────
export async function fetchPackById(communityId: string): Promise<CommunityPack | null> {
  const { data, error } = await supabase
    .from('community_packs')
    .select('*, profiles!community_packs_creator_id_fkey(display_name)')
    .eq('id', communityId)
    .maybeSingle();

  if (error || !data) return null;
  const votedIds = await getMyVotedPackIds();
  return rowToCommunityPack(data as CommunityPackRow, votedIds.includes(data.id));
}

// ─── Delete own pack ──────────────────────────────────────────────────────────
export async function deleteCommunityPack(communityId: string): Promise<void> {
  const { error } = await supabase
    .from('community_packs')
    .delete()
    .eq('id', communityId);

  if (error) throw new Error(`Failed to delete pack: ${error.message}`);
}

// ─── Toggle vote ──────────────────────────────────────────────────────────────
export async function toggleVotePack(communityId: string): Promise<number> {
  const { data, error } = await supabase.rpc('vote_pack', { p_pack_id: communityId });
  if (error) throw new Error(`Failed to vote: ${error.message}`);
  return data as number;
}

// ─── Get user's voted pack IDs ────────────────────────────────────────────────
export async function getMyVotedPackIds(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('pack_votes')
    .select('pack_id')
    .eq('profile_id', user.id);

  if (error) return [];
  return (data ?? []).map((row: { pack_id: string }) => row.pack_id);
}

// ─── Report a pack ────────────────────────────────────────────────────────────
export async function reportPack(communityId: string, reason: string, notes?: string): Promise<void> {
  const { error } = await supabase.rpc('report_pack', {
    p_pack_id: communityId,
    p_reason: reason,
    p_notes: notes || null,
  });

  if (error) throw new Error(`Failed to report pack: ${error.message}`);
}
