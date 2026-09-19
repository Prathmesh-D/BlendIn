/**
 * BlendIn — Auth Store
 *
 * Manages authentication state: anonymous device identity + optional
 * authenticated user after account upgrade.
 *
 * Phase 0/1: Only anonymous identity is used (local-only play).
 * Phase 3+: Supabase anonymous session created silently on launch.
 * Phase 4+: Account upgrade (email/OAuth) links to persistent profile.
 */

import { create } from 'zustand';

export interface AuthUser {
  id: string;           // Supabase auth.users.id (or local device ID for offline)
  isAnonymous: boolean;
  email?: string;
  displayName?: string;
  /** Whether this session has ever been used in a multi-device room. */
  hasUsedMultiDevice: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  upgradeToAuthenticated: (email: string, displayName?: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // True on launch until session is resolved

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  upgradeToAuthenticated: (email, displayName) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, isAnonymous: false, email, displayName }
        : null,
    })),

  signOut: () => set({ user: null }),
}));
