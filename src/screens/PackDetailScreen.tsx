/**
 * BlendIn — Pack Detail Screen (Phase 4)
 *
 * Shows full pack info: emoji, name, description, word list preview.
 * Install/Uninstall for community packs.
 * Edit button for own custom packs.
 * Vote and Report for community packs.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../lib/haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BUILTIN_PACKS, type WordPack } from '../data/builtinPacks';
import { usePackStore, type CommunityPack } from '../store/packStore';
import { toggleVotePack, reportPack, fetchCommunityPacks, getMyVotedPackIds } from '../lib/packService';
import { colors, spacing, radii, layout, fonts } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Skeleton } from '../components/primitives/Skeleton';
import { Dialog } from '../components/primitives/Dialog';
import { ReportBottomSheet } from '../components/ReportBottomSheet';

type RouteParams = {
  packId: string;
  communityId?: string;
  isCustom?: boolean;
};

export function PackDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { packId, communityId, isCustom } = route.params as RouteParams;

  const {
    customPacks,
    installedCommunityIds,
    installedCommunityPacks,
    installCommunityPack,
    uninstallCommunityPack,
    deleteCustomPack,
    setCommunityPackVote,
  } = usePackStore();

  // Resolve the pack from the various sources
  const resolvedPack: WordPack | CommunityPack | undefined =
    BUILTIN_PACKS.find((p) => p.id === packId) ??
    customPacks.find((p) => p.id === packId) ??
    installedCommunityPacks.find((p) => p.id === packId);

  const [pack, setPack] = useState<WordPack | CommunityPack | undefined>(resolvedPack);
  const [isInstalled, setIsInstalled] = useState(
    communityId ? installedCommunityIds.has(communityId) : false,
  );
  const [voteLoading, setVoteLoading] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const communityPack = pack && 'communityId' in pack ? (pack as CommunityPack) : null;
  const isBuiltin = BUILTIN_PACKS.some((p) => p.id === packId);

  const hasDecoys = pack?.words.some((w) => !!w.decoy_easy?.trim()) ?? false;
  const hasHints = pack?.words.some((w) => !!w.hint_text?.trim()) ?? false;
  const origin = isBuiltin ? 'BUILT-IN' : communityPack ? 'COMMUNITY' : 'LOCAL';

  // If the pack isn't cached locally yet (community pack not yet installed), fetch it
  useEffect(() => {
    if (!pack && communityId) {
      setFetching(true);
      getMyVotedPackIds().then((votedIds) => {
        fetchCommunityPacks({ myVotedIds: votedIds }).then((packs) => {
          const found = packs.find((p) => p.communityId === communityId);
          if (found) setPack(found);
          setFetching(false);
        }).catch(() => setFetching(false));
      });
    }
  }, [pack, communityId]);

  // Keep local pack state in sync with global store changes (e.g., after editing)
  useEffect(() => {
    if (resolvedPack) {
      setPack(resolvedPack);
    }
  }, [resolvedPack]);

  const handleInstall = useCallback(async () => {
    if (!communityPack) return;
    setInstallLoading(true);
    try {
      if (isInstalled) {
        await uninstallCommunityPack(communityPack.communityId);
        setIsInstalled(false);
        Haptics.triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await installCommunityPack(communityPack);
        setIsInstalled(true);
        Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setInstallLoading(false);
    }
  }, [communityPack, isInstalled, installCommunityPack, uninstallCommunityPack]);

  const handleVote = useCallback(async () => {
    if (!communityPack) return;
    setVoteLoading(true);
    try {
      const newCount = await toggleVotePack(communityPack.communityId);
      const voted = !communityPack.hasVoted;
      setCommunityPackVote(communityPack.communityId, voted, newCount);
      setPack({ ...communityPack, hasVoted: voted, voteCount: newCount });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setVoteLoading(false);
    }
  }, [communityPack, setCommunityPackVote]);

  const handleDelete = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteDialogVisible(false);
    await deleteCustomPack(packId);
    navigation.goBack();
  }, [packId, deleteCustomPack, navigation]);

  const handleReport = useCallback(() => {
    if (!communityId) return;
    setReportSheetVisible(true);
  }, [communityId]);

  const submitReport = useCallback(async (reason: string, notes: string) => {
    if (!communityId) return;
    await reportPack(communityId, reason, notes);
  }, [communityId]);

  if (!pack) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text variant="labelM" color="light.muted">BACK</Text>
          </Pressable>
        </View>
        {fetching ? (
          <View style={styles.content}>
            <View style={styles.heroBlock}>
              <Skeleton width="80%" height={40} style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />
              <Skeleton width="100%" height={20} style={{ marginBottom: spacing.sm }} />
              <Skeleton width="60%" height={20} />
              <View style={styles.metaRow}>
                <Skeleton width={80} height={24} borderRadius={radii.pill} />
                <Skeleton width={100} height={24} borderRadius={radii.pill} />
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Skeleton width={80} height={16} />
            </View>
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={i} style={styles.wordRow}>
                <Skeleton width={20} height={16} />
                <Skeleton width={150} height={20} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text variant="labelM" color="neutral">Pack not found.</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="labelM" color="light.muted">BACK</Text>
        </Pressable>
        <Text variant="labelM" color="neutral">PACK DETAIL</Text>
        {isCustom ? (
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text variant="labelM" color="error">DELETE</Text>
          </Pressable>
        ) : communityPack ? (
          <Pressable onPress={handleReport} style={styles.deleteBtn}>
            <Text variant="labelM" color="neutral">REPORT</Text>
          </Pressable>
        ) : (
          <View style={{ width: 64 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero block */}
        <View style={styles.heroBlock}>
          <Text variant="labelS" color="secondary" style={styles.heroPretitle}>SYS.PACK_INFO</Text>
          <Text variant="displayL" color="light" style={styles.heroName}>
            {pack.name.toUpperCase()}
          </Text>
          {pack.description ? (
            <Text variant="bodyM" color="neutral" style={styles.heroDesc}>
              {pack.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text variant="labelS" color="base">[WORDS: {pack.words.length}]</Text>
            </View>
            {communityPack && (
              <>
                <View style={styles.metaChip}>
                  <Text variant="labelS" color="base">[AUTHOR: {communityPack.creatorName.toUpperCase()}]</Text>
                </View>
                <View style={[styles.metaChip, styles.metaChipVote]}>
                  <Text variant="labelS" color="base">[VOTES: {communityPack.voteCount}]</Text>
                </View>
              </>
            )}
            {isBuiltin && (
              <View style={[styles.metaChip, styles.metaChipBuiltin]}>
                <Text variant="labelS" color="base">[BUILT-IN]</Text>
              </View>
            )}
            {pack.is_restricted && (
              <View style={[styles.metaChip, styles.metaChipRestricted]}>
                <Text variant="labelS" color="base">[RESTRICTED]</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pack Stats */}
        <View style={styles.sectionHeader}>
          <Text variant="labelS" color="neutral" style={{ letterSpacing: 2 }}>SYS.DATA // PACK_STATS</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text variant="labelS" color="neutral">TOTAL_WORDS</Text>
            <Text variant="displayM" color="light" style={{ marginTop: spacing.xs }}>{pack.words.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelS" color="neutral">ORIGIN_SYS</Text>
            <Text variant="labelL" color="light" style={{ marginTop: spacing.sm }}>{origin}</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelS" color="neutral">CUSTOM_DECOYS</Text>
            <Text variant="labelL" color={hasDecoys ? 'secondary' : 'neutral'} style={{ marginTop: spacing.sm }}>
              {hasDecoys ? '[ YES ]' : '[ NO ]'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelS" color="neutral">CUSTOM_HINTS</Text>
            <Text variant="labelL" color={hasHints ? 'secondary' : 'neutral'} style={{ marginTop: spacing.sm }}>
              {hasHints ? '[ YES ]' : '[ NO ]'}
            </Text>
          </View>
        </View>

        {/* Word list (Redacted) */}
        <View style={styles.sectionHeader}>
          <Text variant="labelS" color="neutral" style={{ letterSpacing: 2 }}>SYS.DATA // WORD_LIST</Text>
        </View>
        <View style={styles.wordListContainer}>
          <View style={styles.redactedContainer}>
            <Text variant="labelL" color="error" style={{ letterSpacing: 2 }}>
              [ REDACTED ]
            </Text>
            <Text variant="bodyM" color="neutral" style={{ textAlign: 'center', marginTop: spacing.sm }}>
              Words are hidden to prevent spoilers before the game starts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      {!isBuiltin && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          {communityPack && (
            <Button
              variant={communityPack.hasVoted ? 'ghost' : 'secondary'}
              onPress={handleVote}
              loading={voteLoading}
              accessibilityLabel={communityPack.hasVoted ? 'Unvote this pack' : 'Vote for this pack'}
            >
              {communityPack.hasVoted ? '↑ VOTED' : '↑ VOTE'}
            </Button>
          )}
          {communityPack && (
            <Button
              variant={isInstalled ? 'ghost' : 'primary'}
              fullWidth
              loading={installLoading}
              onPress={handleInstall}
              accessibilityLabel={isInstalled ? 'Uninstall this pack' : 'Install this pack'}
            >
              {isInstalled ? 'UNINSTALL' : 'INSTALL'}
            </Button>
          )}
          {isCustom && (
            <Button
              variant="primary"
              fullWidth
              onPress={() =>
                navigation.navigate('CustomPackCreate', { editPackId: packId })
              }
              accessibilityLabel="Edit this custom pack"
            >
              EDIT PACK
            </Button>
          )}
        </View>
      )}

      {/* Report Sheet */}
      <ReportBottomSheet
        visible={reportSheetVisible}
        onClose={() => setReportSheetVisible(false)}
        onSubmit={submitReport}
      />

      <Dialog
        visible={deleteDialogVisible}
        title="SYS.WARN // DELETE_PACK"
        message={`Delete "${pack.name}"? This cannot be undone locally.`}
        primaryAction={{
          label: 'Delete',
          onPress: confirmDelete,
          isDestructive: true,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setDeleteDialogVisible(false),
        }}
        onDismiss={() => setDeleteDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  backBtn: { width: 56, height: 44, justifyContent: 'center' },
  deleteBtn: { height: 44, justifyContent: 'center', paddingLeft: spacing.sm },
  content: { paddingTop: 0 },
  heroBlock: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    borderBottomStyle: 'dashed',
    gap: spacing.sm,
    backgroundColor: colors.base,
  },
  heroPretitle: { letterSpacing: 2 },
  heroName: { letterSpacing: -2, fontSize: 40, lineHeight: 44, marginTop: spacing.xs },
  heroDesc: { maxWidth: '90%', lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  metaChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 2,
    backgroundColor: colors.light,
  },
  metaChipVote: { backgroundColor: colors.accent },
  metaChipBuiltin: { backgroundColor: colors.secondary },
  metaChipRestricted: { backgroundColor: colors.error },
  sectionHeader: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    backgroundColor: colors['base.elevated'],
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.base,
  },
  statBox: {
    width: '50%',
    padding: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors['neutral.border'],
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    backgroundColor: colors['base.elevated'],
  },
  wordListContainer: {
    paddingBottom: spacing.xxl,
  },
  redactedContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['base.elevated'],
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    backgroundColor: colors.base,
    gap: spacing.md,
  },
  wordIndex: { fontFamily: fonts.monoMedium, width: 36, letterSpacing: 1 },
  wordText: {},
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
    backgroundColor: colors.base,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
