/**
 * BlendIn — Root Navigator (Phase 6)
 *
 * Implements bottom tabs for the main app shell, while keeping game flows
 * and modals pushed on top of the tab bar in the Root Stack.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from '@expo/vector-icons/Feather';
import { colors, fonts } from '../theme';
import type { RootStackParamList, MainTabParamList } from './types';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CommunityLibraryScreen } from '../screens/CommunityLibraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GameSetupScreen } from '../screens/GameSetupScreen';
import { RoomJoinScreen } from '../screens/RoomJoinScreen';
import { RoomLobbyScreen } from '../screens/RoomLobbyScreen';
import { PackDetailScreen } from '../screens/PackDetailScreen';
import { CustomPackCreateScreen } from '../screens/CustomPackCreateScreen';
import { RoleRevealScreen } from '../screens/RoleRevealScreen';
import { DiscussionScreen } from '../screens/DiscussionScreen';
import { RoundSummaryScreen } from '../screens/RoundSummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors['base.elevated'],
          borderTopColor: colors['neutral.border'],
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.neutral,
        tabBarLabelStyle: {
          fontFamily: fonts.labelRegular,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="CommunityTab" 
        component={CommunityLibraryScreen} 
        options={{ 
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Feather name="globe" color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}

export function RootNavigator({ initialRouteName = 'Onboarding' }: { initialRouteName?: keyof RootStackParamList }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.base },
          animation: 'slide_from_right',
        }}
      >
        {/* ── Auth / Onboarding ─────────────────────────────────────────── */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* ── Main App Shell (Tabs) ─────────────────────────────────────── */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* ── Game flows & Stack Screens (pushed over tabs) ─────────────── */}
        <Stack.Screen name="GameSetup" component={GameSetupScreen} />
        <Stack.Screen name="RoomJoin" component={RoomJoinScreen} />
        <Stack.Screen
          name="RoomLobby"
          component={RoomLobbyScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="PackDetail" component={PackDetailScreen} />
        <Stack.Screen name="CustomPackCreate" component={CustomPackCreateScreen} />

        {/* ── In-game Modals ────────────────────────────────────────────── */}
        <Stack.Screen
          name="RoleReveal"
          component={RoleRevealScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="Discussion"
          component={DiscussionScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="RoundSummary"
          component={RoundSummaryScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
