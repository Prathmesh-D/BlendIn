/**
 * BlendIn Design System — Entry Point
 *
 * Import from here everywhere in the app:
 *   import { theme } from '@/theme';
 *   import { colors, textStyles, spacing } from '@/theme';
 */

export { colors } from './colors';
export type { ColorToken, ColorValue } from './colors';

export { fonts, fontAssets, fontSizes, textStyles } from './typography';
export type { TextVariant } from './typography';

export { spacing, layout } from './spacing';
export type { SpacingKey, SpacingValue } from './spacing';

export { radii, borders } from './shapes';
export type { RadiusKey, BorderPreset } from './shapes';

export {
  springs,
  durations,
  stagger,
  pressScale,
  celebrateScale,
  useReducedMotion,
} from './motion';
export type { SpringPreset, DurationKey } from './motion';

// ─── Unified theme object ─────────────────────────────────────────────────────
import { colors } from './colors';
import { fonts, fontSizes, textStyles } from './typography';
import { spacing, layout } from './spacing';
import { radii, borders } from './shapes';
import { springs, durations, stagger, pressScale, celebrateScale } from './motion';

export const theme = {
  colors,
  fonts,
  fontSizes,
  textStyles,
  spacing,
  layout,
  radii,
  borders,
  springs,
  durations,
  stagger,
  pressScale,
  celebrateScale,
} as const;

export type Theme = typeof theme;
