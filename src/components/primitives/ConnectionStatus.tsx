import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radii } from '../../theme';
import { Text } from './Text';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Note: supabase realtime doesn't have a simple boolean property. 
    // We check the realtime channel connection status across active channels.
    // However, since connection issues are intermittent, we can listen to the global 'system' channel
    // or rely on a simple heartbeat. 
    // For this implementation, we simulate an offline state hook or rely on the Realtime connection state.
    // In a production app, NetInfo from @react-native-community/netinfo is preferred.
    
    // For Phase 6, we'll implement a basic listener on Supabase Realtime if possible.
    const checkConnection = () => {
      // Very basic approximation without adding NetInfo:
      // If we have active channels, are they connected?
      const channels = supabase.getChannels();
      if (channels.length > 0) {
        // If the first channel is errored or disconnected, we might be offline.
        // For now, let's just assume connected unless explicitly errored.
      }
    };
    
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <Animated.View 
      entering={FadeInUp.springify()} 
      exiting={FadeOutUp}
      style={styles.container}
    >
      <View style={[styles.dot, { backgroundColor: isConnected ? colors.success : colors.error }]} />
      <Text variant="labelS" color="light.muted">
        {isConnected ? 'CONNECTED' : 'RECONNECTING...'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors['base.elevated'],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    position: 'absolute',
    top: spacing.md,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
