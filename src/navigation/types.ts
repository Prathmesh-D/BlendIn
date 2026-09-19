/**
 * BlendIn — Navigation Type Definitions
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ─── Main Tab Navigator ────────────────────────────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined;
  CommunityTab: undefined;
  SettingsTab: undefined;
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  
  // The tab navigator
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  
  // High-level screens pushed over tabs
  GameSetup: undefined;
  RoomJoin: undefined;
  RoomLobby: { roomId: string; joinCode: string; isHost: boolean };
  
  PackDetail: { packId: string; communityId?: string; isCustom?: boolean };
  CustomPackCreate: { editPackId?: string };

  // In-game Modals
  RoleReveal: undefined;
  HintRound: undefined;
  Discussion: undefined;
  RoundSummary: undefined;
};

// ─── Navigation prop helpers ──────────────────────────────────────────────────
export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigation = BottomTabNavigationProp<MainTabParamList>;
