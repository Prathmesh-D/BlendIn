/**
 * BlendIn — Screen Placeholder Factory
 *
 * Generates a minimal placeholder screen for each route during Phase 0.
 * Replace each placeholder with the real implementation in Phase 1+.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Text } from '../components/primitives/Text';

export function createPlaceholderScreen(screenName: string) {
  function PlaceholderScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text variant="labelS" color="neutral" style={{ letterSpacing: 2 }}>
            SCREEN
          </Text>
          <Text variant="displayL" color="light">
            {screenName}
          </Text>
          <Text
            variant="bodyS"
            color="light.muted"
            style={{ marginTop: spacing.md, textAlign: 'center' }}
          >
            Placeholder — implementation pending
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  PlaceholderScreen.displayName = `${screenName}Screen`;
  return PlaceholderScreen;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
