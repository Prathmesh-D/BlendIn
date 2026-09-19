import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { colors, spacing, radii, layout, fonts } from '../theme';
import { Text } from './primitives/Text';
import { Surface } from './primitives/Surface';
import { Button } from './primitives/Button';

type ReasonType = 'inappropriate' | 'spam_low_effort' | 'offensive' | 'duplicate' | 'other';

const REASONS: { key: ReasonType; label: string; desc: string }[] = [
  { key: 'inappropriate', label: 'Inappropriate Content', desc: 'NSFW or adult themes' },
  { key: 'offensive', label: 'Offensive / Hate Speech', desc: 'Targeted harassment or slurs' },
  { key: 'spam_low_effort', label: 'Spam / Low Effort', desc: 'Gibberish or unusable words' },
  { key: 'duplicate', label: 'Duplicate', desc: 'Copy of an existing pack' },
  { key: 'other', label: 'Other', desc: 'Something else' },
];

interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => Promise<void>;
}

export function ReportBottomSheet({ visible, onClose, onSubmit }: ReportBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<ReasonType | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      await onSubmit(selectedReason, notes.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedReason(null);
        setNotes('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedReason(null);
    setNotes('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          style={StyleSheet.absoluteFillObject}
        >
          <Pressable style={styles.backdrop} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(150)}
          exiting={SlideOutDown}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
        >
          <View style={styles.dragHandle} />
          
          <Text variant="displayM" color="light" style={styles.title}>
            Report Pack
          </Text>

          {success ? (
            <View style={styles.successState}>
              <Text variant="displayL" color="success">✓</Text>
              <Text variant="labelL" color="success">Report Submitted</Text>
              <Text variant="bodyM" color="light.muted" style={{ textAlign: 'center' }}>
                Thank you for keeping the community safe.
              </Text>
            </View>
          ) : (
            <>
              <Text variant="bodyM" color="light.muted" style={styles.subtitle}>
                Why are you reporting this pack?
              </Text>

              <View style={styles.reasonList}>
                {REASONS.map((r) => {
                  const isSelected = selectedReason === r.key;
                  return (
                    <Pressable
                      key={r.key}
                      onPress={() => setSelectedReason(r.key)}
                      style={[
                        styles.reasonRow,
                        isSelected && styles.reasonRowSelected,
                      ]}
                    >
                      <View>
                        <Text variant="labelM" color={isSelected ? 'light' : 'neutral'}>
                          {r.label.toUpperCase()}
                        </Text>
                        <Text variant="bodyS" color="light.muted">
                          {r.desc}
                        </Text>
                      </View>
                      {isSelected && (
                        <Text variant="labelL" color="accent">✓</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.notesContainer}>
                <Text variant="labelS" color="light.muted" style={styles.notesLabel}>
                  ADDITIONAL NOTES (OPTIONAL)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Tell us more..."
                  placeholderTextColor={colors['neutral']}
                  style={styles.notesInput}
                  multiline
                  maxLength={200}
                />
              </View>

              {error && (
                <Text variant="bodyS" color="error" style={styles.errorText}>
                  {error}
                </Text>
              )}

              <Button
                variant={selectedReason ? 'primary' : 'secondary'}
                onPress={handleSubmit}
                loading={loading}
                disabled={!selectedReason || loading}
                fullWidth
                style={styles.submitBtn}
              >
                SUBMIT REPORT
              </Button>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.base,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors['neutral.border'],
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  reasonList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors['base.subtle'],
    borderRadius: radii.md,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  reasonRowSelected: {
    backgroundColor: colors['accent.muted'],
    borderLeftColor: colors.accent,
  },
  notesContainer: {
    marginBottom: spacing.lg,
  },
  notesLabel: {
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  notesInput: {
    backgroundColor: colors['base.subtle'],
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.light,
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  successState: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
