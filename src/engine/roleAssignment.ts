/**
 * BlendIn — Role Assignment Engine (P1.3)
 *
 * The core algorithmic heart of the game. Takes game settings + player list
 * + session history and produces per-player role assignments.
 *
 * This pure TypeScript module is unit-testable in isolation.
 * It is also ported server-side in Phase 2 (P2.24 start_round Edge Function).
 * Keep the two implementations in sync — use identical test suites.
 *
 * Supported variants:
 *   classic_easy    → imposter gets decoy_easy
 *   classic_medium  → imposter gets decoy_medium
 *   classic_hard    → imposter gets decoy_hard
 *   hint            → imposter gets hint_text
 *   category_only   → imposter gets pack category name only
 *   blank           → imposter gets empty string (sees nothing)
 *   mirror          → ALL players get different words from same mirror_group_id
 */

import { WordEntry, getWordsFromPacks } from '../data/builtinPacks';
import type { Player, PlayerRole, RoundSettings, ImposterVariant } from '../store/gameStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssignRolesInput {
  players: Player[];
  settings: RoundSettings;
  /** Map of playerId → times imposter this session (from sessionStore). */
  imposterHistory: Record<string, number>;
}

export interface AssignRolesOutput {
  roles: PlayerRole[];
  /** IDs of the selected imposter(s). */
  imposterIds: string[];
  /** The drawn word (for host display after the round, not during). */
  chosenWord: string;
  /** The category name the word was drawn from. */
  categoryName: string;
}

export class RoleAssignmentError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NO_WORDS_AVAILABLE'
      | 'MIRROR_GROUP_TOO_SMALL'
      | 'INSUFFICIENT_PLAYERS',
  ) {
    super(message);
    this.name = 'RoleAssignmentError';
  }
}

// ─── Imposter selection (fair rotation) ──────────────────────────────────────

/**
 * Selects `count` imposter(s) from the player list using weighted random
 * selection that favors players who have been imposter fewer times this session.
 *
 * Weighting: players with the minimum imposter count get 3× weight.
 * Players with max count get 1× weight. Everyone in between is linear.
 * This is never deterministic — even the least-picked player isn't guaranteed.
 */
function selectImposters(
  players: Player[],
  count: number,
  history: Record<string, number>,
): string[] {
  if (players.length < 3) {
    throw new RoleAssignmentError(
      'Minimum 3 players required',
      'INSUFFICIENT_PLAYERS',
    );
  }

  const counts = players.map((p) => history[p.id] ?? 0);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount || 1;

  // Assign weights: min-count players get 3×, max-count get 1×, linear in between
  const weights = players.map((p) => {
    const c = history[p.id] ?? 0;
    return 1 + 2 * (1 - (c - minCount) / range);
  });

  const selected: string[] = [];
  const remaining = [...players];
  const remainingWeights = [...weights];

  for (let i = 0; i < count; i++) {
    const totalWeight = remainingWeights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let pickedIndex = 0;
    for (let j = 0; j < remainingWeights.length; j++) {
      rand -= remainingWeights[j];
      if (rand <= 0) {
        pickedIndex = j;
        break;
      }
    }
    selected.push(remaining[pickedIndex].id);
    remaining.splice(pickedIndex, 1);
    remainingWeights.splice(pickedIndex, 1);
  }

  return selected;
}

// ─── Word selection helpers ───────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getImposterWord(
  entry: WordEntry,
  variant: ImposterVariant,
  categoryName: string,
  allWords: WordEntry[]
): string {
  const getRandomFallback = () => {
    const others = allWords.filter(w => w.id !== entry.id && w.primary_word.trim());
    if (others.length === 0) return entry.primary_word;
    return pickRandom(others).primary_word;
  };

  switch (variant) {
    case 'classic_easy':
      return entry.decoy_easy || entry.decoy_medium || entry.decoy_hard || getRandomFallback();
    case 'classic_medium':
      return entry.decoy_medium || entry.decoy_easy || entry.decoy_hard || getRandomFallback();
    case 'classic_hard':
      return entry.decoy_hard || entry.decoy_medium || entry.decoy_easy || getRandomFallback();
    case 'hint':
      return entry.hint_text || 'No hint available';
    case 'category_only':
      return categoryName;
    case 'blank':
      return '';
    case 'mirror':
      // Mirror is handled separately
      return '';
  }
}

// ─── Mirror round assignment ──────────────────────────────────────────────────

