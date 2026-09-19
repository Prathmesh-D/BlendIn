import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore, HapticIntensity } from '../store/settingsStore';
import * as Haptics from '../lib/haptics';
import { signOut, updateDisplayName } from '../lib/authService';
import { colors, spacing, fonts, layout } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Dialog } from '../components/primitives/Dialog';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { hapticsEnabled, hapticIntensity, setHapticsEnabled, setHapticIntensity } = useSettingsStore();
  const isAnonymous = user?.isAnonymous ?? true;

  const [signOutVisible, setSignOutVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const confirmSignOut = useCallback(async () => {
    setSignOutVisible(false);
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  }, [navigation]);

  const handleSaveName = useCallback(async () => {
    // Close immediately to feel responsive
    setEditNameVisible(false);
    try {
      await updateDisplayName(newName);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }, [newName]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerBlock}>
          <Text variant="labelS" color="secondary" style={styles.preTitle}>
            SYS.CONFIG
          </Text>
          <Text variant="displayL" color="light" style={styles.header}>
            SETTINGS
          </Text>
        </View>

        {/* ── Account Section ── */}
        <View style={styles.section}>
          <Text variant="labelS" color="neutral" style={styles.sectionTitle}>
            [ ACCOUNT_DETAILS ]
          </Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.dashedBottom]}>
              <Text variant="labelL" color="light">USER_ID</Text>
              <Text variant="labelM" color="neutral">
                {user?.id ? user.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
              </Text>
            </View>
            <View style={[styles.row, styles.dashedBottom]}>
              <Text variant="labelL" color="light">DISPLAY_NAME</Text>
              <TouchableOpacity 
                activeOpacity={0.5} 
                onPress={() => { setNewName(user?.displayName || ''); setEditNameVisible(true); }}
              >
                <Text variant="labelM" color="accent">
                  {user?.displayName ? `"${user.displayName}"` : '"GUEST"'}  [ EDIT ]
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <Text variant="labelL" color="light">ACCOUNT_TYPE</Text>
              <Text variant="labelM" color={isAnonymous ? 'secondary' : 'neutral'}>
                {isAnonymous ? '[ TEMPORARY ]' : '[ REGISTERED ]'}
              </Text>
            </View>
          </View>

          {isAnonymous && (
            <View style={styles.upgradeContainer}>
              <Button 
                variant="primary" 
                onPress={() => setUpgradeVisible(true)}
                fullWidth
              >
                UPGRADE TO SAVE PROGRESS
              </Button>
              <Text variant="bodyS" color="light.muted" style={styles.upgradeSub}>
                Don't lose your stats and custom packs!
              </Text>
            </View>
          )}
        </View>

        {/* ── Preferences Section ── */}
        <View style={styles.section}>
          <Text variant="labelS" color="neutral" style={styles.sectionTitle}>
            [ PREFERENCES ]
          </Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.dashedBottom]}>
              <Text variant="labelL" color="light">HAPTIC_FEEDBACK</Text>
              <TouchableOpacity onPress={() => {
                const nextState = !hapticsEnabled;
                setHapticsEnabled(nextState);
                if (nextState) {
                  // We bypass the store state here temporarily because setHapticsEnabled might not have committed immediately
                  Haptics.impactAsync(Haptics.intensityMap[hapticIntensity]);
                }
              }}>
                <Text variant="labelM" color={hapticsEnabled ? 'accent' : 'neutral'}>
                  [ {hapticsEnabled ? 'ON' : 'OFF'} ]
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <Text variant="labelL" color={hapticsEnabled ? 'light' : 'neutral'}>HAPTIC_INTENSITY</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {(['light', 'medium', 'heavy'] as HapticIntensity[]).map((intensity) => (
                  <TouchableOpacity 
                    key={intensity} 
                    disabled={!hapticsEnabled}
                    onPress={() => {
                      setHapticIntensity(intensity);
                      // Give immediate feedback of what that intensity feels like
                      Haptics.impactAsync(Haptics.intensityMap[intensity]);
                    }}
                  >
                    <Text 
                      variant="labelM" 
                      color={
                        !hapticsEnabled ? 'neutral.muted' 
                        : hapticIntensity === intensity ? 'accent' : 'neutral'
                      }
                    >
                      {intensity.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── About Section ── */}
        <View style={styles.section}>
          <Text variant="labelS" color="neutral" style={styles.sectionTitle}>
            [ SYSTEM_INFO ]
          </Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.dashedBottom]}>
              <Text variant="labelL" color="light">SERVER_STATUS</Text>
              <Text variant="labelM" color="accent">[ ONLINE ]</Text>
            </View>
            <View style={[styles.row, styles.dashedBottom]}>
              <Text variant="labelL" color="light">VERSION</Text>
              <Text variant="labelM" color="neutral">v1.0.0</Text>
            </View>
            <View style={styles.row}>
              <Button 
                variant="ghost" 
                style={styles.actionBtn}
                onPress={() => setInfoVisible(true)}
              >
                [ VIEW_APP_INFO ]
              </Button>
            </View>
          </View>
        </View>

        {/* ── Danger Zone ── */}
        <View style={[styles.section, { marginTop: spacing.xxl }]}>
          <Button 
            variant="secondary" 
            onPress={() => setSignOutVisible(true)} 
            style={styles.signOutBtn}
          >
            <Text variant="labelL" color="base">SIGN OUT DEVICE</Text>
          </Button>
          <Text variant="bodyM" color="error" style={styles.signOutWarning}>
            WARNING: Signing out of a temporary account will permanently delete all local packs and progress.
          </Text>
        </View>

      </ScrollView>

      {/* Dialogs */}
      <Dialog
        visible={signOutVisible}
        title="SYS.WARN // SIGN_OUT"
        message={isAnonymous 
          ? "You are playing on a temporary account. If you sign out without upgrading, your progress will be permanently lost."
          : "Are you sure you want to sign out?"}
        primaryAction={{
          label: 'Sign Out',
          onPress: confirmSignOut,
          isDestructive: true,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setSignOutVisible(false),
        }}
        onDismiss={() => setSignOutVisible(false)}
      />

      <Dialog
        visible={upgradeVisible}
        title="SYS.INFO // UPGRADE"
        message="Upgrading will be available soon! For now, keep playing as a guest."
        primaryAction={{
          label: 'Acknowledge',
          onPress: () => setUpgradeVisible(false),
        }}
        onDismiss={() => setUpgradeVisible(false)}
      />

      <Dialog
        visible={infoVisible}
        title="SYS.INFO // BLENDIN"
        message={`BlendIn is a high-tension social deduction party game that eliminates the complicated setup of traditional board games.\n\nNo extra props, no long rule explanations—just pure deception and deduction that you can play anywhere.\n\nMade by Prathmesh Deshkar.`}
        primaryAction={{
          label: 'Acknowledge',
          onPress: () => setInfoVisible(false),
        }}
        onDismiss={() => setInfoVisible(false)}
      />

      <Dialog
        visible={editNameVisible}
        title="SYS.INPUT // DISPLAY_NAME"
        message="Enter a new display name (max 30 characters)."
        primaryAction={{
          label: 'Save',
          onPress: handleSaveName,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setEditNameVisible(false),
        }}
        onDismiss={() => setEditNameVisible(false)}
      >
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          maxLength={30}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          placeholder="New name..."
          placeholderTextColor={colors['light.muted']}
        />
      </Dialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContent: {
    padding: layout.screenPaddingH,
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    borderBottomStyle: 'dashed',
    marginBottom: spacing.xxl,
  },
  preTitle: {
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  header: {
    letterSpacing: -2,
    fontSize: 40,
    lineHeight: 44,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors['base.elevated'],
    borderWidth: 1,
    borderColor: colors['neutral.border'],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dashedBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    borderBottomStyle: 'dashed',
  },
  upgradeContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  upgradeSub: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 'auto',
  },
  signOutBtn: {
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 0,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutWarning: {
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  input: {
    backgroundColor: colors.base,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    color: colors.light,
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    padding: spacing.md,
  },
});
