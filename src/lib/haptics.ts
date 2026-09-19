import * as ExpoHaptics from 'expo-haptics';
export * from 'expo-haptics';
import { useSettingsStore, HapticIntensity } from '../store/settingsStore';

export const intensityMap: Record<HapticIntensity, ExpoHaptics.ImpactFeedbackStyle> = {
  light: ExpoHaptics.ImpactFeedbackStyle.Light,
  medium: ExpoHaptics.ImpactFeedbackStyle.Medium,
  heavy: ExpoHaptics.ImpactFeedbackStyle.Heavy,
};

export const triggerHaptic = (
  style?: ExpoHaptics.ImpactFeedbackStyle,
  overrideGlobal?: boolean
) => {
  const { hapticsEnabled, hapticIntensity } = useSettingsStore.getState();
  
  if (!hapticsEnabled) return;

  const finalStyle = overrideGlobal 
    ? (style ?? intensityMap[hapticIntensity])
    : intensityMap[hapticIntensity];

  ExpoHaptics.impactAsync(finalStyle);
};

export const triggerNotification = (
  type: ExpoHaptics.NotificationFeedbackType
) => {
  const { hapticsEnabled } = useSettingsStore.getState();
  if (!hapticsEnabled) return;
  
  ExpoHaptics.notificationAsync(type);
};
