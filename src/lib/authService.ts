/**
 * BlendIn — Auth Service (Phase 2)
 *
 * Handles all Supabase authentication operations:
 *   - Silent anonymous sign-in on launch
 *   - Profile upsert (creating/updating display name)
 *   - Session restoration from AsyncStorage
 *   - Future: account upgrade to email/OAuth
 *
 * This service is called from App.tsx on mount. The result is written
 * into the authStore, which components subscribe to.
 */

import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import type { Profile } from './database.types';

// ─── Anonymous sign-in ────────────────────────────────────────────────────────

/**
 * Silently sign the user in anonymously. If a session already exists in
 * AsyncStorage, Supabase will restore it and this is a no-op.
 *
 * On first launch, a new anonymous user is created with a stable UUID.
 * This UUID is used as the user's identity across all Supabase operations.
 */
export async function initializeAuth(): Promise<void> {
  const { setUser, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);

    // 1. Check for an existing session (restored from AsyncStorage by Supabase SDK).
    const { data: sessionData } = await supabase.auth.getSession();

    let session = sessionData?.session;

    // 2. If no session exists, sign in anonymously.
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }

    if (!session?.user) {
      throw new Error('Failed to establish a session.');
    }

    const authUser = session.user;

    // 3. Upsert a profile record for this user.
    await upsertProfile({
      id: authUser.id,
      display_name: authUser.user_metadata?.display_name ?? `Guest_${authUser.id.slice(0, 6)}`,
      avatar_id: authUser.user_metadata?.avatar_id ?? null,
    });

    // 4. Write to auth store.
    setUser({
      id: authUser.id,
      isAnonymous: authUser.is_anonymous ?? true,
      email: authUser.email,
      displayName: authUser.user_metadata?.display_name,
      hasUsedMultiDevice: false,
    });
  } catch (err) {
    console.error('[BlendIn] Auth initialization failed:', err);
    // Don't block the app — single-device play works without auth.
    setUser(null);
  } finally {
    setLoading(false);
  }
}

// ─── Profile upsert ───────────────────────────────────────────────────────────

/**
 * Creates or updates the user's profile row.
 * Uses `upsert` so it's safe to call on every launch.
 */
export async function upsertProfile(profile: Pick<Profile, 'id' | 'display_name'> & { avatar_id?: string | null }): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profile.id,
        display_name: profile.display_name,
        avatar_id: profile.avatar_id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

  if (error) {
    // Non-fatal: profile is cosmetic metadata. Log and continue.
    console.warn('[BlendIn] Profile upsert failed:', error.message);
  }
}

// ─── Display name update ──────────────────────────────────────────────────────

/**
 * Updates the user's display name in both Supabase auth metadata
 * and the profiles table.
 */
export async function updateDisplayName(name: string): Promise<void> {
  const { setUser } = useAuthStore.getState();
  const user = useAuthStore.getState().user;
  if (!user) return;

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) {
    throw new Error('Display name must be 1–30 characters.');
  }

  // Update auth metadata
  const { error: metaError } = await supabase.auth.updateUser({
    data: { display_name: trimmed },
  });
  if (metaError) throw metaError;

  // Update profile table
  await upsertProfile({ id: user.id, display_name: trimmed });

  // Update local store
  setUser({ ...user, displayName: trimmed });
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { signOut: clearStore } = useAuthStore.getState();
  await supabase.auth.signOut();
  clearStore();
}

// ─── Auth state listener ──────────────────────────────────────────────────────

/**
 * Subscribe to Supabase auth state changes.
 * Returns an unsubscribe function — call it when the component unmounts.
 */
export function subscribeToAuthChanges(): () => void {
  const { setUser, setLoading } = useAuthStore.getState();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          isAnonymous: session.user.is_anonymous ?? true,
          email: session.user.email,
          displayName: session.user.user_metadata?.display_name,
          hasUsedMultiDevice: false,
        });
        setLoading(false);
      }
    },
  );

  return () => subscription.unsubscribe();
}
