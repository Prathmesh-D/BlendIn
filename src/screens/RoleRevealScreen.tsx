/**
 * BlendIn — Role Reveal Screen (P1.5 Redesign)
 *
 * Maximalist typography. The thumbprint area dominates the screen.
 * Strict geometry and high contrast.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from '../lib/haptics';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { subscribeToRoomStatus, updateRoomStatus } from '../lib/roomService';
import { colors, spacing, radii, layout, springs, durations } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import type { Player, PlayerRole } from '../store/gameStore';

const HOLD_THRESHOLD_MS = 400;
const RING_SCALE = 1.05;

type Phase =
  | 'pass'
  | 'holding'
  | 'revealed'
  | 'hidden'
  | 'announcing';

export function RoleRevealScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { players, roles, revealIndex, advanceReveal, setPhase, playMode, isHost, roomId } = useGameStore();
  const { user } = useAuthStore();

  const [screenPhase, setScreenPhase] = useState<Phase>('pass');
  const [revealCount, setRevealCount] = useState(0);
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = playMode === 'online' 
    ? players.find(p => p.id === user?.id) 
    : players[revealIndex];
    
  const currentRole = roles.find((r: PlayerRole) => r.playerId === currentPlayer?.id);
  const isLastPlayer = playMode === 'online' ? true : revealIndex >= players.length - 1;
  const startingPlayer = players.find(
    (p: Player) => roles.find((r: PlayerRole) => r.playerId === p.id)?.isStartingPlayer,
  );

  // Online joiner listener
  useEffect(() => {
    if (playMode === 'online' && !isHost && roomId) {
      return subscribeToRoomStatus(roomId, (room) => {
        const settings = room.settings as any;
        if (settings.revealImposter) {
          setPhase('revealed');
          navigation.replace('Discussion');
        }
      });
    }
  }, [playMode, isHost, roomId, navigation, setPhase]);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);
  const ringFill = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  const announcingScale = useSharedValue(0.9);
  const announcingOpacity = useSharedValue(0);
  const gotItOpacity = useSharedValue(0);
  const passY = useSharedValue(0);

  const startPulse = useCallback(() => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(RING_SCALE, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, [ringScale, ringOpacity]);

  const stopPulse = useCallback(() => {
    cancelAnimation(ringScale);
    cancelAnimation(ringOpacity);
    ringScale.value = withSpring(1, springs.snappy);
    ringOpacity.value = withTiming(1, { duration: 100 });
  }, [ringScale, ringOpacity]);

  useEffect(() => {
    ringOpacity.value = 0.3;
    startPulse();
    return () => {
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
    };
  }, [revealIndex, startPulse, ringOpacity, ringScale]);

  const handlePressIn = useCallback(() => {
    if (screenPhase !== 'pass' && screenPhase !== 'hidden') return;
    if (revealCount >= 2) return;

    if (screenPhase === 'hidden') {
      gotItOpacity.value = withTiming(0, { duration: durations.fast });
    }

    Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    stopPulse();
    setScreenPhase('holding');

    ringFill.value = withTiming(1, { duration: HOLD_THRESHOLD_MS * 1.1, easing: Easing.out(Easing.ease) });
    passY.value = withSpring(20, springs.snappy);

    holdTimerRef.current = setTimeout(() => {
      setScreenPhase('revealed');
      contentScale.value = withSpring(1, springs.bouncy);
      contentOpacity.value = withTiming(1, { duration: durations.fast });

      if (currentRole?.isImposter) {
        Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy, true);
      } else {
        Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Medium, true);
      }
    }, HOLD_THRESHOLD_MS);
  }, [screenPhase, revealCount, currentRole, stopPulse, ringFill, passY, contentScale, contentOpacity, gotItOpacity]);

  const handlePressOut = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (screenPhase === 'holding') {
      Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      ringFill.value = withTiming(0, { duration: 150 });
      passY.value = withSpring(0, springs.snappy);
      startPulse();
      setScreenPhase('pass');
      return;
    }

    if (screenPhase === 'revealed') {
      contentScale.value = withSpring(0.9, springs.snappy);
      contentOpacity.value = withTiming(0, { duration: durations.instant });
      ringFill.value = withTiming(0, { duration: 200 });

      gotItOpacity.value = withDelay(100, withTiming(1, { duration: durations.fast }));
      setScreenPhase('hidden');
      setRevealCount(prev => prev + 1);
    }
  }, [screenPhase, startPulse, ringFill, passY, contentScale, contentOpacity, gotItOpacity]);

  const handleGotIt = useCallback(() => {
    gotItOpacity.value = withTiming(0, { duration: durations.fast });

    if (isLastPlayer) {
      setScreenPhase('announcing');
      announcingScale.value = withSpring(1, springs.smooth);
      announcingOpacity.value = withTiming(1, { duration: durations.standard });
    } else {
      contentScale.value = 0.9;
      contentOpacity.value = 0;
      ringFill.value = 0;
      passY.value = 0;
      setRevealCount(0);
      advanceReveal();
      startPulse();
      setScreenPhase('pass');
    }
  }, [isLastPlayer, advanceReveal, startPulse, navigation, setPhase,
      gotItOpacity, announcingScale, announcingOpacity, contentScale, contentOpacity, ringFill, passY]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));
  const ringFillStyle = useAnimatedStyle(() => ({
    height: `${ringFill.value * 100}%`,
    width: '100%',
    backgroundColor: colors.secondary,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));
  const gotItStyle = useAnimatedStyle(() => ({
    opacity: gotItOpacity.value,
  }));
  const announcingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: announcingScale.value }],
    opacity: announcingOpacity.value,
  }));
  const passStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: passY.value }],
  }));

  if (!currentPlayer || !currentRole) return null;

  const isImposter = currentRole.isImposter;
  const wordToShow = currentRole.word;

  if (screenPhase === 'announcing' && startingPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.center, announcingStyle]}>
          <Text variant="labelM" color="neutral" style={styles.eyebrow}>
            STARTING PLAYER
          </Text>
          <Text variant="displayXXL" color="light" style={styles.bigName}>
            {startingPlayer.name}
          </Text>
          <View style={styles.sharpDivider} />
          <Text variant="labelL" color="light.muted" style={styles.subLabel}>
            Take turns giving one hint each.
          </Text>
          <Text variant="labelL" color="light.muted" style={styles.subLabel}>
            No phones — just talk.
          </Text>
        </Animated.View>
        
        <View style={[styles.gotItContainer, { bottom: insets.bottom + spacing.xxl }]}>
          {playMode === 'online' && !isHost ? (
            <Button variant="ghost" fullWidth disabled>
              WAITING FOR HOST...
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              loading={isStartingDiscussion}
              onPress={async () => {
                if (playMode === 'online' && roomId) {
                  setIsStartingDiscussion(true);
                  try {
                    await updateRoomStatus(roomId, 'playing', { revealImposter: true } as any);
                  } catch (e) {
                    setIsStartingDiscussion(false);
                    return; // Fail gracefully
                  }
                }
                setPhase('revealed');
                navigation.replace('Discussion');
              }}
            >
              REVEAL IMPOSTER
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {playMode === 'local' && (
        <View style={styles.topBar}>
          <Text variant="labelM" color="neutral">
            P{revealIndex + 1}/{players.length}
          </Text>
          <Text variant="labelM" color="neutral">REVEAL</Text>
        </View>
      )}

      <View style={styles.center}>
        {playMode === 'local' && (
          <Animated.View style={[styles.passContainer, passStyle]}>
            <Text variant="labelL" color="neutral" style={styles.passLabel}>
              PASS TO
            </Text>
            <Text variant="displayXL" color="light" style={styles.playerName}>
              {currentPlayer.name}
            </Text>
          </Animated.View>
        )}

        <View style={styles.holdArea}>
          <Animated.View style={[styles.squareTarget, ringStyle]}>
            <Animated.View style={[styles.targetFill, ringFillStyle]} />
          </Animated.View>
          <Text variant="labelM" color="light.muted" style={styles.holdInstruction} pointerEvents="none">
            [ HOLD TO DECRYPT ]
          </Text>
          <Pressable
            style={styles.holdTarget}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={10000}
            accessibilityRole="button"
            accessibilityLabel={`Hold to reveal role`}
          />
        </View>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, styles.revealOverlay, contentStyle, isImposter && styles.imposterBackground]} pointerEvents="none">
        <View style={styles.revealCenter}>
          <Text variant="labelM" color={isImposter ? 'accent' : 'light.muted'} style={styles.roleEyebrow}>
            {isImposter ? 'YOU ARE THE IMPOSTER' : 'YOU ARE A CIVILIAN'}
          </Text>
          <Text variant="displayXXL" color={isImposter ? 'accent' : 'light'} style={styles.revealWord}>
            {wordToShow || '—'}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.gotItContainer, gotItStyle, { bottom: insets.bottom + spacing.xxl }]}>
        <Button variant="ghost" fullWidth onPress={handleGotIt}>
          GOT IT →
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

// Dominate the screen with the hold area
const RING_SIZE = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
  passContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  passLabel: {
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  playerName: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  holdArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareTarget: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    justifyContent: 'flex-end',
    backgroundColor: colors.base,
    overflow: 'hidden',
  },
  targetFill: {
    width: '100%',
    backgroundColor: colors.secondary,
  },
  holdTarget: {
    position: 'absolute',
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: radii.pill,
  },
  holdInstruction: {
    position: 'absolute',
    letterSpacing: 2,
  },
  revealOverlay: {
    backgroundColor: colors.base,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
  imposterBackground: {
    backgroundColor: colors.base,
  },
  revealCenter: {
    alignItems: 'center',
  },
  roleEyebrow: {
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  revealWord: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  gotItContainer: {
    position: 'absolute',
    left: layout.screenPaddingH,
    right: layout.screenPaddingH,
  },
  eyebrow: {
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  bigName: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sharpDivider: {
    width: 60,
    height: 1,
    backgroundColor: colors['neutral.border'],
    marginVertical: spacing.xl,
  },
  subLabel: {
    textAlign: 'center',
    letterSpacing: 1,
  },
});
