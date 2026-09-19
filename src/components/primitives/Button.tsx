/**
 * BlendIn — Button Component
 *
 * Pill-shaped by default. All button text in JetBrains Mono Medium (labelL).
 * Enforces the design system's interactive element shape language.
 *
 * Variants:
 *   primary   → Burnt Orange fill, light text. Primary CTAs.
 *   secondary → Steel Blue 1px outline, Steel Blue text. Secondary actions.
 *   ghost     → No fill, no border, light text. Tertiary/destructive actions.
 *
 * Usage:
 *   <Button variant="primary" onPress={handleStart}>Start Game</Button>
 *   <Button variant="secondary" loading={isLoading}>Join Room</Button>
 *   <Button variant="ghost" onPress={handleSkip}>Skip</Button>
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from '../../lib/haptics';
import { colors, radii, spacing, layout, springs, pressScale } from '../../theme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  children,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      scale.value = withSpring(pressScale, springs.snappy);
    }
  }, [disabled, loading, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handlePress = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (!disabled && !loading) {
        Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(event);
      }
    },
    [disabled, loading, onPress],
  );

  const containerStyle = [
    styles.base,
    styles[variant],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
  ];

  return (
    <AnimatedPressable
      style={[animatedStyle, containerStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.light : colors.secondary}
        />
      ) : (
        <Text
          variant="labelL"
          color={
            variant === 'primary'
              ? 'light'
              : variant === 'secondary'
              ? 'secondary'
              : 'light'
          }
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  primary: {
    backgroundColor: colors.accent,
    // Add inner highlight to give it that tactile, polished edge
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,

  secondary: {
    backgroundColor: colors['secondary.muted'],
    borderWidth: 1,
    borderColor: colors.secondary,
  } as ViewStyle,

  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,

  fullWidth: {
    alignSelf: 'stretch',
  } as ViewStyle,

  disabled: {
    opacity: 0.4,
  } as ViewStyle,
});
