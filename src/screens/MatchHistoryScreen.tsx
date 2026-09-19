/**
 * BlendIn — Match History Screen
 *
 * Brutalist list of past finished online matches.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { fetchUserMatchHistory, MatchHistoryEntry } from '../lib/historyService';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, layout } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';

function HistoryRow({ match, index }: { match: MatchHistoryEntry; index: number }) {
  const isPositive = match.scoreDelta > 0;
  const isZero = match.scoreDelta === 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
      style={styles.dataRow}
    >
      <View style={styles.leftCol}>
        <Text variant="labelS" color="neutral">
          {new Date(match.createdAt).toLocaleDateString()}
        </Text>
        <Text variant="labelL" color="light" style={{ textTransform: 'uppercase', marginTop: spacing.xs }}>
          WORD: {match.word}
        </Text>
        <Text variant="labelS" color="light.muted" style={{ marginTop: spacing.xs }}>
          OUTCOME: {match.outcome}
        </Text>
      </View>
      <View style={styles.rightCol}>
        <Text 
          variant="labelL" 
          color={isPositive ? 'accent' : isZero ? 'neutral' : 'light.muted'}
        >
          {isPositive ? '+' : ''}{match.scoreDelta}
        </Text>
      </View>
    </Animated.View>
  );
}

export function MatchHistoryScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchUserMatchHistory(user.id)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Decorative Corner Borders */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.corner, { top: spacing.xl, left: spacing.md, borderTopWidth: 2, borderLeftWidth: 2 }]} />
        <View style={[styles.corner, { top: spacing.xl, right: spacing.md, borderTopWidth: 2, borderRightWidth: 2 }]} />
      </View>

      <View style={styles.header}>
        <Text variant="displayL" color="light" style={styles.title}>
          HISTORY
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Text variant="labelM" color="light.muted" style={{ textAlign: 'center' }}>
              ERROR: {error}
            </Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.centerBox}>
            <Text variant="labelM" color="light.muted" style={{ textAlign: 'center' }}>
              NO MATCH HISTORY FOUND.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.dataGrid}>
              {history.map((match, i) => (
                <HistoryRow key={match.roomId} match={match} index={i} />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <Button variant="ghost" fullWidth onPress={() => navigation.goBack()}>
          BACK TO HOME
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors['secondary.muted'],
  },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    letterSpacing: -1,
  },
  content: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xxl,
  },
  dataGrid: {
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    marginLeft: spacing.md,
    alignItems: 'flex-end',
  },
  footer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
  },
});
