/**
 * BlendIn — Game Setup Screen (P1.5 Redesign)
 *
 * Strict 1px grid layout. Technical cockpit feel.
 * Horizontal rows separated by borders. Pill toggles inside.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGameStore, type ImposterVariant } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';
import { usePackStore } from '../store/packStore';
import { BUILTIN_PACKS } from '../data/builtinPacks';
import { assignRoles } from '../engine/roleAssignment';
import { createRoom } from '../lib/roomService';
import { colors, spacing, radii, layout, fonts } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Surface } from '../components/primitives/Surface';
import { Dialog } from '../components/primitives/Dialog';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  // Legacy layout animation enabled, but we rely on Reanimated for new arch
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

type Difficulty = 'easy' | 'medium' | 'hard';

const VARIANT_OPTIONS: { label: string; value: ImposterVariant, description: string }[] = [
  { label: 'Classic Pair', value: 'classic_medium', description: 'Imposters get a similar but different word.' },
  { label: 'Hint Imposter', value: 'hint', description: 'Imposters receive a scrambled or partial version of the word.' },
  { label: 'Category Only', value: 'category_only', description: 'Imposters only know the category (e.g., "Animals").' },
  { label: 'Blank Imposter', value: 'blank', description: 'Imposters get absolutely nothing.' },
];

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty; description: string }[] = [
  { label: 'Easy', value: 'easy', description: 'Closely related word' },
  { label: 'Medium', value: 'medium', description: 'Somewhat related' },
  { label: 'Hard', value: 'hard', description: 'Loosely related' },
];

function variantWithDifficulty(base: Difficulty): ImposterVariant {
  return `classic_${base}` as ImposterVariant;
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: string }) {
  return (
    <View style={sectionStyles.container}>
      <Text variant="labelS" color="neutral" style={sectionStyles.text}>
        {children.toUpperCase()}
      </Text>
    </View>
  );
}
const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.base,
  },
  text: { letterSpacing: 2 },
});

// ─── Pack Card ─────────────────────────────────────────────────────────────────
function PackCard({
  pack,
  selected,
  onToggle,
}: {
  pack: (typeof BUILTIN_PACKS)[0];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[packStyles.card, selected && packStyles.cardSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={packStyles.content}>
        <Text variant="displayL" color={selected ? 'base' : 'light'} style={packStyles.name}>
          {pack.name}
        </Text>
        <Text variant="labelS" color={selected ? 'base' : 'light.muted'}>
          {pack.words.length} words
        </Text>
      </View>
      {selected && (
        <View style={packStyles.checkBadge}>
          <Text variant="labelS" color="base">[ SELECTED ]</Text>
        </View>
      )}
    </Pressable>
  );
}

const packStyles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    backgroundColor: colors['base.elevated'],
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cardSelected: {
    backgroundColor: colors.light,
    borderColor: colors.light,
  },
  content: {
    gap: spacing.xs,
  },
  checkBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  name: { letterSpacing: -1 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export function GameSetupScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {
    setPlayers,
    setRoundSettings,
    setRoles,
    setPhase,
    setGameContext,
  } = useGameStore();
  const { imposterHistory, startSession, recordImposters } = useSessionStore();

  const [playMode, setPlayMode] = useState<'local' | 'online'>('local');
  const [playerCount, setPlayerCount] = useState(4);
  const { user } = useAuthStore();
  const { getAllAvailablePacks, isHydrated, hydrate } = usePackStore();
  const availablePacks = getAllAvailablePacks();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, []);

  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => `Player ${i + 1}`),
  );
  const [selectedPacks, setSelectedPacks] = useState<Set<string>>(
    new Set(['builtin-food', 'builtin-movies']),
  );
  const [selectedVariant, setSelectedVariant] = useState<ImposterVariant>('classic_medium');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [imposterCount, setImposterCount] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allPacksModalVisible, setAllPacksModalVisible] = useState(false);
  const [paranoiaMode, setParanoiaMode] = useState(false);

  const hasRestrictedPack = Array.from(selectedPacks).some(
    (id) => availablePacks.find((p) => p.id === id)?.is_restricted
  );

  useEffect(() => {
    if (hasRestrictedPack && (selectedVariant.startsWith('classic_') || selectedVariant === 'hint' || selectedVariant === 'mirror')) {
      setSelectedVariant('category_only');
    }
  }, [hasRestrictedPack, selectedVariant]);

  const isClassicPair = selectedVariant.startsWith('classic_');
  const showImposterCountToggle = playerCount >= 6;

  const changePlayerCount = useCallback((delta: number) => {
    setPlayerCount((prev) => {
      const next = Math.min(Math.max(prev + delta, 3), 12);
      setPlayerNames((names) => {
        if (next > names.length) {
          return [...names, ...Array.from({ length: next - names.length }, (_, i) => `Player ${names.length + i + 1}`)];
        }
        return names.slice(0, next);
      });
      // Auto-clamp imposter count if the new player count lowers the max limit
      const nextMaxImposters = Math.max(1, Math.floor(next / 3));
      if (imposterCount > nextMaxImposters) {
        setImposterCount(nextMaxImposters);
      }
      return next;
    });
  }, [imposterCount]);

  const selectVariant = useCallback((variant: ImposterVariant) => {
    // We now use Reanimated, so we don't strictly need LayoutAnimation, 
    // but we can leave it for platforms where it might still work globally.
    try {
      LayoutAnimation.configureNext({
        duration: 250,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'spring', springDamping: 0.7 },
      });
    } catch(e) {}
    setSelectedVariant(variant);
  }, []);

  const handleStart = useCallback(async () => {
    if (selectedPacks.size === 0) {
      setError('Select at least one word pack.');
      return;
    }
    setError(null);
    setLoading(true);

    const finalVariant = isClassicPair ? variantWithDifficulty(difficulty) : selectedVariant;
    const settings = {
      variant: finalVariant,
      imposterCount: imposterCount,
      selectedPackIds: Array.from(selectedPacks),
      paranoiaMode: paranoiaMode,
    };

    try {
      if (playMode === 'online') {
        // Multi-device: create a Supabase room with these settings
        if (!user) {
          setError('Not signed in. Check your internet connection and try again.');
          return;
        }
        setRoundSettings(settings);
        const roomResult = await createRoom(settings);
        setGameContext({ playMode: 'online', isHost: true, roomId: roomResult.id, joinCode: roomResult.code });
        navigation.navigate('RoomLobby', {
          roomId: roomResult.id,
          joinCode: roomResult.code,
          isHost: true,
        });
      } else {
        // Pass-and-play: assign roles locally and start immediately
        setGameContext({ playMode: 'local', isHost: true, roomId: null });
        const players = playerNames.slice(0, playerCount).map((name, i) => ({
          id: `player-${i}`,
          name: name.trim() || `Player ${i + 1}`,
          score: 0,
          imposterCount: 0,
        }));

        const result = assignRoles({ players, settings, imposterHistory });
        startSession();
        setPlayers(players);
        setRoundSettings({ ...settings, currentWord: result.chosenWord, currentCategory: result.categoryName });
        setRoles(result.roles);
        recordImposters(result.imposterIds);
        setPhase('revealing');
        navigation.navigate('RoleReveal');
      }
    } catch (e: any) {
      let friendlyMessage = e.message ?? 'Something went wrong.';
      if (friendlyMessage.includes('fetch') || friendlyMessage.includes('Network') || friendlyMessage.includes('UnknownHostException')) {
        friendlyMessage = 'Network Error. Please check your internet connection and try again.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPacks, playerCount, playerNames, isClassicPair,
    difficulty, selectedVariant, imposterCount, paranoiaMode,
    imposterHistory, startSession, setPlayers, setRoundSettings,
    setRoles, recordImposters, setPhase, navigation, playMode, user,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.headerBlock}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text variant="displayXL" color="light" style={{ letterSpacing: -2 }}>
              SETUP
            </Text>
            <Text variant="labelS" color="secondary" style={{ letterSpacing: 2, marginTop: spacing.xs }}>
              SYS.INIT // ROUND
            </Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: spacing.md, margin: -spacing.md }}>
            <Text variant="labelM" color="light.muted">CANCEL</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: layout.bottomBarHeight + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Play Mode */}
        <SectionHeader>Play Mode</SectionHeader>
        <View style={styles.gridRow}>
          <Pressable
            style={[styles.modePill, playMode === 'local' && styles.modeActive]}
            onPress={() => setPlayMode('local')}
            accessibilityRole="radio"
            accessibilityState={{ checked: playMode === 'local' }}
          >
            <Text variant="labelM" color={playMode === 'local' ? 'base' : 'neutral'}>PASS & PLAY</Text>
          </Pressable>
          <Pressable
            style={[styles.modePill, playMode === 'online' && styles.modeActive]}
            onPress={() => setPlayMode('online')}
            accessibilityRole="radio"
            accessibilityState={{ checked: playMode === 'online' }}
          >
            <Text variant="labelM" color={playMode === 'online' ? 'base' : 'neutral'}>MULTI-DEVICE</Text>
          </Pressable>
        </View>

        {/* Online: player names not needed (players join on their own devices) */}
        {playMode === 'online' && (
          <View style={styles.onlineNote}>
            <Text variant="labelS" color="secondary">↗ Players join using the room code</Text>
          </View>
        )}

        {/* Players (pass-and-play only) */}
        {playMode === 'local' && (
          <>
            <SectionHeader>Players</SectionHeader>
            <View style={styles.gridRow}>
          <Pressable
            style={[styles.stepperBtn, playerCount <= 3 && styles.stepperDisabled]}
            onPress={() => changePlayerCount(-1)}
            disabled={playerCount <= 3}
          >
            <Text variant="displayL" color="light">−</Text>
          </Pressable>
          <View style={styles.playerCountWrap}>
            <Text variant="displayXL" color="light">{playerCount}</Text>
          </View>
          <Pressable
            style={[styles.stepperBtn, playerCount >= 12 && styles.stepperDisabled]}
            onPress={() => changePlayerCount(1)}
            disabled={playerCount >= 12}
          >
            <Text variant="displayL" color="light">+</Text>
          </Pressable>
        </View>

        <View style={styles.namesGrid}>
          {Array.from({ length: playerCount }).map((_, i) => (
            <Animated.View key={i} layout={Layout.springify()} entering={FadeInDown.springify()} style={styles.nameInputWrap}>
              <Text variant="labelS" color="neutral" style={styles.namePrefix}>
                {(i + 1).toString().padStart(2, '0')}
              </Text>
              <TextInput
                value={playerNames[i] ?? ''}
                onChangeText={(val) =>
                  setPlayerNames((prev) => {
                    const next = [...prev];
                    next[i] = val;
                    return next;
                  })
                }
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={colors['light.muted']}
                style={styles.nameInput}
                maxLength={20}
                returnKeyType="next"
                keyboardAppearance="dark"
              />
            </Animated.View>
          ))}
        </View>
        
        {showImposterCountToggle && (
          <Animated.View 
            layout={Layout.springify().damping(14).mass(0.8)} 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            style={{ paddingHorizontal: layout.screenPaddingH, paddingBottom: spacing.lg, paddingTop: spacing.md }}
          >
            <View style={[styles.inlineDifficultyGrid, { flexWrap: 'wrap' }]}>
              {Array.from({ length: Math.max(1, Math.floor(playerCount / 3)) }).map((_, i) => {
                const count = i + 1;
                return (
                  <Pressable
                    key={count}
                    style={[
                      styles.diffChip, 
                      imposterCount === count && styles.diffChipActive,
                      { minWidth: '45%' }
                    ]}
                    onPress={() => setImposterCount(count)}
                  >
                    <Text variant="labelM" color={imposterCount === count ? 'base' : 'neutral'}>
                      {count} {count === 1 ? 'IMPOSTER' : 'IMPOSTERS'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}
          </>
        )}

        {/* Packs */}
        <SectionHeader>Word Packs</SectionHeader>
        <View style={styles.packGrid}>
          {availablePacks.slice(0, 4).map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              selected={selectedPacks.has(pack.id)}
              onToggle={() => {
                setSelectedPacks((prev) => {
                  const next = new Set(prev);
                  next.has(pack.id) ? next.delete(pack.id) : next.add(pack.id);
                  return next;
                });
              }}
            />
          ))}
        </View>
        {availablePacks.length > 4 && (
          <View style={styles.viewAllWrap}>
            <Button variant="secondary" onPress={() => setAllPacksModalVisible(true)}>
              [ VIEW ALL PACKS ({availablePacks.length}) ]
            </Button>
          </View>
        )}

        {/* Imposter Variant */}
        <SectionHeader>Variant</SectionHeader>
        {hasRestrictedPack && (
          <View style={styles.restrictedWarning}>
            <Text variant="labelS" color="error">
              {'> SYS.WARN: ONE OR MORE SELECTED PACKS RESTRICTS GAMEPLAY TO CATEGORY/BLANK ONLY'}
            </Text>
          </View>
        )}
        <View style={styles.variantStack}>
          {VARIANT_OPTIONS.map((opt) => {
            const isBase = isClassicPair && opt.value.startsWith('classic');
            const active = opt.value === selectedVariant || (isBase && opt.value === 'classic_medium');
            
            const disabled = hasRestrictedPack && (opt.value.startsWith('classic_') || opt.value === 'hint');

            return (
              <Animated.View key={opt.value} layout={Layout.springify().damping(14).mass(0.8)}>
                <Pressable
                  onPress={() => !disabled && selectVariant(opt.value)}
                  style={[
                    styles.variantRow,
                    active && styles.variantRowActive,
                    disabled && styles.variantRowDisabled
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text variant="labelL" color={active ? 'base' : disabled ? 'neutral' : 'light'}>
                      {opt.label.toUpperCase()}
                    </Text>
                    <Text variant="bodyS" color={active ? 'base' : disabled ? 'neutral.muted' : 'neutral'} style={{ marginTop: 2 }}>
                      {opt.description}
                    </Text>
                  </View>
                  {active && <Text variant="labelS" color="base">[ SELECTED ]</Text>}
                </Pressable>

                {active && isBase && (
                  <Animated.View 
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.inlineDifficultyGrid}
                  >
                    {DIFFICULTY_OPTIONS.map((diffOpt) => (
                      <Pressable
                        key={diffOpt.value}
                        style={[styles.diffChip, difficulty === diffOpt.value && styles.diffChipActive]}
                        onPress={() => setDifficulty(diffOpt.value)}
                      >
                        <Text variant="labelM" color={difficulty === diffOpt.value ? 'base' : 'light'}>
                          {diffOpt.label.toUpperCase()}
                        </Text>
                        <Text variant="bodyS" color={difficulty === diffOpt.value ? 'base' : 'neutral'} style={{ marginTop: 2 }}>{diffOpt.description}</Text>
                      </Pressable>
                    ))}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>



        {/* ── Modifiers ──────────────────────────────────────────────────────── */}
        <SectionHeader>Modifiers</SectionHeader>
        <View style={styles.variantStack}>
          <Pressable
            onPress={() => setParanoiaMode(!paranoiaMode)}
            style={[
              styles.variantRow,
              paranoiaMode && styles.variantRowActive
            ]}
          >
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text variant="labelL" color={paranoiaMode ? 'base' : 'light'}>
                PARANOIA MODE
              </Text>
              <Text variant="bodyS" color={paranoiaMode ? 'base' : 'neutral'} style={{ marginTop: 2 }}>
                10% chance for an ALL-IMPOSTER round. Total chaos.
              </Text>
            </View>
            <Text variant="labelS" color={paranoiaMode ? 'base' : 'neutral'}>
              [ {paranoiaMode ? 'ON' : 'OFF'} ]
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button variant="primary" fullWidth loading={loading} onPress={handleStart}>
          {playMode === 'online' ? 'CONTINUE TO LOBBY' : 'START ROUND'}
        </Button>
      </View>

      {/* All Packs Modal */}
      <Modal visible={allPacksModalVisible} animationType="slide">
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.headerRow}>
            <Text variant="displayM" color="light">ALL PACKS</Text>
            <Pressable onPress={() => setAllPacksModalVisible(false)} style={styles.closeBtn}>
              <Text variant="labelM" color="light.muted">DONE</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={[styles.packGrid, { paddingTop: spacing.md }]}>
            {availablePacks.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                selected={selectedPacks.has(pack.id)}
                onToggle={() => {
                  setSelectedPacks((prev) => {
                    const next = new Set(prev);
                    next.has(pack.id) ? next.delete(pack.id) : next.add(pack.id);
                    return next;
                  });
                }}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Error Dialog */}
      <Dialog
        visible={!!error}
        title="SYS.ERROR // SETUP_FAILED"
        message={error ?? ''}
        secondaryAction={{
          label: 'Acknowledge',
          onPress: () => setError(null),
        }}
        onDismiss={() => setError(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  headerBlock: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    marginBottom: spacing.md,
  },
  headerRow: { // Kept for modal
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  closeBtn: { height: 44, justifyContent: 'center' },
  content: { paddingTop: 0 },
  
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  
  modePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  modeActive: {
    backgroundColor: colors.light,
    borderColor: colors.light,
  },
  modeDisabled: { opacity: 0.4 },

  onlineNote: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },

  stepperBtn: {
    width: 64,
    height: 64,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: { opacity: 0.3, borderColor: colors.neutral },
  playerCountWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  namesGrid: {
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  nameInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    paddingHorizontal: layout.screenPaddingH,
  },
  namePrefix: { width: 32 },
  nameInput: {
    flex: 1,
    height: 56,
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.light,
  },

  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
  },
  viewAllWrap: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xl,
  },

  variantStack: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    backgroundColor: colors['base.elevated'],
  },
  variantRowActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  variantRowDisabled: {
    opacity: 0.3,
    borderColor: colors.neutral,
    textDecorationLine: 'line-through',
  },
  restrictedWarning: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
  },

  inlineDifficultyGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  diffChip: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors['base.elevated'],
  },
  diffChipActive: {
    backgroundColor: colors.light,
    borderColor: colors.light,
  },

  errorText: { textAlign: 'center', margin: spacing.lg },
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    backgroundColor: colors.base,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
});
