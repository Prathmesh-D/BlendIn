import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, layout, fonts } from '../../theme';
import { Text } from './Text';

export interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  primaryAction: {
    label: string;
    onPress: () => void;
    isDestructive?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  onDismiss?: () => void;
  children?: React.ReactNode;
}

export function Dialog({
  visible,
  title,
  message,
  primaryAction,
  secondaryAction,
  onDismiss,
  children,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.dialogContainer}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text variant="labelS" color="light">{title}</Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {!!message && (
                  <Text variant="bodyM" color="neutral" style={[styles.message, !!children && { marginBottom: spacing.lg }]}>
                    {message}
                  </Text>
                )}
                {children}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {secondaryAction && (
                  <Pressable
                    onPress={secondaryAction.onPress}
                    style={styles.actionBtnSecondary}
                  >
                    <Text variant="labelM" color="neutral">
                      [ {secondaryAction.label.toUpperCase()} ]
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={primaryAction.onPress}
                  style={[
                    styles.actionBtnPrimary,
                    primaryAction.isDestructive && styles.actionBtnDestructive,
                  ]}
                >
                  <Text
                    variant="labelM"
                    color={primaryAction.isDestructive ? 'error' : 'base'}
                  >
                    {primaryAction.isDestructive
                      ? `[ ${primaryAction.label.toUpperCase()} ]`
                      : primaryAction.label.toUpperCase()}
                  </Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.85)', // Darker, brutalist overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPaddingH,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.base,
    borderWidth: 2,
    borderColor: colors['neutral.border'],
    // Brutalist stark shadow
    shadowColor: colors.light,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 10,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    backgroundColor: colors['base.elevated'],
  },
  content: {
    padding: spacing.xl,
  },
  message: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
  actionBtnSecondary: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors['neutral.border'],
    backgroundColor: colors.base,
  },
  actionBtnPrimary: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
  },
  actionBtnDestructive: {
    backgroundColor: colors.base, // Keep background dark for destructive
  },
});
