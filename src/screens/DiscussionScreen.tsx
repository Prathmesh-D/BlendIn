/**
 * BlendIn — Discussion & Resolution Screen (P1.5 Redesign)
 *
 * Strict geometry and data-grid outcome layouts.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from '../lib/haptics';
import { useNavigation } from '@react-navigation/native';
import { useGameStore, type RoundOutcome } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { computeScoreDeltas } from '../engine/roleAssignment';
import { subscribeToRoomStatus, updateRoomStatus, updateMyScore } from '../lib/roomService';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radii, layout, springs, durations } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import type { Player, PlayerRole } from '../store/gameStore';

type DiscussionPhase = 'voting' | 'revealed' | 'outcome_selected';

export function DiscussionScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { players, roles, roundSettings, recordOutcome, playMode, isHost, roomId } = useGameStore();
  const { incrementRounds } = useSessionStore();
  const { user } = useAuthStore();

  const [phase, setPhase] = useState<DiscussionPhase>('revealed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imposterPlayers = players.filter(
    (p: Player) => roles.find((r: PlayerRole) => r.playerId === p.id)?.isImposter,
  );
  const imposterIds = imposterPlayers.map((p: Player) => p.id);

  const mainImposter = imposterPlayers[0];
  const mainImposterRole = roles.find((r: PlayerRole) => r.playerId === mainImposter?.id);

  const revealCardScale = useSharedValue(0.95);
  const revealCardOpacity = useSharedValue(0);
  const backgroundWash = useSharedValue(0);

  const revealCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealCardScale.value }],
    opacity: revealCardOpacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundWash.value,
  }));

  useEffect(() => {
    Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy, true);
    revealCardScale.value = withSpring(1, springs.bouncy);
    revealCardOpacity.value = withTiming(1, { duration: durations.fast });
    backgroundWash.value = withTiming(1, { duration: durations.standard });
  }, []);

  useEffect(() => {
    if (playMode === 'online' && !isHost && roomId) {
      return subscribeToRoomStatus(roomId, (room) => {
        if (room.status === 'finished') {
          const settings = room.settings as any;
          if (settings.outcome && settings.deltas) {
            incrementRounds();
            recordOutcome(settings.outcome, settings.deltas);
            if (user?.id) {
              const myDelta = settings.deltas[user.id] || 0;
              const myPlayer = players.find(p => p.id === user.id);
              if (myPlayer) {
                updateMyScore(roomId, user.id, myPlayer.score + myDelta).catch(() => {});
              }
            }
            navigation.replace('RoundSummary');
          }
        }
      });
    }
  }, [playMode, isHost, roomId, navigation, incrementRounds, recordOutcome, user, players]);

  const handleOutcome = useCallback(
    async (outcome: RoundOutcome) => {
      setIsSubmitting(true);
      const deltas = computeScoreDeltas(players, imposterIds, outcome);

      if (playMode === 'online' && isHost && roomId) {
        try {
          if (user?.id) {
            const myDelta = deltas[user.id] || 0;
            const myPlayer = players.find(p => p.id === user.id);
            if (myPlayer) {
              await Promise.all([
                updateRoomStatus(roomId, 'finished', { outcome, deltas } as any),
                updateMyScore(roomId, user.id, myPlayer.score + myDelta)
              ]);
            } else {
              await updateRoomStatus(roomId, 'finished', { outcome, deltas } as any);
            }
          } else {
            await updateRoomStatus(roomId, 'finished', { outcome, deltas } as any);
          }
        } catch (e) {
          setIsSubmitting(false);
          return; // Fail gracefully
        }
      }

      setPhase('outcome_selected');
      Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);

      incrementRounds();
      recordOutcome(outcome, deltas);

      navigation.replace('RoundSummary');
    },
    [players, imposterIds, incrementRounds, recordOutcome, navigation, playMode, isHost, roomId],
  );
  const StandardRevealContent = () => (
    <View style={styles.centerAlign}>
      <Text variant="labelM" color="neutral" style={styles.eyebrow}>
        THE IMPOSTER WAS
      </Text>
      <Text variant="displayXXL" color="accent" style={styles.imposterName}>
        {mainImposter?.name}
      </Text>
      {mainImposterRole?.word ? (
        <Text variant="labelL" color="light.muted" style={styles.imposterWord}>
          WORD: {mainImposterRole.word}
        </Text>
      ) : null}
      {imposterPlayers.length > 1 && (
        <Text variant="labelM" color="light.muted" style={{ marginTop: spacing.md }}>
          + {imposterPlayers.slice(1).map((p: Player) => p.name).join(', ')}
        </Text>
      )}
      <View style={[styles.outcomeButtons, { marginTop: spacing.xxl }]}>
        {isHost ? (
          <>
            <Button variant="primary" fullWidth loading={isSubmitting} onPress={() => handleOutcome('busted')}>
              BUSTED
            </Button>
            <Button variant="ghost" fullWidth loading={isSubmitting} onPress={() => handleOutcome('escaped')}>
              GOT AWAY
            </Button>
          </>
        ) : (
          <Text variant="labelM" color="light.muted" style={{ textAlign: 'center', marginTop: spacing.md }}>
            WAITING FOR HOST TO DECIDE OUTCOME...
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.accentWash, backgroundStyle]} pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.center, revealCardStyle]}>
          <StandardRevealContent />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  accentWash: {
    backgroundColor: colors['accent.muted'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
  title: {
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  centerAlign: {
    alignItems: 'center',
    width: '100%',
  },
  eyebrow: {
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  imposterName: {
    textAlign: 'center',
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  imposterWord: {
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  dataGrid: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  outcomeButtons: {
    width: '100%',
    gap: spacing.sm,
  },
});
