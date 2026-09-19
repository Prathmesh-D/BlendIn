/**
 * BlendIn — Onboarding Screen
 *
 * Brutalist, heavily animated walkthrough shown only on first launch.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, springs, radii, layout, fonts } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import * as Haptics from '../lib/haptics';

const ONBOARDING_KEY = '@blendin_onboarding_done';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  {
    id: 'objective',
    eyebrow: '01 / PROTOCOL',
    headline: 'EVERYONE GETS A WORD',
    body: 'All players receive a secret word that links them together. Your mission: give subtle clues without giving it away.',
  },
  {
    id: 'imposter',
    eyebrow: '02 / ANOMALY',
    headline: 'ONE PLAYER IS DIFFERENT',
    body: 'The imposter receives a decoy word—or nothing at all. They must observe, adapt, blend in, and survive.',
  },
  {
    id: 'vote',
    eyebrow: '03 / RESOLUTION',
    headline: 'TRUST NO ONE',
    body: 'After everyone drops a hint, the group votes. Can you spot who doesn\'t fit in? Watch out for paranoia mode.',
  },
];

// ─── Glitchy/Geometric Visuals per step ────────────────────────────────────────

function VisualObjective() {
  return (
    <View style={visualStyles.container}>
      <Animated.View entering={FadeInDown.delay(100).springify()} style={[visualStyles.block, { backgroundColor: colors.light }]} />
      <Animated.View entering={FadeInDown.delay(200).springify()} style={[visualStyles.block, { backgroundColor: colors.light }]} />
      <Animated.View entering={FadeInDown.delay(300).springify()} style={[visualStyles.block, { backgroundColor: colors.light }]} />
    </View>
  );
}

function VisualImposter() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  return (
    <View style={visualStyles.container}>
      <View style={[visualStyles.block, { backgroundColor: colors.light, opacity: 0.2 }]} />
      <Animated.View style={[visualStyles.block, { backgroundColor: colors.accent, borderRadius: 0 }, animatedStyle]} />
      <View style={[visualStyles.block, { backgroundColor: colors.light, opacity: 0.2 }]} />
    </View>
  );
}

function VisualVote() {
  return (
    <View style={visualStyles.container}>
      <Animated.View entering={FadeInRight.delay(100).springify()} style={[visualStyles.block, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
      <Animated.View entering={FadeInRight.delay(200).springify()} style={[visualStyles.block, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
      <Animated.View entering={FadeInRight.delay(300).springify()} style={[visualStyles.block, { backgroundColor: colors.secondary }]} />
    </View>
  );
}

const visualStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 120,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  block: {
    width: 48,
    height: 48,
  }
});

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={dotStyles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          layout={Layout.springify()}
          style={[
            dotStyles.dot,
            i === active ? dotStyles.activeDot : dotStyles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  dot: { height: 4 },
  activeDot: { width: 32, backgroundColor: colors.light },
  inactiveDot: { width: 12, backgroundColor: colors['neutral.border'] },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== activeStep) {
        Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        setActiveStep(index);
      }
    },
    [activeStep],
  );

  const goToStep = useCallback((step: number) => {
    Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    scrollRef.current?.scrollTo({ x: step * SCREEN_WIDTH, animated: true });
    setActiveStep(step);
  }, []);

  const handleFinish = useCallback(async () => {
    Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('MainTabs');
  }, [navigation]);

  const handleSkip = useCallback(async () => {
    Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('MainTabs');
  }, [navigation]);

  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Corner Borders */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.corner, { top: spacing.xl, left: spacing.md, borderTopWidth: 2, borderLeftWidth: 2 }]} />
        <View style={[styles.corner, { top: spacing.xl, right: spacing.md, borderTopWidth: 2, borderRightWidth: 2 }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
        >
          <Text variant="labelM" color="neutral">
            [ SKIP ]
          </Text>
        </Pressable>
      </View>

      {/* Swiper */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scroll}
        scrollEventThrottle={16}
      >
        {STEPS.map((step, i) => {
          const isActive = activeStep === i;
          return (
            <View key={step.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              {/* Only animate elements in if the step is active, making it feel highly responsive */}
              {isActive && (
                <View style={styles.slideContent}>
                  {i === 0 && <VisualObjective />}
                  {i === 1 && <VisualImposter />}
                  {i === 2 && <VisualVote />}

                  <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <Text variant="labelS" color="secondary" style={styles.eyebrow}>
                      {step.eyebrow}
                    </Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(250).springify()}>
                    <Text variant="displayXXL" color="light" style={styles.headline}>
                      {step.headline}
                    </Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(350).springify()}>
                    <Text variant="bodyM" color="light.muted" style={styles.body}>
                      {step.body}
                    </Text>
                  </Animated.View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomNav}>
        <ProgressDots count={STEPS.length} active={activeStep} />

        <Animated.View layout={Layout.springify()} style={{ minWidth: 140 }}>
          {isLastStep ? (
            <Animated.View entering={FadeInRight.springify()}>
              <Button variant="primary" onPress={handleFinish}>
                INITIALIZE
              </Button>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInRight.springify()}>
              <Button variant="ghost" onPress={() => goToStep(activeStep + 1)}>
                NEXT SEQUENCE
              </Button>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors['neutral.border'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.sm,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    paddingHorizontal: layout.screenPaddingH,
  },
  eyebrow: {
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  headline: {
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
  },
  body: {
    lineHeight: 26,
    maxWidth: '90%',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: layout.screenPaddingH,
    paddingTop: spacing.md,
  },
});
