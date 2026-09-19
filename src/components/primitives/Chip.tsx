/**
 * BlendIn — Chip / Tag Component
 *
 * Pill-shaped compact labels for categories, difficulty tiers, status badges.
 * Text in JetBrains Mono Label S (the "system" font for metadata).
 *
 * Usage:
 *   <Chip>Movies</Chip>
 *   <Chip variant="accent">18+</Chip>
 *   <Chip variant="info">Hard</Chip>
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { Text } from './Text';
import type { ColorToken } from '../../theme';

export type ChipVariant = 'default' | 'info' | 'accent' | 'success';

interface ChipConfig {
  background: string;
  textColor: ColorToken;
  borderColor?: string;
}

const chipConfig: Record<ChipVariant, ChipConfig> = {
  default: {
    background: 'transparent',
    textColor: 'light.muted',
    borderColor: colors['neutral.border'],
  },
  info: {
    background: colors['secondary.muted'],
    textColor: 'secondary',
  },
  accent: {
    background: colors['accent.muted'],
    textColor: 'accent',
  },
  success: {
    background: 'rgba(46, 204, 113, 0.15)',
    textColor: 'success',
  },
};

export interface ChipProps {
  variant?: ChipVariant;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Chip({ variant = 'default', children, style }: ChipProps) {
  const config = chipConfig[variant];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: config.background,
          borderColor: config.borderColor ?? 'transparent',
          borderWidth: config.borderColor ? 1 : 0,
        },
        style,
      ]}
    >
      <Text variant="labelS" color={config.textColor}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});
