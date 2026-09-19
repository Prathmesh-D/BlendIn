/**
 * BlendIn Design System — Typography
 *
 * Three-typeface system:
 *   Display  → Space Grotesk Bold    (bold, geometric, expressive)
 *   Label/UI → JetBrains Mono        (precise, technical, "system")
 *   Body     → DM Sans               (clean, readable, warm)
 *
 * Rule: typeface signals WHO is talking.
 *   - Space Grotesk  → high-impact moments, headings, game events
 *   - JetBrains Mono → game engine output (codes, scores, tags, metadata)
 *   - DM Sans        → human-readable copy (descriptions, instructions)
 */

import { TextStyle } from 'react-native';
import {
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { BungeeShade_400Regular } from '@expo-google-fonts/bungee-shade';

// ─── Font family constants ─────────────────────────────────────────────────────
// These string values match how expo-font registers fonts from the packages.
// expo-google-fonts uses the export const name as the font family string.
export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  monoRegular: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  funky: 'BungeeShade_400Regular',
} as const;

// ─── Font asset map (for useFonts / loadAsync) ────────────────────────────────
// Spread this into the useFonts() call in the app entry point.
export const fontAssets = {
  SpaceGrotesk_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  DMSans_400Regular,
  DMSans_500Medium,
  BungeeShade_400Regular,
} as const;

// ─── Sizing scale ─────────────────────────────────────────────────────────────
// Base mobile values. All are in logical pixels (dp).
export const fontSizes = {
  displayXXL: 56, // Massive moments (Role reveal, Home hero)
  displayXL: 48,  // Hero statements, round announcements
  displayL: 32,   // Screen titles, score numbers
  displayM: 24,   // Section headings, player names
  labelL: 16,     // Join codes, primary buttons
  labelM: 14,     // Metadata, tags, secondary buttons
  labelS: 12,     // Timestamps, tertiary labels
  bodyL: 16,      // Primary body copy
  bodyM: 14,      // Secondary copy, descriptions
  bodyS: 12,      // Captions, helper text
} as const;

// ─── Line heights ─────────────────────────────────────────────────────────────
// Display: very tight (1.05). Body: comfortable (1.5). Label: compact (1.3).
const lineHeights = {
  display: (size: number) => Math.round(size * 1.05),
  label: (size: number) => Math.round(size * 1.3),
  body: (size: number) => Math.round(size * 1.5),
};

// ─── Pre-composed text style objects ─────────────────────────────────────────
// Use these via the <Text variant="displayXL"> component. Never write ad-hoc
// fontFamily/fontSize styles directly on RN <Text> nodes.
export const textStyles = {
  // Display (Space Grotesk Bold / Bungee) ─────────────────────────────────────────────
  funkyTitle: {
    fontFamily: fonts.funky,
    fontSize: fontSizes.displayXXL,
    lineHeight: Math.round(fontSizes.displayXXL * 1.2),
    letterSpacing: -1,
  } satisfies TextStyle,

  displayXXL: {
    fontFamily: fonts.display,
    fontSize: fontSizes.displayXXL,
    lineHeight: lineHeights.display(fontSizes.displayXXL),
    letterSpacing: -2,
  } satisfies TextStyle,

  displayXL: {
    fontFamily: fonts.display,
    fontSize: fontSizes.displayXL,
    lineHeight: lineHeights.display(fontSizes.displayXL),
    letterSpacing: -1.5,
  } satisfies TextStyle,

  displayL: {
    fontFamily: fonts.display,
    fontSize: fontSizes.displayL,
    lineHeight: lineHeights.display(fontSizes.displayL),
    letterSpacing: -1,
  } satisfies TextStyle,

  displayM: {
    fontFamily: fonts.display,
    fontSize: fontSizes.displayM,
    lineHeight: lineHeights.display(fontSizes.displayM),
    letterSpacing: -0.5,
  } satisfies TextStyle,

  // Label (JetBrains Mono) ──────────────────────────────────────────────────
  labelL: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.labelL,
    lineHeight: lineHeights.label(fontSizes.labelL),
    letterSpacing: 0,
  } satisfies TextStyle,

  labelM: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.labelM,
    lineHeight: lineHeights.label(fontSizes.labelM),
    letterSpacing: 0,
  } satisfies TextStyle,

  labelS: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.labelS,
    lineHeight: lineHeights.label(fontSizes.labelS),
    letterSpacing: 0.2,
  } satisfies TextStyle,

  // Body (DM Sans) ──────────────────────────────────────────────────────────
  bodyL: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.bodyL,
    lineHeight: lineHeights.body(fontSizes.bodyL),
    letterSpacing: 0.1,
  } satisfies TextStyle,

  bodyM: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.bodyM,
    lineHeight: lineHeights.body(fontSizes.bodyM),
    letterSpacing: 0.1,
  } satisfies TextStyle,

  bodyS: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.bodyS,
    lineHeight: lineHeights.body(fontSizes.bodyS),
    letterSpacing: 0.1,
  } satisfies TextStyle,
} as const;

export type TextVariant = keyof typeof textStyles;
