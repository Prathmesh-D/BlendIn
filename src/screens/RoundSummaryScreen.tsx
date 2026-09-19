/**
 * BlendIn — Round Summary Screen (P1.5 Redesign)
 *
 * Strict typographic scoreboard.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useGameStore, type RoundOutcome } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { assignRoles } from '../engine/roleAssignment';
import { subscribeToRoomStatus, updateRoomStatus, getRoomParticipants } from '../lib/roomService';
import { colors, spacing, radii, layout, springs, fonts, durations } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';

function getOutcomeHeadline(outcome: RoundOutcome | null | undefined): { text: string; color: 'success' | 'accent' | 'light' } {
  switch (outcome) {
    case 'busted': return { text: 'BUSTED', color: 'success' };
    case 'escaped': return { text: 'ESCAPED', color: 'accent' };
    default: return { text: 'ROUND COMPLETE', color: 'light' };
  }
}

function ScoreRow({
  player,
  rank,
  isLeader,
  delta,
  index,
}: {
  player: { name: string; score: number };
  rank: number;
  isLeader: boolean;
  delta: number;
  index: number;
}) {
  const displayScore = useSharedValue(player.score - delta);
  const deltaScale = useSharedValue(0);

  useEffect(() => {
    displayScore.value = withDelay(
      300 + index * 100,
      withTiming(player.score, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );

    if (delta > 0) {
      deltaScale.value = withDelay(
        300 + index * 100,
        withSequence(
          withSpring(1.2, springs.bouncy),
          withTiming(1, { duration: durations.fast }),
        ),
      );
    }
  }, [displayScore, deltaScale, player.score, delta, index]);

  const [currentScore, setCurrentScore] = useState(player.score - delta);

  useEffect(() => {
    if (delta > 0) {
      setTimeout(() => {
        setCurrentScore(player.score);
      }, 300 + index * 100 + 300);
    }
  }, [delta, player.score, index]);

  const deltaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deltaScale.value }],
    opacity: deltaScale.value > 0 ? 1 : 0,
  }));

  const rankStr = rank.toString().padStart(2, '0');

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
      style={styles.scoreRow}
    >
      <View style={styles.rankCol}>
        <Text variant="labelL" color="neutral">{rankStr}</Text>
      </View>
      
      <View style={styles.nameCol}>
        <Text variant="labelL" color="light" style={styles.nameText}>{player.name}</Text>
      </View>

      <View style={styles.scoreCol}>
        {delta > 0 && (
          <Animated.View style={[styles.deltaBadge, deltaStyle]}>
            <Text variant="labelS" color="base">+{delta}</Text>
          </Animated.View>
        )}
        <Text
          variant="displayL"
          color={isLeader ? 'accent' : 'light'}
          style={styles.scoreNumber}
        >
          {currentScore}
        </Text>
      </View>
    </Animated.View>
  );
}

export function RoundSummaryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { players, lastOutcome, lastScoreDeltas, roundSettings, setRoles, setRoundSettings, updatePlayer, resetRound, playMode, isHost, roomId, joinCode } = useGameStore();
  const { roundsPlayed } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headline = getOutcomeHeadline(lastOutcome);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const highestScore = sortedPlayers[0]?.score ?? 0;

  const headlineScale = useSharedValue(0.9);
  const headlineOpacity = useSharedValue(0);

  useEffect(() => {
    headlineScale.value = withSpring(1, springs.bouncy);
    headlineOpacity.value = withTiming(1, { duration: durations.fast });
  }, [headlineScale, headlineOpacity]);

  const headlineStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headlineScale.value }],
    opacity: headlineOpacity.value,
  }));

  useEffect(() => {
    if (playMode === 'online' && !isHost && roomId) {
      return subscribeToRoomStatus(roomId, async (room) => {
        if (room.status === 'playing') {
          // A new round has started! Fetch live participants, update players/roles, jump to reveal
          try {
            const participants = await getRoomParticipants(roomId);
            const gamePlayers = participants.map((p) => ({
              id: p.profile_id,
              name: p.display_name,
              score: p.score,
              imposterCount: 0,
            }));
            
            const settings = room.settings as any;
            if (settings.roles) setRoles(settings.roles);
            if (settings.currentWord) {
              setRoundSettings({ ...roundSettings, currentWord: settings.currentWord, currentCategory: settings.currentCategory });
            }
            
            useGameStore.setState({ players: gamePlayers, phase: 'revealing', revealIndex: 0, lastOutcome: null, lastScoreDeltas: {} });
            navigation.replace('RoleReveal');
          } catch (e) {
            // Error handling for participant fetch
          }
        } else if (room.status === 'waiting') {
          // Fallback to lobby if host hits an error and returns to lobby
          navigation.replace('RoomLobby', {
            roomId,
            joinCode,
            isHost: false,
          });
        }
      });
    }
  }, [playMode, isHost, roomId, joinCode, navigation, roundSettings, setRoles, setRoundSettings]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlayAnother = async () => {
    if (playMode === 'online' && roomId && joinCode) {
      if (isHost) {
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
          const participants = await getRoomParticipants(roomId);
          if (participants.length < 3) {
            setErrorMsg("Not enough players remain. Please return to the lobby to invite more.");
            setIsSubmitting(false);
            return;
          }

          const gamePlayers = participants.map((p) => ({
            id: p.profile_id,
            name: p.display_name,
            score: p.score,
            imposterCount: 0,
          }));

          const imposterHistory: Record<string, number> = {};
          gamePlayers.forEach(p => {
            const oldP = players.find(x => x.id === p.id);
            imposterHistory[p.id] = oldP ? oldP.imposterCount : 0;
          });

          const result = assignRoles({
            players: gamePlayers,
            settings: roundSettings,
            imposterHistory
          });

          setRoles(result.roles);
          setRoundSettings({
            ...roundSettings,
            currentWord: result.chosenWord,
            currentCategory: result.categoryName,
          });
          
          result.imposterIds.forEach(id => {
            const p = gamePlayers.find(x => x.id === id);
            if (p) updatePlayer(id, { imposterCount: p.imposterCount + 1 });
          });

          useGameStore.setState({ players: gamePlayers, phase: 'revealing', revealIndex: 0, lastOutcome: null, lastScoreDeltas: {} });
          
          await updateRoomStatus(roomId, 'playing', { 
            roles: result.roles,
            currentWord: result.chosenWord,
            currentCategory: result.categoryName,
            isDiscussing: false,
            revealImposter: false,
          } as any);

          navigation.replace('RoleReveal');
        } catch (e) {
          setIsSubmitting(false);
          setErrorMsg("Failed to start next round. Try returning to the lobby.");
          return;
        }
      }
      return;
    }


    // Pass-and-play logic
    // Build imposter history map
    const imposterHistory: Record<string, number> = {};
    players.forEach(p => { imposterHistory[p.id] = p.imposterCount; });

    // Generate new roles
    const result = assignRoles({
      players,
      settings: roundSettings,
      imposterHistory
    });

    // Update store
    setRoles(result.roles);
    setRoundSettings({
      ...roundSettings,
      currentWord: result.chosenWord,
      currentCategory: result.categoryName,
    });
    
    // Increment imposter counts
    result.imposterIds.forEach(id => {
      const p = players.find(x => x.id === id);
      if (p) {
        updatePlayer(id, { imposterCount: p.imposterCount + 1 });
      }
    });

    // Restart reveal phase
    useGameStore.setState({ phase: 'revealing', revealIndex: 0, lastOutcome: null, lastScoreDeltas: {} });
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }, { name: 'RoleReveal' }] });
  };

  const handleEndSession = () => {
    resetRound();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text variant="labelM" color="neutral">ROUND {roundsPlayed}</Text>
        <Text variant="labelM" color="neutral">SCOREBOARD</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headlineContainer, headlineStyle]}>
          <Text variant="displayXXL" color={headline.color} style={styles.headlineText}>
            {headline.text}
          </Text>
        </Animated.View>

        <View style={styles.scoreboard}>
          {sortedPlayers.map((player, index) => {
            const rank = index + 1;
            const isLeader = player.score === highestScore && highestScore > 0;
            const delta = lastScoreDeltas[player.id] ?? 0;

            return (
              <ScoreRow
                key={player.id}
                player={player}
                rank={rank}
                isLeader={isLeader}
                delta={delta}
                index={index}
              />
            );
          })}
        </View>

        {errorMsg && (
          <Text variant="labelM" color="error" style={{ textAlign: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.lg }}>
            {errorMsg}
          </Text>
        )}

        {/* Return to Lobby Fallback */}
        {playMode === 'online' && isHost && errorMsg && (
          <View style={{ paddingHorizontal: layout.screenPaddingH, marginBottom: spacing.xl }}>
            <Button
              variant="secondary"
              fullWidth
              onPress={async () => {
                if (!roomId) return;
                setIsSubmitting(true);
                try {
                  await updateRoomStatus(roomId, 'waiting');
                } catch (e) {}
                navigation.replace('RoomLobby', { roomId, joinCode, isHost: true });
              }}
            >
              RETURN TO LOBBY
            </Button>
          </View>
        )}

      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {isHost ? (
          <Button variant="primary" fullWidth loading={isSubmitting} onPress={handlePlayAnother}>
            NEXT ROUND
          </Button>
        ) : (
          <Text variant="labelM" color="light.muted" style={{ textAlign: 'center' }}>
            WAITING FOR HOST TO START NEXT ROUND...
          </Text>
        )}
        <Button variant="ghost" fullWidth onPress={handleEndSession}>
          END SESSION
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headlineContainer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  headlineText: {
    textAlign: 'center',
    letterSpacing: -2,
  },
  scoreboard: {
    width: '100%',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: layout.screenPaddingH,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  rankCol: {
    width: 48,
  },
  nameCol: {
    flex: 1,
  },
  nameText: {
    textTransform: 'uppercase',
  },
  scoreCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreNumber: {
    fontFamily: fonts.monoRegular,
    width: 48,
    textAlign: 'right',
  },
  deltaBadge: {
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    backgroundColor: colors.base,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
    gap: spacing.sm,
  },
});
