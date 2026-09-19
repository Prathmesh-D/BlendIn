/**
 * BlendIn Design System — Motion
 *
 * Motion serves the game's emotional arc:
 *   anticipation (role reveal) → tension (hint round) → release (outcome)
 *   → celebration (score update)
 *
 * All animations MUST respect the OS reduced-motion accessibility setting.
 * Use the `useReducedMotion()` hook before applying any animation.
 *
 * Note: react-native-reanimated spring configs use damping/stiffness/mass.
 * These are compatible with Reanimated 3 `withSpring()`.
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// ─── Spring configuration presets ────────────────────────────────────────────
export const springs = {
  /** Buttons, toggles — fast and snappy tactile response. */
  snappy: { damping: 20, stiffness: 300, mass: 1 },
  /** Screen transitions, layout changes — smooth and confident. */
  smooth: { damping: 25, stiffness: 200, mass: 1 },
  /** Role reveals, celebrations — energetic with natural bounce. */
  bouncy: { damping: 12, stiffness: 180, mass: 1 },
  /** Subtle motion, list item enters — soft and unobtrusive. */
  gentle: { damping: 30, stiffness: 150, mass: 1 },
} as const;

export type SpringPreset = keyof typeof springs;

// ─── Duration constants (ms) ──────────────────────────────────────────────────
export const durations = {
  /** Instant feel — button press feedback, toggles. */
  instant: 100,
  /** Fast — toast enter/exit, small state changes. */
  fast: 200,
  /** Standard — most transitions, modal open/close. */
  standard: 300,
  /** Deliberate — role reveal, dramatic moments. */
  deliberate: 500,
  /** Celebration — score animations, outcome reveals. */
  celebration: 700,
} as const;

export type DurationKey = keyof typeof durations;

// ─── Stagger delay (ms per item) ─────────────────────────────────────────────
export const stagger = {
  /** List item enter — 50ms between items. */
  list: 50,
  /** Pack card grid — 40ms between cards. */
  grid: 40,
  /** Onboarding steps — 150ms between major elements. */
  onboarding: 150,
} as const;

// ─── Press scale ──────────────────────────────────────────────────────────────
/** Scale applied on button/interactive element press. */
export const pressScale = 0.96;

/** Scale applied on button release (celebration tap). */
export const celebrateScale = 1.05;

// ─── Reduced motion hook ──────────────────────────────────────────────────────
/**
 * Returns `true` if the OS reduce-motion accessibility setting is enabled.
 *
 * When true:
 *   - Collapse spring physics to instant or 150ms linear transitions
 *   - Remove all decorative animations (ambient gradients, pulsing rings)
 *   - Haptic feedback REMAINS enabled (it's not motion)
 *
 * Usage:
 *   const reducedMotion = useReducedMotion();
 *   const animConfig = reducedMotion ? { duration: 150 } : springs.bouncy;
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Initial check
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );

    return () => subscription.remove();
  }, []);

  return reducedMotion;
}
