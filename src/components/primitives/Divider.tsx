/**
 * BlendIn — Divider Component
 *
 * Horizontal separator using neutral.border color.
 * Variants:
 *   full  → edge-to-edge (marginHorizontal: 0)
 *   inset → with screen-level horizontal padding
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, layout } from '../../theme';

export type DividerVariant = 'full' | 'inset';

export interface DividerProps {
  variant?: DividerVariant;
  style?: ViewStyle;
}

export function Divider({ variant = 'full', style }: DividerProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'inset' && styles.inset,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors['neutral.border'],
  } as ViewStyle,

  inset: {
    marginHorizontal: layout.screenPaddingH,
  } as ViewStyle,
});
