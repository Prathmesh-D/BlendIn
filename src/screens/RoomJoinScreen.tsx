/**
 * BlendIn — Room Join Screen (Phase 3)
 *
 * Players enter the 6-char room code to join a host's game.
 * Calls joinRoom() RPC → navigates to RoomLobbyScreen on success.
 *
 * Design: Full-screen with the code input as the hero element.
 * Bold monospace display for the code characters (matches the "join code"
 * label system from the design tokens).
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from '../lib/haptics';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { joinRoom } from '../lib/roomService';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, radii, layout, fonts, springs } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Dialog } from '../components/primitives/Dialog';

const CODE_LENGTH = 6;

export function RoomJoinScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const setGameContext = useGameStore((s) => s.setGameContext);
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR Scanning
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Scanner Animation
  const scanLineY = useSharedValue(0);
  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  useEffect(() => {
    if (isScanning) {
      scanLineY.value = withRepeat(
        withTiming(246, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scanLineY.value = 0;
    }
  }, [isScanning, scanLineY]);

  // Shake animation on error
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    Haptics.triggerNotification(Haptics.NotificationFeedbackType.Error);
    shakeX.value = withSequence(
      withSpring(-12, springs.snappy),
      withSpring(12, springs.snappy),
      withSpring(-8, springs.snappy),
      withSpring(8, springs.snappy),
      withSpring(0, springs.snappy),
    );
  }, [shakeX]);

  const handleCodeChange = useCallback((val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (error) setError(null);
  }, [error]);

  const handleJoin = useCallback(async () => {
    if (code.length < CODE_LENGTH) {
      setError('Enter all 6 characters');
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const room = await joinRoom(code);
      Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
      setGameContext({ playMode: 'online', isHost: false, roomId: room.id, joinCode: room.code });
      navigation.replace('RoomLobby', {
        roomId: room.id,
        joinCode: room.code,
        isHost: false,
      });
    } catch (err: any) {
      let friendlyMessage = err.message ?? 'Could not find that room. Check the code and try again.';
      if (friendlyMessage.includes('fetch') || friendlyMessage.includes('Network') || friendlyMessage.includes('UnknownHostException')) {
        friendlyMessage = 'Network Error. Please check your internet connection and try again.';
      }
      setError(friendlyMessage);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }, [code, navigation, triggerShake]);

  const handleScanCode = useCallback(async (scanned: string) => {
    setIsScanning(false);
    
    // Quick validate
    const cleaned = scanned.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    if (cleaned.length === CODE_LENGTH) {
      setCode(cleaned);
      setLoading(true);
      try {
        const room = await joinRoom(cleaned);
        Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
        setGameContext({ playMode: 'online', isHost: false, roomId: room.id, joinCode: room.code });
        navigation.replace('RoomLobby', {
          roomId: room.id,
          joinCode: room.code,
          isHost: false,
        });
      } catch (err: any) {
        let friendlyMessage = err.message ?? 'Could not find that room. Check the code and try again.';
        if (friendlyMessage.includes('fetch') || friendlyMessage.includes('Network') || friendlyMessage.includes('UnknownHostException')) {
          friendlyMessage = 'Network Error. Please check your internet connection and try again.';
        }
        setError(friendlyMessage);
        triggerShake();
        setLoading(false);
      }
    } else {
      setError('Invalid QR code format. Room codes must be exactly 6 characters.');
      triggerShake();
    }
  }, [navigation, triggerShake]);

  const openScanner = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setIsScanning(true);
  }, [permission, requestPermission]);

  // Split code into 6 display boxes
  const codeChars = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="labelM" color="light.muted">BACK</Text>
        </Pressable>
        <Text variant="labelM" color="neutral">JOIN GAME</Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.heroSection}>
          <Text variant="displayXXL" color="light" style={styles.title}>
            ENTER CODE
          </Text>
          <Text variant="labelM" color="light.muted" style={styles.subtitle}>
            Ask the host for their 6-character room code
          </Text>
        </View>

        {/* Code boxes */}
        <Animated.View entering={FadeInDown.springify()} style={[styles.codeRow, shakeStyle]}>
          {codeChars.map((char, i) => (
            <Pressable
              key={i}
              onPress={() => inputRef.current?.focus()}
              style={[
                styles.codeBox,
                i < code.length && styles.codeBoxFilled,
                i === code.length && styles.codeBoxActive,
                !!error && styles.codeBoxError,
              ]}
            >
              <Text variant="displayL" color={char ? 'light' : 'neutral'} style={styles.codeChar}>
                {char || '·'}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Hidden actual input */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          maxLength={CODE_LENGTH}
          autoCapitalize="characters"
          autoCorrect={false}
          keyboardType="default"
          style={styles.hiddenInput}
          onSubmitEditing={handleJoin}
          returnKeyType="go"
        />

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.actionColumn}>
          <Button
            variant="primary"
            style={styles.actionBtn}
            onPress={handleJoin}
            loading={loading}
            disabled={code.length < CODE_LENGTH}
          >
            JOIN GAME
          </Button>
          <Button
            variant="secondary"
            style={styles.actionBtn}
            onPress={openScanner}
          >
            SCAN QR
          </Button>
        </Animated.View>
      </KeyboardAvoidingView>

      <Modal visible={isScanning} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable onPress={() => setIsScanning(false)} style={styles.backBtn}>
              <Text variant="labelM" color="light.muted">CANCEL</Text>
            </Pressable>
            <Text variant="labelM" color="light">SCAN CODE</Text>
            <View style={{ width: 48 }} />
          </View>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            {isScanning && (
              <CameraView 
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => handleScanCode(data)}
              />
            )}
            {/* Animated framing overlay */}
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
              <View style={{ width: 250, height: 250, borderColor: colors.primary, borderWidth: 2, borderRadius: radii.md, overflow: 'hidden' }}>
                <Animated.View style={[{ width: '100%', height: 2, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 }, scanLineStyle]} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Error Dialog */}
      <Dialog
        visible={!!error}
        title="SYS.ERROR // JOIN_FAILED"
        message={error ?? ''}
        primaryAction={{
          label: 'Acknowledge',
          onPress: () => setError(null),
        }}
        onDismiss={() => setError(null)}
      />
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
    width: 48,
    height: 44,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  heroSection: {
    gap: spacing.sm,
  },
  title: {
    letterSpacing: -3,
  },
  subtitle: {
    maxWidth: '75%',
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 0.8,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['base.elevated'],
  },
  codeBoxFilled: {
    borderColor: colors.secondary,
    backgroundColor: colors['secondary.muted'],
  },
  codeBoxActive: {
    borderColor: colors.light,
  },
  codeBoxError: {
    borderColor: colors.error,
  },
  codeChar: {
    fontFamily: fonts.monoRegular,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  actionColumn: {
    marginTop: spacing.xxxl,
    gap: spacing.md,
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  },
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
});