function assignMirrorRoles(
  players: Player[],
  words: WordEntry[],
): PlayerRole[] {
  // Group words by mirror_group_id
  const groups: Record<string, WordEntry[]> = {};
  for (const w of words) {
    if (!groups[w.mirror_group_id]) groups[w.mirror_group_id] = [];
    groups[w.mirror_group_id].push(w);
  }

  // Find groups with enough words for all players
  const eligibleGroups = Object.entries(groups).filter(
    ([, groupWords]) => groupWords.length >= players.length,
  );

  if (eligibleGroups.length === 0) {
    throw new RoleAssignmentError(
      `No mirror group has enough words for ${players.length} players. ` +
        `Minimum group size needed: ${players.length}. ` +
        `Largest group has: ${Math.max(...Object.values(groups).map((g) => g.length))} words.`,
      'MIRROR_GROUP_TOO_SMALL',
    );
  }

  // Pick a random eligible group
  const [, groupWords] = pickRandom(eligibleGroups);

  // Shuffle and assign one unique word to each player
  const shuffled = [...groupWords].sort(() => Math.random() - 0.5);

  // Pick a random starting player
  const startingIndex = Math.floor(Math.random() * players.length);

  return players.map((player, i) => ({
    playerId: player.id,
    isImposter: true, // everyone is imposter in mirror round
    word: shuffled[i].primary_word,
    isStartingPlayer: i === startingIndex,
  }));
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Assigns roles to all players for one round.
 *
 * Pure function — no side effects. Callers are responsible for:
 *   1. Writing the result to gameStore (setRoles)
 *   2. Recording imposter IDs in sessionStore (recordImposters)
 *   3. Updating the game phase
 */
export function assignRoles(input: AssignRolesInput): AssignRolesOutput {
  const { players, settings, imposterHistory } = input;
  const { variant, imposterCount, selectedPackIds } = settings;

  // Get all available words from selected packs
  const allWords = getWordsFromPacks(selectedPackIds);

  if (allWords.length === 0) {
    throw new RoleAssignmentError(
      'No words available from selected packs',
      'NO_WORDS_AVAILABLE',
    );
  }

  // ── Paranoia Mode (All-Imposter Round) ────────────────────────────────────
  let isParanoiaRound = false;
  if (settings.paranoiaMode && Math.random() < 0.10) {
    isParanoiaRound = true;
  }

  // ── Standard Round ────────────────────────────────────────────────────────

  // Draw a random word
  const chosenEntry = pickRandom(allWords);

  // Determine the pack name for category_only variant
  // (We use the pack ID prefix for simplicity in Phase 1; Phase 4 adds proper category names)
  const categoryName = chosenEntry.mirror_group_id.split('-')[0] ?? 'Unknown';

  // Select imposter(s)
  let imposterIds: string[] = [];
  if (isParanoiaRound) {
    imposterIds = players.map(p => p.id);
  } else {
    // Safety clamp: ensure imposters <= floor(players/3), but at least 1
    const maxImposters = Math.max(1, Math.floor(players.length / 3));
    const safeImposterCount = Math.min(imposterCount, maxImposters);
    imposterIds = selectImposters(players, safeImposterCount, imposterHistory);
  }
  const imposterSet = new Set(imposterIds);

  // Pick a random starting player (civilian preferred, but not enforced)
  const civilians = players.filter((p) => !imposterSet.has(p.id));
  const startingPlayer = pickRandom(civilians.length > 0 ? civilians : players);

  // Get the imposter's word for this variant
  const imposterWord = getImposterWord(chosenEntry, variant, categoryName, allWords);

  // Build per-player roles
  const roles: PlayerRole[] = players.map((player) => {
    const isImposter = imposterSet.has(player.id);
    return {
      playerId: player.id,
      isImposter,
      word: isImposter ? imposterWord : chosenEntry.primary_word,
      isStartingPlayer: player.id === startingPlayer.id,
    };
  });

  return {
    roles,
    imposterIds,
    chosenWord: chosenEntry.primary_word,
    categoryName,
  };
}

// ─── Scoring engine (P1.7) ────────────────────────────────────────────────────

/**
 * Computes per-player score deltas for a round outcome.
 * Returns a map of playerId → score delta.
 *
 * Standard:
 *   busted   → +1 to every non-imposter
 *   escaped  → +2 to every imposter
 *
 * Mirror:
 *   cracked_it  → +2 to every player
 *   total_bluff → +1 to every player
 */
export function computeScoreDeltas(
  players: Player[],
  imposterIds: string[],
  outcome: 'busted' | 'escaped',
): Record<string, number> {
  const imposterSet = new Set(imposterIds);
  const deltas: Record<string, number> = {};

  for (const player of players) {
    const isImposter = imposterSet.has(player.id);
    
    // Paranoia round (all imposters)
    if (imposterSet.size === players.length) {
      if (outcome === 'busted') {
        deltas[player.id] = 0; // The group turned on each other
      } else {
        deltas[player.id] = 1; // They realized it and everyone survives
      }
      continue;
    }

    switch (outcome) {
      case 'busted':
        deltas[player.id] = isImposter ? 0 : 1;
        break;
      case 'escaped':
        deltas[player.id] = isImposter ? 2 : 0;
        break;
    }
  }

  return deltas;
}
