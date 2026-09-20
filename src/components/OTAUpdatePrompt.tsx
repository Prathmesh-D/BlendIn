import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Updates from 'expo-updates';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Text } from './primitives/Text';
import { Button } from './primitives/Button';
import { colors, spacing, radii, layout } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OTAUpdatePrompt() {
  const { isUpdateAvailable, isUpdatePending, isDownloading } = Updates.useUpdates();
  const insets = useSafeAreaInsets();

  const handleRestart = useCallback(async () => {
    await Updates.reloadAsync();
  }, []);

  // isUpdatePending means a new update has been downloaded and is ready to apply
  if (!isUpdatePending) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutDown}
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.md) }
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <View style={styles.textCol}>
          <Text variant="labelL" color="light">UPDATE READY</Text>
          <Text variant="bodyS" color="light.muted">A new version of BlendIn has been downloaded.</Text>
        </View>
        <Button variant="primary" onPress={handleRestart}>
          RESTART
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors['base.elevated'],
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
});
