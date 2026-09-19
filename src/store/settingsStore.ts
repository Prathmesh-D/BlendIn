import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HapticIntensity = 'light' | 'medium' | 'heavy';

interface SettingsState {
  hapticsEnabled: boolean;
  hapticIntensity: HapticIntensity;
  
  setHapticsEnabled: (enabled: boolean) => void;
  setHapticIntensity: (intensity: HapticIntensity) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = '@blendin/settings';

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  hapticIntensity: 'medium',

  setHapticsEnabled: (enabled) => {
    set({ hapticsEnabled: enabled });
    AsyncStorage.getItem(SETTINGS_KEY).then((str) => {
      const data = str ? JSON.parse(str) : {};
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...data, hapticsEnabled: enabled }));
    });
  },

  setHapticIntensity: (intensity) => {
    set({ hapticIntensity: intensity });
    AsyncStorage.getItem(SETTINGS_KEY).then((str) => {
      const data = str ? JSON.parse(str) : {};
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...data, hapticIntensity: intensity }));
    });
  },

  loadSettings: async () => {
    try {
      const str = await AsyncStorage.getItem(SETTINGS_KEY);
      if (str) {
        const data = JSON.parse(str);
        set({
          hapticsEnabled: data.hapticsEnabled ?? true,
          hapticIntensity: data.hapticIntensity ?? 'medium',
        });
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  },
}));
