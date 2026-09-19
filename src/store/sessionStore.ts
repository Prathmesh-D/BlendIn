/**
 * BlendIn — Session Store
 *
 * Tracks session-level data that persists across multiple rounds within
 * a single play session. Cleared when the session ends.
 *
 * Primary purpose: fair-rotation imposter tracking.
 * The imposter selection algorithm reads `imposterHistory` to weight
 * selection toward players who have been imposter least this session.
 */

import { create } from 'zustand';

export interface SessionState {
  /** Map of playerId → number of times they've been imposter this session. */
  imposterHistory: Record<string, number>;
  /** Total rounds played this session. */
  roundsPlayed: number;
  /** Session start timestamp. */
  startedAt: number | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  recordImposters: (imposterIds: string[]) => void;
  incrementRounds: () => void;
  startSession: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  imposterHistory: {},
  roundsPlayed: 0,
  startedAt: null,

  recordImposters: (imposterIds) =>
    set((state) => {
      const history = { ...state.imposterHistory };
      imposterIds.forEach((id) => {
        history[id] = (history[id] ?? 0) + 1;
      });
      return { imposterHistory: history };
    }),

  incrementRounds: () =>
    set((state) => ({ roundsPlayed: state.roundsPlayed + 1 })),

  startSession: () => set({ startedAt: Date.now(), roundsPlayed: 0 }),

  clearSession: () =>
    set({ imposterHistory: {}, roundsPlayed: 0, startedAt: null }),
}));
