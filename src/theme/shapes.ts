/**
 * BlendIn Design System — Shape Language
 *
 * The contrast between sharp structural containers and pill-shaped
 * interactive elements IS the visual identity. No "generic 12px-on-everything"
 * softness.
 *
 * Rule:
 *   sharp → structural, static content (cards, screens, image frames)
 *   pill  → interactive, touchable elements (buttons, chips, inputs)
 *   functional → UI chrome only (toasts, dropdowns, modals)
 */

import { colors } from './colors';

export const radii = {
  /** 0px — structural containers. Cards, section backgrounds, image frames. */
  sharp: 0,
  /** 999px — interactive elements. Buttons, chips, tags, inputs, badges. */
  pill: 999,
  /** 8px — functional UI chrome only. Toasts, dropdown menus, modal corners. */
  functional: 8,
} as const;

export type RadiusKey = keyof typeof radii;

// ─── Border presets ───────────────────────────────────────────────────────────
export const borders = {
  /** Standard structural border. 1px, neutral tone. */
  default: {
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  /** Secondary (Steel Blue) focus/selected border. */
  secondary: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  /** Accent (Burnt Orange) emphasis border. */
  accent: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  /** Error state border. */
  error: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  /** Focus ring for accessibility — 2px secondary outline. */
  focus: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
} as const;

export type BorderPreset = keyof typeof borders;
