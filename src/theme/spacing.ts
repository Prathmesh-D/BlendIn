/**
 * BlendIn Design System — Spacing
 *
 * An 8-point base grid. Every spacing value is a multiple of 4.
 *
 * Usage:
 *   paddingHorizontal: spacing.lg   (screen-level horizontal padding)
 *   marginBottom: spacing.xl        (section gaps)
 *   gap: spacing.md                 (component internal gaps)
 */

export const spacing = {
  /** 4px — tight internal padding, icon-to-label gaps */
  xs: 4,
  /** 8px — compact spacing, chip/tag padding */
  sm: 8,
  /** 16px — standard component spacing, list row gaps */
  md: 16,
  /** 24px — section padding, card internal padding, screen horizontal padding */
  lg: 24,
  /** 32px — screen-level section gaps, major separations */
  xl: 32,
  /** 48px — hero-level breathing room, major screen divisions */
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

// ─── Layout constants ─────────────────────────────────────────────────────────
export const layout = {
  /** Standard horizontal padding applied to every screen's content area. */
  screenPaddingH: spacing.lg,
  /** Minimum vertical gap between major sections on a screen. */
  sectionGap: spacing.xl,
  /** Fixed bottom bar height (buttons pinned above the safe area). */
  bottomBarHeight: 80,
  /** Min touch target size (iOS 44pt / Android 48dp, we use 48 for both). */
  minTouchTarget: 48,
} as const;
