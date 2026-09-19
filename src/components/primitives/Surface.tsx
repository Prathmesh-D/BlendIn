/**
 * BlendIn — Surface Component
 *
 * Structural container primitive. Sharp corners (0px radius) by default,
 * enforcing the design system's shape language for non-interactive elements.
 *
 * Elevation maps directly to theme background color tokens:
 *   base     → '#00232f' (primary app background)
 *   elevated → '#0a2d3a' (cards, modals, list items)
 *   subtle   → '#133845' (inputs, accordions, nested containers)
 *
 * Usage:
 *   <Surface elevation="elevated" style={styles.card}>...</Surface>
 *   <Surface elevation="subtle" style={styles.input}>...</Surface>
 */

import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';

export type SurfaceElevation = 'base' | 'elevated' | 'subtle';

export interface SurfaceProps extends ViewProps {
  elevation?: SurfaceElevation;
  radius?: number;
  bordered?: boolean;
}

const elevationColors: Record<SurfaceElevation, string> = {
  base: colors.base,
  elevated: colors['base.elevated'],
  subtle: colors['base.subtle'],
};

export function Surface({
  elevation = 'elevated',
  radius = radii.sharp,
  bordered = false,
  style,
  children,
  ...props
}: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: elevationColors[elevation], borderRadius: radius },
        bordered && { borderWidth: 1, borderColor: colors['neutral.border'] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  } as ViewStyle,
});
