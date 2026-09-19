/**
 * BlendIn — Home Screen (Phase 3)
 *
 * START GAME goes directly to GameSetupScreen.
 * The play mode (pass-and-play vs multi-device) is chosen inside GameSetup.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, springs, layout, radii } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';



export function HomeScreen() {
  const navigation = useNavigation<any>();

  const titleY = useSharedValue(-16);
  const titleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  useEffect(() => {
    titleY.value = withSpring(0, springs.gentle);
    titleOpacity.value = withSpring(1, springs.gentle);
    ctaOpacity.value = withDelay(150, withSpring(1, springs.gentle));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Technical Overlay ─────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.corner, { top: 40, left: spacing.md, borderTopWidth: 2, borderLeftWidth: 2 }]} />
        <View style={[styles.corner, { top: 40, right: spacing.md, borderTopWidth: 2, borderRightWidth: 2 }]} />
        <View style={[styles.corner, { bottom: spacing.sm, left: spacing.md, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
        <View style={[styles.corner, { bottom: spacing.sm, right: spacing.md, borderBottomWidth: 2, borderRightWidth: 2 }]} />
      </View>

      {/* ── Poster title area ─────────────────────────────────── */}
      <View style={styles.topArea}>
        <View>
          <View style={styles.topTaglineBox}>
            <Text variant="labelM" color="light.muted" style={styles.tagline}>
              OBJECTIVE: BLEND IN OR BE DISCOVERED
            </Text>
          </View>

          <Animated.View style={[styles.titleBlock, titleStyle]}>
            <Text variant="funkyTitle" color="light" style={styles.appName}>
              BLEND
            </Text>
            <Text variant="funkyTitle" color="accent" style={styles.appName}>
              IN
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.ctaBlock, ctaStyle]}>
          <View style={styles.hudDataRight}>
            <Text variant="labelM" color="secondary" style={styles.versionText}>
              v1.0.0 // PROTOCOL: SOCIAL_DEDUCTION
            </Text>
          </View>
          <Button
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('GameSetup')}
            accessibilityLabel="Set up and start a new game"
          >
            START GAME
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('RoomJoin')}
            accessibilityLabel="Join an existing game"
          >
            JOIN A GAME
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  topArea: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  titleBlock: { marginTop: spacing.md, marginLeft: spacing.md },
  appName: {
    fontSize: 88,
    lineHeight: 88,
    letterSpacing: -3,
    textTransform: 'uppercase',
  },
  versionText: { letterSpacing: 1 },
  hudDataRight: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    paddingRight: spacing.sm,
  },
  ctaBlock: { gap: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  topTaglineBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
    marginTop: spacing.xl,
    marginLeft: spacing.md,
  },
  tagline: { letterSpacing: 1 },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors['secondary.muted'],
  },
});
