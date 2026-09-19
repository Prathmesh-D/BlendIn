/**
 * BlendIn — Pack Store (Phase 4)
 *
 * Manages all word packs beyond the built-in set:
 *   - Custom packs: user-created, stored in AsyncStorage
 *   - Installed community packs: IDs cached locally; pack data fetched from Supabase
 *
 * The pack store is initialized on app launch from AsyncStorage.
 * GameSetupScreen merges BUILTIN_PACKS + custom packs + installed community packs.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUILTIN_PACKS, type WordPack, type WordEntry } from '../data/builtinPacks';

// ─── AsyncStorage keys ────────────────────────────────────────────────────────
const CUSTOM_PACKS_KEY = '@blendin/custom_packs';
const INSTALLED_IDS_KEY = '@blendin/installed_community_ids';

// ─── Community pack shape (from Supabase) ────────────────────────────────────
export interface CommunityPack extends WordPack {
  communityId: string;      // Supabase row UUID
  creatorId: string;
  creatorName: string;
  voteCount: number;
  isApproved: boolean;
  hasVoted: boolean;        // Current user voted?
}

// ─── Store ────────────────────────────────────────────────────────────────────
export interface PackState {
  /** Locally authored packs (persisted to AsyncStorage) */
  customPacks: WordPack[];
  /** Community pack IDs the user has installed (word data fetched separately) */
  installedCommunityIds: Set<string>;
  /** In-memory cache of installed community packs (from Supabase) */
  installedCommunityPacks: CommunityPack[];

  isHydrated: boolean;

  // ── Actions ───────────────────────────────────────────────────────────────
  hydrate: () => Promise<void>;

  addCustomPack: (pack: WordPack) => Promise<void>;
  updateCustomPack: (id: string, patch: Partial<WordPack>) => Promise<void>;
  deleteCustomPack: (id: string) => Promise<void>;

  installCommunityPack: (pack: CommunityPack) => Promise<void>;
  uninstallCommunityPack: (communityId: string) => Promise<void>;

  setCommunityPackVote: (communityId: string, voted: boolean, newCount: number) => void;

  /** All packs available for use in GameSetup (builtin + custom + installed community) */
  getAllAvailablePacks: () => WordPack[];
}

export const usePackStore = create<PackState>((set, get) => ({
  customPacks: [],
  installedCommunityIds: new Set(),
  installedCommunityPacks: [],
  isHydrated: false,

  // ── Hydrate from AsyncStorage ─────────────────────────────────────────────
  hydrate: async () => {
    try {
      const [customRaw, idsRaw] = await Promise.all([
        AsyncStorage.getItem(CUSTOM_PACKS_KEY),
        AsyncStorage.getItem(INSTALLED_IDS_KEY),
      ]);
      const customPacks: WordPack[] = customRaw ? JSON.parse(customRaw) : [];
      const installedIds: string[] = idsRaw ? JSON.parse(idsRaw) : [];
      set({
        customPacks,
        installedCommunityIds: new Set(installedIds),
        isHydrated: true,
      });
    } catch (err) {
      console.error('[PackStore] Hydration failed:', err);
      set({ isHydrated: true });
    }
  },

  // ── Custom pack CRUD ──────────────────────────────────────────────────────
  addCustomPack: async (pack) => {
    set((state) => {
      const next = [...state.customPacks, pack];
      AsyncStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(next));
      return { customPacks: next };
    });
  },

  updateCustomPack: async (id, patch) => {
    set((state) => {
      const next = state.customPacks.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      );
      AsyncStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(next));
      return { customPacks: next };
    });
  },

  deleteCustomPack: async (id) => {
    set((state) => {
      const next = state.customPacks.filter((p) => p.id !== id);
      AsyncStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(next));
      return { customPacks: next };
    });
  },

  // ── Community pack install/uninstall ──────────────────────────────────────
  installCommunityPack: async (pack) => {
    set((state) => {
      const nextIds = new Set(state.installedCommunityIds);
      nextIds.add(pack.communityId);
      AsyncStorage.setItem(INSTALLED_IDS_KEY, JSON.stringify([...nextIds]));
      return {
        installedCommunityIds: nextIds,
        installedCommunityPacks: [...state.installedCommunityPacks, pack],
      };
    });
  },

  uninstallCommunityPack: async (communityId) => {
    set((state) => {
      const nextIds = new Set(state.installedCommunityIds);
      nextIds.delete(communityId);
      AsyncStorage.setItem(INSTALLED_IDS_KEY, JSON.stringify([...nextIds]));
      return {
        installedCommunityIds: nextIds,
        installedCommunityPacks: state.installedCommunityPacks.filter(
          (p) => p.communityId !== communityId,
        ),
      };
    });
  },

  setCommunityPackVote: (communityId, voted, newCount) => {
    set((state) => ({
      installedCommunityPacks: state.installedCommunityPacks.map((p) =>
        p.communityId === communityId
          ? { ...p, hasVoted: voted, voteCount: newCount }
          : p,
      ),
    }));
  },

  // ── Merged pack list for GameSetup ────────────────────────────────────────
  getAllAvailablePacks: () => {
    const { customPacks, installedCommunityPacks } = get();
    return [
      ...BUILTIN_PACKS,
      ...customPacks,
      ...installedCommunityPacks,
    ];
  },
}));
