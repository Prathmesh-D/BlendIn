/**
 * BlendIn — Text Component
 *
 * The ONLY way to render text in the app. Never use RN's raw <Text> with
 * ad-hoc fontFamily styles. This component enforces the typography system.
 *
 * Usage:
 *   <Text variant="displayXL" color="accent">BUSTED!</Text>
 *   <Text variant="labelM" color="light.muted">Round 3 · Classic Pair</Text>
 *   <Text variant="bodyL">Pass and play or go online</Text>
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { textStyles, TextVariant, colors, ColorToken } from '../../theme';

export interface TextProps extends RNTextProps {
  /** Typography variant from the design system scale. Defaults to 'bodyM'. */
  variant?: TextVariant;
  /** Color token key. Defaults to 'light'. */
  color?: ColorToken;
}

export function Text({
  variant = 'bodyM',
  color = 'light',
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        textStyles[variant],
        { color: colors[color] },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
