/**
 * BlendIn Design System — Color Tokens
 *
 * Dark-first theme. All surfaces layer upward through lightness,
 * never downward through shadow.
 *
 * Token naming: semantic name, not literal color name.
 * Use dot-notation import: colors['base.elevated'], or destructure as needed.
 */

export const colors = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  /** Primary app background. Deep teal-black — not dead black. */
  base: '#00232f',
  /** Elevated surfaces: cards, modals, list items. */
  'base.elevated': '#0a2d3a',
  /** Tertiary surfaces: input backgrounds, accordions, nested containers. */
  'base.subtle': '#133845',

  // ─── Secondary (Steel Blue) ─────────────────────────────────────────────────
  /** Interactive elements, links, info states, section headers, join codes. */
  secondary: '#4da2ca',
  /** Secondary tinted backgrounds, selected state fills. */
  'secondary.muted': 'rgba(77, 162, 202, 0.15)',

  // ─── Accent (Burnt Orange) ──────────────────────────────────────────────────
  /** Imposter indicators, primary CTAs, score highlights. USE SPARINGLY. */
  accent: '#D95B1F',
  /** Accent tinted backgrounds, imposter-themed surfaces. */
  'accent.muted': 'rgba(217, 91, 31, 0.15)',
  /** Animated score glow, celebration states, emphasis moments. */
  'accent.bright': '#E8702F',

  // ─── Neutral (Dim Grey with purple undertone) ───────────────────────────────
  /** Secondary text, inactive states, muted UI elements. */
  neutral: '#706677',
  /** Structural borders, dividers. 1px strokes on dark surfaces. */
  'neutral.border': 'rgba(112, 102, 119, 0.3)',

  // ─── Light (Platinum) ───────────────────────────────────────────────────────
  /** Primary text on dark surfaces, card content, high-contrast text. */
  light: '#ebebeb',
  /** Secondary text, placeholder text, descriptive copy. */
  'light.muted': '#a0a0a0',

  // ─── Semantic ───────────────────────────────────────────────────────────────
  /** Positive outcomes: "Busted!", civilian win, success states. */
  success: '#2ECC71',
  /** Error states, destructive actions, invalid input feedback. */
  error: '#E74C3C',
} as const;

export type ColorToken = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorToken];
