/**
 * BlendIn — Supabase Client (Phase 2)
 *
 * Typed Supabase client. The Database generic is populated from
 * our manually-authored types (to be regenerated via CLI after deploy).
 *
 * Session is persisted to AsyncStorage so users stay signed in
 * across app restarts without re-authenticating.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.warn(
    '[BlendIn] Supabase credentials missing. Copy .env.example to .env.local and fill in your project URL and anon key.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export types for convenience
export type { Profile, Room, RoomParticipant, GameRound } from './database.types';
