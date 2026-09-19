/**
 * BlendIn — Game Store
 *
 * Central game-state machine. Controls the entire pass-and-play loop:
 *   idle → setup → assigning → revealing → hinting → discussing → resolved → summary
 *
 * This store is the single source of truth for all game state. All screens
 * read from here; only game-logic actions write to it.
 */

import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase =
  | 'idle'        // No active game. Home screen.
  | 'setup'       // GameSetupScreen. Configuring settings.
  | 'assigning'   // Brief loading state while role assignment runs.
  | 'revealing'   // RoleRevealScreen. Players viewing their roles one by one.
  | 'hinting'     // HintRoundScreen. Verbal hints in progress.
  | 'discussing'  // DiscussionScreen. Voting/discussion phase.
  | 'resolved'    // DiscussionScreen post-reveal. Outcome being selected.
  | 'summary';    // RoundSummaryScreen. Scoreboard shown.

export type ImposterVariant =
  | 'classic_easy'
  | 'classic_medium'
  | 'classic_hard'
  | 'hint'
  | 'category_only'
  | 'blank';

export type RoundOutcome =
  | 'busted'      // Standard: imposter identified
  | 'escaped';    // Standard: imposter got away

export interface Player {
  id: string;           // Locally generated UUID
  name: string;         // Display name / nickname
  score: number;        // Running session score
  imposterCount: number; // Times been imposter this session (for fair rotation)
}

export interface PlayerRole {
  playerId: string;
  isImposter: boolean;
  /** The word shown to this player. Civilians get primary_word, imposters
   *  get the variant-appropriate decoy / hint / nothing. */
  word: string;
  /** True if this player should give the first hint. */
  isStartingPlayer: boolean;
}

export interface RoundSettings {
  variant: ImposterVariant;
  imposterCount: 1 | 2;
  selectedPackIds: string[];
  paranoiaMode: boolean;
  /** Populated after word draw. */
  currentWord?: string;
  /** Populated after word draw. */
  currentCategory?: string;
}

export interface GameState {
  // ── Phase & Context ────────────────────────────────────────────────────────
  phase: GamePhase;
  playMode: 'local' | 'online';
  roomId: string | null;
  joinCode: string | null;
  isHost: boolean;

  // ── Players ────────────────────────────────────────────────────────────────
  players: Player[];

  // ── Round settings ─────────────────────────────────────────────────────────
  roundSettings: RoundSettings;

  // ── Role assignments (only set during revealing/hinting/discussing/resolved)
  roles: PlayerRole[];

  // ── Reveal state (which player has viewed their role) ──────────────────────
  /** Index into `players` array. -1 = not started. */
  revealIndex: number;

  // ── Round tracking ─────────────────────────────────────────────────────────
  roundNumber: number;
  lastOutcome: RoundOutcome | null;
  lastScoreDeltas: Record<string, number>; // playerId → delta

  // ─── Actions ───────────────────────────────────────────────────────────────
  setPhase: (phase: GamePhase) => void;
  setGameContext: (context: { playMode: 'local' | 'online'; roomId?: string | null; joinCode?: string | null; isHost?: boolean }) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  setRoundSettings: (settings: Partial<RoundSettings>) => void;
  setRoles: (roles: PlayerRole[]) => void;
  advanceReveal: () => void;
  recordOutcome: (outcome: RoundOutcome, deltas: Record<string, number>) => void;
  resetRound: () => void;
  resetSession: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  phase: 'idle',
  playMode: 'local',
  roomId: null,
  joinCode: null,
  isHost: true,
  players: [],
  roundSettings: {
    variant: 'classic_medium',
    imposterCount: 1,
    selectedPackIds: [],
    paranoiaMode: false,
  },
  roles: [],
  revealIndex: -1,
  roundNumber: 0,
  lastOutcome: null,
  lastScoreDeltas: {},

  // ── Actions ────────────────────────────────────────────────────────────────
  setPhase: (phase) => set({ phase }),

  setGameContext: (context) => set({ ...context }),

  setPlayers: (players) => set({ players }),

  updatePlayer: (id, patch) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),

  setRoundSettings: (settings) =>
    set((state) => ({
      roundSettings: { ...state.roundSettings, ...settings },
    })),

  setRoles: (roles) => set({ roles, revealIndex: 0 }),

  advanceReveal: () =>
    set((state) => ({
      revealIndex: state.revealIndex + 1,
    })),

  recordOutcome: (outcome, deltas) => {
    set((state) => {
      // Apply score deltas to players
      const updatedPlayers = state.players.map((p) => ({
        ...p,
        score: p.score + (deltas[p.id] ?? 0),
      }));
      return {
        lastOutcome: outcome,
        lastScoreDeltas: deltas,
        players: updatedPlayers,
        phase: 'summary' as GamePhase,
      };
    });
  },

  resetRound: () =>
    set((state) => ({
      phase: 'setup',
      roles: [],
      revealIndex: -1,
      roundNumber: state.roundNumber + 1,
      lastOutcome: null,
      lastScoreDeltas: {},
      roundSettings: {
        ...state.roundSettings,
        currentWord: undefined,
        currentCategory: undefined,
      },
    })),

  resetSession: () =>
    set({
      phase: 'idle',
      players: [],
      roles: [],
      revealIndex: -1,
      roundNumber: 0,
      lastOutcome: null,
      lastScoreDeltas: {},
      roundSettings: {
        variant: 'classic_medium',
        imposterCount: 1,
        selectedPackIds: [],
      },
    }),
}));
