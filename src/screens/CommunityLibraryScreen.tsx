/**
 * BlendIn — Community Library Screen (Phase 4)
 *
 * Three tabs: Built-in | Community | My Packs
 * Search bar filters across the active tab.
 * Tap any pack → PackDetailScreen.
 *
 * Design: consistent with the "technical cockpit" aesthetic.
 * Data grids of pack cards, sharp containers, pill tab selectors.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BUILTIN_PACKS, type WordPack } from '../data/builtinPacks';
import { usePackStore, type CommunityPack } from '../store/packStore';
import { fetchCommunityPacks, fetchMyPacks, getMyVotedPackIds } from '../lib/packService';
import { colors, spacing, radii, layout, fonts } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Skeleton } from '../components/primitives/Skeleton';

type Tab = 'builtin' | 'community' | 'mine';

// ─── Pack Card ────────────────────────────────────────────────────────────────

function PackCard({
  pack,
  index,
  isBuiltin,
  onPress,
}: {
  pack: WordPack | CommunityPack;
  index: number;
  isBuiltin?: boolean;
  onPress: () => void;
}) {
  const communityPack = 'communityId' in pack ? (pack as CommunityPack) : null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${pack.name} word pack, ${pack.words.length} words`}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardMeta}>
            <Text variant="labelL" color="light" style={styles.cardName}>
              {pack.name}
            </Text>
            <Text variant="labelS" color="neutral" numberOfLines={1}>
              [{pack.words.length}] {pack.description || (communityPack ? `By ${communityPack.creatorName}` : 'No description')}
            </Text>
          </View>
        </View>
        {communityPack && (
          <View style={styles.voteTag}>
            <Text variant="labelS" color="neutral" style={styles.voteText}>
              ↑ {communityPack.voteCount}
            </Text>
          </View>
        )}
        {isBuiltin && (
          <View style={styles.builtinTag}>
            <Text variant="labelS" color="secondary">BUILT-IN</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function CommunityLibraryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { customPacks, isHydrated, hydrate } = usePackStore();

  const [activeTab, setActiveTab] = useState<Tab>('community');
  const [search, setSearch] = useState('');
  const [communityPacks, setCommunityPacks] = useState<CommunityPack[]>([]);
  const [myPublishedPacks, setMyPublishedPacks] = useState<CommunityPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Hydrate pack store on mount
  useEffect(() => {
    if (!isHydrated) hydrate();
  }, []);

  // Fetch packs when tab changes or screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'community') loadCommunityPacks();
      if (activeTab === 'mine') loadMyPacks();
    }, [activeTab])
  );

  const loadCommunityPacks = useCallback(async () => {
    setLoading(true);
    try {
      const votedIds = await getMyVotedPackIds();
      const packs = await fetchCommunityPacks({ search: search || undefined, myVotedIds: votedIds });
      setCommunityPacks(packs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadMyPacks = useCallback(async () => {
    setLoading(true);
    try {
      const packs = await fetchMyPacks();
      setMyPublishedPacks(packs);
    } catch {
      // Not connected — fall back to local custom packs only
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'community') await loadCommunityPacks();
    if (activeTab === 'mine') await loadMyPacks();
    setRefreshing(false);
  }, [activeTab, loadCommunityPacks, loadMyPacks]);

  // Filtered data per tab
  const q = search.toLowerCase();
  const builtinFiltered = BUILTIN_PACKS.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
  ).sort((a, b) => a.name.localeCompare(b.name));

  // "My Packs" = local custom packs + published ones from Supabase
  const myAllPacks: (WordPack | CommunityPack)[] = [
    ...customPacks.filter((p) => !q || p.name.toLowerCase().includes(q)),
    ...myPublishedPacks.filter(
      (p) => !customPacks.find((cp) => cp.name.toLowerCase() === p.name.toLowerCase()) &&
             (!q || p.name.toLowerCase().includes(q)),
    ),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const listData: (WordPack | CommunityPack)[] =
    activeTab === 'builtin' ? builtinFiltered :
    activeTab === 'community' ? communityPacks :
    myAllPacks;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'mine', label: 'My Packs' },
    { key: 'community', label: 'Community' },
    { key: 'builtin', label: 'Built-in' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displayXL" color="light" style={styles.headerTitle}>
          COMMUNITY
        </Text>
        <Text variant="labelS" color="secondary" style={styles.headerSubtitle}>
          SYS.INDEX // PACKS
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="> SEARCH_PACKS..."
          placeholderTextColor={colors['neutral']}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          onSubmitEditing={() => activeTab === 'community' && loadCommunityPacks()}
        />
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              variant="labelM"
              color={activeTab === tab.key ? 'light' : 'neutral'}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      {loading && listData.length === 0 ? (
        <View style={{ paddingTop: spacing.md }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.cardMeta}>
                  <Skeleton width="60%" height={24} style={{ marginBottom: 4 }} />
                  <Skeleton width="40%" height={16} />
                </View>
              </View>
              <Skeleton width={40} height={24} borderRadius={radii.pill} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isBuiltin = BUILTIN_PACKS.some((bp) => bp.id === item.id);
            return (
              <PackCard
                pack={item}
                index={index}
                isBuiltin={isBuiltin}
                onPress={() => {
                  const localPack = customPacks.find(cp => cp.name.toLowerCase() === item.name.toLowerCase());
                  const commPack = myPublishedPacks.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || 
                                   (communityPacks.find(p => p.name.toLowerCase() === item.name.toLowerCase()));
                  
                  navigation.navigate('PackDetail', {
                    packId: item.id,
                    localPackId: localPack?.id,
                    communityId: commPack?.communityId || ('communityId' in item ? (item as CommunityPack).communityId : undefined),
                    isCustom: !!localPack,
                  });
                }}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="labelM" color="neutral">
                {activeTab === 'community'
                  ? 'No community packs yet. Be the first to publish one!'
                  : activeTab === 'mine'
                  ? 'No packs yet. Tap + NEW to create one.'
                  : 'No packs match your search.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.secondary}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button for +NEW */}
      <View style={[styles.fabContainer, { bottom: spacing.xl }]}>
        <Button
          variant="primary"
          onPress={() => navigation.navigate('CustomPackCreate', {})}
          accessibilityLabel="Create a new word pack"
        >
          + CREATE NEW PACK
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  headerTitle: { letterSpacing: -2 },
  headerSubtitle: { marginTop: spacing.xs, letterSpacing: 1 },
  searchRow: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  searchInput: {
    height: 44,
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.light,
    backgroundColor: colors['base.elevated'],
    paddingHorizontal: spacing.md,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  tabPillActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  listContent: { paddingTop: 0 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  cardMeta: { flex: 1, gap: 2 },
  cardName: { letterSpacing: -0.5 },
  builtinTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['secondary.muted'],
  },
  voteTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  voteText: { fontFamily: fonts.monoRegular },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  fabContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
});
