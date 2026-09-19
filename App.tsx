/**
 * BlendIn — App Entry Point (Phase 2)
 *
 * Added: Silent anonymous auth initialization on launch.
 * The auth service calls signInAnonymously() if no session exists,
 * writes the result into authStore, and the app proceeds normally.
 *
 * Single-device play (Phase 1) works even if auth fails — the authStore
 * will just hold `user: null`.
 */

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { fontAssets, colors } from './src/theme';
import { initializeAuth, subscribeToAuthChanges } from './src/lib/authService';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [initialRoute, setInitialRoute] = React.useState<'Onboarding' | 'MainTabs' | null>(null);

  // Initialize Supabase auth on mount (Phase 2)
  useEffect(() => {
    initializeAuth();
    const unsubscribe = subscribeToAuthChanges();
    return unsubscribe;
  }, []);

  // Determine initial route and check for updates
  useEffect(() => {
    async function prepareApp() {
      // 1. Force check for OTA updates on cold boot
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return; // Stop execution, the app is restarting
          }
        }
      } catch (e) {
        // Silently fail if offline or check times out, so we don't block the user
        console.log('OTA Update check failed:', e);
      }

      // 2. Resolve initial route
      try {
        const hasOnboarded = await AsyncStorage.getItem('@blendin_onboarding_done');
        setInitialRoute(hasOnboarded === 'true' ? 'MainTabs' : 'Onboarding');
      } catch {
        setInitialRoute('Onboarding');
      }
    }
    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if ((!fontsLoaded && !fontError) || !initialRoute) {
    // Return a solid background so Expo Go's blue splash doesn't bleed through
    return <View style={styles.root} />;
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator initialRouteName={initialRoute} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.base,
  },
});
