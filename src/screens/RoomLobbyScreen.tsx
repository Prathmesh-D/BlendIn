/**
 * BlendIn — Room Lobby Screen (Phase 3)
 *
 * Shown after creating or joining a room. Displays the live participant list
 * with Supabase Realtime subscriptions. The host can start the game once all
 * players are ready.
 *
 * Design:
 *  - Top: room code displayed large (for sharing)
 *  - Middle: live data-grid of participants with ready indicators
 *  - Bottom: "START GAME" (host only) or "I'M READY" toggle (joiners)
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Share,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  Layout
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getRoomParticipants,
  updateRoomStatus,
  setParticipantReady,
  leaveRoom,
  subscribeToParticipants,
  subscribeToRoomStatus,
} from '../lib/roomService';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import * as Haptics from '../lib/haptics';
import type { RoomParticipant } from '../lib/database.types';
import { assignRoles } from '../engine/roleAssignment';
import { colors, spacing, radii, layout, fonts, springs } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import QRCode from 'react-native-qrcode-svg';

type RouteParams = {
  roomId: string;
  joinCode: string;
  isHost: boolean;
};

// ─── Participant row ──────────────────────────────────────────────────────────

function ParticipantRow({
  participant,
  isMe,
  index,
}: {
  participant: RoomParticipant;
  isMe: boolean;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      layout={Layout.springify()}
      style={styles.participantRow}
    >
      <View style={styles.participantLeft}>
        <Text variant="labelL" color="neutral" style={styles.participantIndex}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text variant="labelL" color="light" style={styles.participantName}>
          {participant.display_name}
          {isMe ? '  (you)' : ''}
        </Text>
      </View>
      <View style={[styles.readyDot, participant.is_ready && styles.readyDotOn]} />
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function RoomLobbyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { roomId, joinCode, isHost } = route.params as RouteParams;
  const { user } = useAuthStore();
  const { setPlayers, setRoundSettings, setRoles, roundSettings } = useGameStore();
  const { startSession } = useSessionStore();

  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isMeReady, setIsMeReady] = useState(false);
  const participantsRef = useRef<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myProfileId = user?.id ?? '';
  const allReady = participants.length >= 2 && participants.every((p) => p.is_ready);

  // ── Load initial participants + subscribe to live updates ─────────────────
  useEffect(() => {
    let mounted = true;

    getRoomParticipants(roomId).then((data) => {
      if (mounted) {
        setParticipants(data);
        participantsRef.current = data;
        const me = data.find((p) => p.profile_id === myProfileId);
        if (me) setIsMeReady(me.is_ready);
      }
    });

    const unsubParticipants = subscribeToParticipants(roomId, (updated) => {
      if (!mounted) return;
      setParticipants(updated);
      participantsRef.current = updated;
      const me = updated.find((p) => p.profile_id === myProfileId);
      if (me) setIsMeReady(me.is_ready);
    });

    // Host: subscribe to room status — triggered when host hits "Start Game"
    // Joiner: sync roles from settings and start game
    const unsubRoom = subscribeToRoomStatus(roomId, (room) => {
      if (!mounted) return;
      if (room.status === 'playing' && !isHost) {
        const settings = room.settings as any;
        if (settings.roles) setRoles(settings.roles);
        if (settings.currentWord) setRoundSettings({ ...roundSettings, currentWord: settings.currentWord, currentCategory: settings.currentCategory });
        
        const gamePlayers = participantsRef.current.map((p) => ({
          id: p.profile_id,
          name: p.display_name,
          score: p.score,
          imposterCount: 0,
        }));
        setPlayers(gamePlayers);
        
        startSession();
        useGameStore.setState({ phase: 'revealing', revealIndex: 0 });
        navigation.replace('RoleReveal');
      }
    });

    return () => {
      mounted = false;
      unsubParticipants();
      unsubRoom();
    };
  }, [roomId, myProfileId, isHost, navigation]);

  // ── Toggle ready state (joiners) ──────────────────────────────────────────
  const handleToggleReady = useCallback(async () => {
    const next = !isMeReady;
    setIsMeReady(next);
    Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);

    try {
      await setParticipantReady(roomId, myProfileId, next);
    } catch (err: any) {
      setIsMeReady(!next); // Rollback on failure
      setError(err.message);
    }
  }, [isMeReady, roomId, myProfileId]);

  const handleStartGame = useCallback(async () => {
    if (!isHost) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Populate the local game store with participants as players
      const gamePlayers = participants.map((p) => ({
        id: p.profile_id,
        name: p.display_name,
        score: p.score,
        imposterCount: 0,
      }));
      setPlayers(gamePlayers);

      // 2. Assign Roles locally (temporary fix until Edge Function is ready)
      const result = assignRoles({
        players: gamePlayers,
        settings: roundSettings,
        imposterHistory: {}
      });
      setRoles(result.roles);
      setRoundSettings({ ...roundSettings, currentWord: result.chosenWord, currentCategory: result.categoryName });
      
      startSession();
      useGameStore.setState({ phase: 'revealing', revealIndex: 0 });

      // 3. Update room status and broadcast roles to joiners
      await updateRoomStatus(roomId, 'playing', {
        roles: result.roles,
        currentWord: result.chosenWord,
        currentCategory: result.categoryName
      });

      Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
      navigation.replace('RoleReveal');
    } catch (err: any) {
      setError(err.message ?? 'Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isHost, roomId, participants, setPlayers, setRoles, setRoundSettings, roundSettings, navigation]);

  // ── Share room code ───────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    Share.share({
      message: `Join my BlendIn game! Code: ${joinCode}`,
    });
  }, [joinCode]);

  // ── Leave room ────────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    try {
      await leaveRoom(roomId, myProfileId);
    } catch {}
    navigation.goBack();
  }, [roomId, myProfileId, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleLeave} style={styles.backBtn}>
          <Text variant="labelM" color="light.muted">LEAVE</Text>
        </Pressable>
        <Text variant="labelM" color="neutral">LOBBY</Text>
        <View style={{ width: 56 }} />
      </View>

      {/* Join Code hero */}
      <View style={styles.codeSection}>
        <Text variant="labelS" color="neutral" style={styles.codeEyebrow}>
          ROOM CODE
        </Text>
        <Pressable onPress={handleShare} accessibilityRole="button" accessibilityLabel="Tap to share room code">
          <Text variant="displayXXL" color="light" style={styles.codeDisplay}>
            {joinCode}
          </Text>
        </Pressable>
        {isHost && (
          <View style={styles.qrContainer}>
            <QRCode
              value={joinCode}
              size={140}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Live participant list */}
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text variant="labelS" color="neutral" style={{ letterSpacing: 2 }}>
            PLAYERS ({participants.length})
          </Text>
          <Text variant="labelS" color="neutral" style={{ letterSpacing: 2 }}>
            READY
          </Text>
        </View>

        {participants.map((p, i) => (
          <ParticipantRow
            key={p.profile_id}
            participant={p}
            isMe={p.profile_id === myProfileId}
            index={i}
          />
        ))}

        {participants.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="labelM" color="neutral">Waiting for players to join…</Text>
          </View>
        )}

        {participants.length === 1 && (
          <View style={styles.emptyState}>
            <Text variant="labelM" color="neutral">Need at least 2 players to start</Text>
          </View>
        )}
      </ScrollView>

      {error && (
        <Text variant="labelM" color="error" style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {isHost ? (
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleStartGame}
            accessibilityLabel="Start the game for all players"
          >
            START GAME{allReady ? ' ✓' : ` (${participants.filter((p) => p.is_ready).length}/${participants.length})`}
          </Button>
        ) : (
          <Button
            variant={isMeReady ? 'ghost' : 'primary'}
            fullWidth
            onPress={handleToggleReady}
            accessibilityLabel={isMeReady ? 'Mark yourself as not ready' : 'Mark yourself as ready'}
          >
            {isMeReady ? 'NOT READY' : "I'M READY"}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  backBtn: {
    width: 56,
    height: 44,
    justifyContent: 'center',
  },
  codeSection: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  codeEyebrow: {
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  codeDisplay: {
    letterSpacing: layout.letterSpacingDisplay,
    marginVertical: spacing.sm,
  },
  qrContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors['neutral.border'],
  },
  listScroll: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  participantIndex: {
    fontFamily: fonts.monoRegular,
    color: colors.neutral,
    width: 24,
  },
  participantName: {
    textTransform: 'uppercase',
  },
  readyDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    backgroundColor: 'transparent',
  },
  readyDotOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.sm,
  },
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
});
