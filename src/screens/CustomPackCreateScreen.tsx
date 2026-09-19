/**
 * BlendIn — Custom Pack Create / Edit Screen (Phase 4)
 *
 * Full word-pack editor:
 *  - Pack name, emoji (preset picker), description
 *  - Inline word list editor (add/delete, primary_word required; decoys optional locally)
 *  - Publish to Community toggle
 *  - Save → AsyncStorage (private) or Supabase (published)
 *
 * When editPackId is provided in route params, the screen loads that pack for editing.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from '../lib/haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePackStore } from '../store/packStore';
import { submitCommunityPack, updateCommunityPack } from '../lib/packService';
import type { WordPack, WordEntry } from '../data/builtinPacks';
import { colors, spacing, radii, layout, fonts } from '../theme';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Dialog } from '../components/primitives/Dialog';

type RouteParams = { editPackId?: string };

const AI_PROMPT = `You are an expert game designer generating a word pack for the social deduction game "BlendIn."

CATEGORY: [INSERT CATEGORY HERE]
COUNT: [INSERT NUMBER OF ENTRIES]

Generate entries with exactly 5 comma-separated values per line:
1. Primary Word - the secret word given to the Crew.
2. Easy Decoy - clearly in the same category as the Primary, but different enough that a hint pinned specifically to the Primary should expose an Imposter using this word. Still belongs to the same category, just a distant member of it - not random or unrelated.
3. Medium Decoy - shares a meaningful chunk of traits, context, or function with the Primary. A generic hint could apply to both, but a specific one shouldn't.
4. Hard Decoy - the Primary's closest neighbor: same subcategory, same typical context, same associations. Most natural hints for the Primary should also fit this word. The distinction should require genuinely precise, insider-level knowledge - not just "similar vibe" but "almost interchangeable in casual conversation."
5. Hint - EXACTLY ONE WORD. No phrases, no hyphenated compounds acting as two ideas, no articles. It must be a real noun, adjective, or verb that names a genuine, specific, recognizable trait, feature, role, or association of the Primary - the kind of word someone who actually knows the Primary would blurt out. It must ALSO genuinely apply to the Hard Decoy. Reject any one-word hint that is so broad it would apply to most items in the entire category (that's filler, not a hint) - it must be pointed enough to feel like real evidence, just evidence that two specific words both satisfy.

CALIBRATION RULES (critical for making the game interesting):
- Do not choose decoys by superficial similarity alone (e.g. same letter, same length, rhymes). Similarity must be conceptual/functional/contextual.
- The Easy Decoy should require at least one moment of thought - obviously wrong once you know the Primary, but not so far removed that it feels random or breaks category logic.
- The Hard Decoy must be chosen so that an Imposter hearing only the Hint could genuinely believe the Primary word IS the Hard Decoy. If the Hard Decoy is too easy to distinguish, replace it with a closer one.
- Vary the "axis" of difficulty across entries - mix decoys/hints that differ by function, context of use, era, connotation, role, tone, scale, texture, sound, etc., so players can't reverse-engineer a single pattern by always expecting the same kind of word.
- For every line, run this two-part check silently before finalizing:
  (a) "Is this single word specific enough that it sounds like real insider knowledge about the Primary, not a lazy category-wide generality?" If it feels generic, pick a sharper, more distinctive word.
  (b) "Does this exact word also genuinely, unambiguously apply to the Hard Decoy?" If NO, either choose a different word both share, or swap in a Hard Decoy that shares it.
  A word that only passes (b) by being vague fails (a) and must be replaced. A word that only passes (a) by being too narrow fails (b) and must be replaced.
- The hint word must never be: the Primary Word itself, a direct synonym of it, part of its name, or a word that uniquely identifies it and not the Hard Decoy.
- No two entries in the same pack should share a Primary Word, and avoid reusing the same decoy word or hint word across multiple entries unless the category is very small.

OUTPUT CONSTRAINTS:
- Provide ONLY the raw comma-separated data, wrapped in a single code block.
- Exactly 5 items per line, no headers, no bullets, no numbering.
- No spaces after commas unless part of the word itself.
- No introductory or closing commentary outside the code block.`;

function generateId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeBlankWord(): WordEntry {
  return {
    id: generateId(),
    primary_word: '',
    decoy_easy: '',
    decoy_medium: '',
    decoy_hard: '',
    hint_text: '',
    mirror_group_id: '',
  };
}

// ─── Word row editor ──────────────────────────────────────────────────────────
function WordRowEditor({
  word,
  index,
  isLast,
  onChange,
  onDelete,
  onSubmit,
  onBulkAdd,
  isRestricted,
}: {
  word: WordEntry;
  index: number;
  isLast: boolean;
  onChange: (updated: WordEntry) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onBulkAdd: (text: string) => void;
  isRestricted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={wordStyles.container}>
      <View style={wordStyles.topRow}>
        <Text variant="labelS" color="secondary" style={wordStyles.index}>
          [{String(index + 1).padStart(2, '0')}]
        </Text>
        <TextInput
          value={word.primary_word}
          autoFocus={index > 0 && word.primary_word === '' && isLast}
          onChangeText={(v) => {
            if (v.includes(',') || v.includes('\n')) {
              onBulkAdd(v);
            } else {
              onChange({ ...word, primary_word: v });
            }
          }}
          placeholder="> WORD OR PASTE..."
          placeholderTextColor={colors.neutral}
          style={wordStyles.primaryInput}
          returnKeyType="next"
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
        />
        {!isRestricted && (
          <Pressable onPress={() => setExpanded((p) => !p)} style={wordStyles.expandBtn}>
            <Text variant="labelM" color={expanded ? 'secondary' : 'neutral'}>{expanded ? '[-]' : '[+]'}</Text>
          </Pressable>
        )}
        <Pressable onPress={onDelete} style={wordStyles.deleteBtn} accessibilityLabel="Delete this word">
          <Text variant="labelL" color="error">×</Text>
        </Pressable>
      </View>
      {expanded && !isRestricted && (
        <View style={wordStyles.details}>
          {[
            { key: 'decoy_easy', label: 'Decoy (Easy)' },
            { key: 'decoy_medium', label: 'Decoy (Medium)' },
            { key: 'decoy_hard', label: 'Decoy (Hard)' },
            { key: 'hint_text', label: 'Hint text' },
          ].map(({ key, label }) => (
            <View key={key} style={wordStyles.detailRow}>
              <Text variant="labelS" color="neutral" style={wordStyles.detailLabel}>// {label}</Text>
              <TextInput
                value={(word as any)[key]}
                onChangeText={(v) => onChange({ ...word, [key]: v })}
                placeholder={`> VALUE...`}
                placeholderTextColor={colors.neutral}
                style={wordStyles.detailInput}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const wordStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors['base.elevated'],
  },
  index: { fontFamily: fonts.monoMedium, width: 32 },
  primaryInput: {
    flex: 1,
    height: 44,
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.light,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.base,
  },
  expandBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  details: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: { width: 110 },
  detailInput: {
    flex: 1,
    height: 36,
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.light,
    backgroundColor: colors.base,
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    paddingHorizontal: spacing.sm,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function CustomPackCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { editPackId } = (route.params ?? {}) as RouteParams;

  const { customPacks, addCustomPack, updateCustomPack: updateLocalPack, deleteCustomPack } = usePackStore();

  // Load existing pack for editing
  const existingPack = editPackId ? customPacks.find((p) => p.id === editPackId) : undefined;

  const [name, setName] = useState(existingPack?.name ?? '');
  const [description, setDescription] = useState(existingPack?.description ?? '');
  const [words, setWords] = useState<WordEntry[]>(
    existingPack?.words ?? [makeBlankWord()],
  );
  const [publishToComm, setPublishToComm] = useState(false);
  const [isRestricted, setIsRestricted] = useState(existingPack?.is_restricted ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const isEditing = !!editPackId;

  const handleDeletePack = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  const confirmDeletePack = useCallback(() => {
    setDeleteDialogVisible(false);
    if (editPackId) {
      deleteCustomPack(editPackId);
      navigation.navigate('MainTabs', { screen: 'CommunityTab' });
    }
  }, [editPackId, deleteCustomPack, navigation]);

  const handleAddWord = useCallback(() => {
    setWords((prev) => [...prev, makeBlankWord()]);
  }, []);

  const handleBulkAdd = useCallback((text: string, startIndex: number) => {
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
    if (lines.length === 0) return;

    const newEntries: WordEntry[] = [];
    
    if (lines.length === 1 && lines[0].includes(',')) {
      // Single line CSV flat list: chunk by 5
      const parts = lines[0].split(',').map(s => s.trim()).filter(s => s.length > 0);
      for (let i = 0; i < parts.length; i += 5) {
        newEntries.push({
          ...makeBlankWord(),
          primary_word: parts[i] || '',
          decoy_easy: parts[i+1] || '',
          decoy_medium: parts[i+2] || '',
          decoy_hard: parts[i+3] || '',
          hint_text: parts[i+4] || '',
        });
      }
    } else {
      // Multi-line CSV (or single words per line)
      for (const line of lines) {
        const delimiter = line.includes('\t') ? '\t' : ',';
        const parts = line.split(delimiter).map(s => s.trim());
        newEntries.push({
          ...makeBlankWord(),
          primary_word: parts[0] || '',
          decoy_easy: parts[1] || '',
          decoy_medium: parts[2] || '',
          decoy_hard: parts[3] || '',
          hint_text: parts[4] || '',
        });
      }
    }

    if (newEntries.length === 0) return;

    setWords((prev) => {
      const next = [...prev];
      next[startIndex] = { ...next[startIndex], ...newEntries[0] };
      if (newEntries.length > 1) {
        next.splice(startIndex + 1, 0, ...newEntries.slice(1));
      }
      return next;
    });
  }, []);

  const handleUpdateWord = useCallback((index: number, updated: WordEntry) => {
    setWords((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const handleDeleteWord = useCallback((index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    const trimName = name.trim();
    if (!trimName) { setError('Pack name is required.'); return; }
    const validWords = words.filter((w) => w.primary_word.trim());
    if (validWords.length < 3) { setError('Add at least 3 words.'); return; }

    setError(null);
    setLoading(true);

    try {
      const packData: WordPack = {
        id: isEditing ? editPackId! : generateId(),
        name: trimName,
        description: description.trim(),
        words: validWords,
        is_restricted: isRestricted,
      };

      if (isEditing) {
        await updateLocalPack(editPackId!, packData);
      } else {
        await addCustomPack(packData);
      }

      if (publishToComm) {
        await submitCommunityPack({
          name: trimName,
          description: description.trim(),
          words: validWords,
          is_restricted: isRestricted,
        });
      }

      Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [name, description, words, publishToComm, isEditing, editPackId, addCustomPack, updateLocalPack, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="displayXL" color="light" style={styles.headerTitle}>
            {isEditing ? 'EDIT PACK' : 'NEW PACK'}
          </Text>
          <Text variant="labelS" color="secondary" style={styles.headerSubtitle}>
            SYS.OP // {isEditing ? 'MODIFY' : 'INITIALIZE'}
          </Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text variant="labelS" color="light.muted">[ CANCEL ]</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pack identity */}
          <View style={styles.identityBlock}>
            <View style={styles.fieldBlock}>
              <Text variant="labelS" color="neutral" style={styles.fieldLabel}>SYS.FIELD // NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="> ENTER_PACK_NAME..."
                placeholderTextColor={colors.neutral}
                style={styles.fieldInput}
                maxLength={40}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text variant="labelS" color="neutral" style={styles.fieldLabel}>SYS.FIELD // DESC (OPTIONAL)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="> SHORT_DESCRIPTION..."
                placeholderTextColor={colors.neutral}
                style={[styles.fieldInput, styles.fieldInputMulti]}
                maxLength={200}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* AI Generator Help */}
          <View style={styles.aiBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <Text variant="labelL" color="secondary">SYS.TOOL // AI_GENERATOR</Text>
            </View>
            <Text variant="bodyS" color="light.muted" style={{ marginBottom: spacing.md, lineHeight: 20 }}>
              Want to generate a pack instantly? Copy our specialized prompt below, change the category/count, and paste it into ChatGPT or Claude. Then, copy their output block and paste it directly into the first word input below to auto-fill everything!
            </Text>
            <Button 
              variant="secondary" 
              onPress={async () => {
                await Clipboard.setStringAsync(AI_PROMPT);
                Haptics.triggerNotification(Haptics.NotificationFeedbackType.Success);
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 3000);
              }}
            >
              {copiedPrompt ? '[ PROMPT COPIED! ]' : '[ COPY AI PROMPT ]'}
            </Button>
          </View>

          {/* Words */}
          <View style={styles.wordsHeader}>
            <View>
              <Text variant="labelS" color="secondary" style={{ letterSpacing: 2 }}>
                SYS.DATA // WORDS ({words.filter((w) => w.primary_word.trim()).length})
              </Text>
              <Text variant="bodyS" color="neutral" style={{ marginTop: 2 }}>
                Tip: Paste a comma-separated list to bulk add!
              </Text>
            </View>
            <Pressable onPress={handleAddWord} style={styles.addWordBtn}>
              <Text variant="labelM" color="accent">[ ADD ]</Text>
            </Pressable>
          </View>

          {words.map((word, i) => (
            <WordRowEditor
              key={word.id}
              word={word}
              index={i}
              isLast={i === words.length - 1}
              onChange={(updated) => handleUpdateWord(i, updated)}
              onDelete={() => handleDeleteWord(i)}
              onSubmit={() => {
                if (i === words.length - 1 && word.primary_word.trim()) {
                  handleAddWord();
                }
              }}
              onBulkAdd={(text) => handleBulkAdd(text, i)}
              isRestricted={isRestricted}
            />
          ))}

          <Pressable style={styles.addWordRow} onPress={handleAddWord}>
            <Text variant="labelM" color="accent">[ + APPEND_WORD ]</Text>
          </Pressable>

          {/* Restrictions toggle */}
          <View style={[styles.publishRow, { borderTopWidth: 0, marginTop: 0 }]}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text variant="labelL" color="light">Restrict to Category/Blank Only</Text>
              <Text variant="labelS" color="neutral">Hides custom decoys and hints for this pack</Text>
            </View>
            <Switch
              value={isRestricted}
              onValueChange={setIsRestricted}
              trackColor={{ false: colors['neutral.border'], true: colors.error }}
              thumbColor={colors.light}
            />
          </View>

          {/* Publish toggle */}
          <View style={styles.publishRow}>
            <View>
              <Text variant="labelL" color="light">Publish to Community</Text>
              <Text variant="labelS" color="neutral">Decoys are optional (engine auto-generates them)</Text>
            </View>
            <Switch
              value={publishToComm}
              onValueChange={setPublishToComm}
              trackColor={{ false: colors['neutral.border'], true: colors.secondary }}
              thumbColor={colors.light}
            />
          </View>

          {isEditing && (
            <View style={styles.deleteRow}>
              <Pressable onPress={handleDeletePack} style={styles.deletePackBtn}>
                <Text variant="labelM" color="error">[ DELETE PACK ]</Text>
              </Pressable>
            </View>
          )}

          {error && (
            <Text variant="bodyS" color="error" style={styles.errorText}>{error}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button variant="primary" fullWidth loading={loading} onPress={handleSave}>
          {isEditing ? 'SAVE CHANGES' : publishToComm ? 'SAVE & PUBLISH' : 'SAVE PACK'}
        </Button>
      </View>

      <Dialog
        visible={deleteDialogVisible}
        title="SYS.WARN // DELETE_PACK"
        message="Are you sure you want to delete this pack? This cannot be undone locally."
        primaryAction={{
          label: 'Delete',
          onPress: confirmDeletePack,
          isDestructive: true,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setDeleteDialogVisible(false),
        }}
        onDismiss={() => setDeleteDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  headerTitle: { letterSpacing: -2 },
  headerSubtitle: { marginTop: spacing.xs, letterSpacing: 1 },
  backBtn: { height: 44, justifyContent: 'center' },
  content: { paddingTop: 0 },

  identityBlock: {
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    paddingBottom: spacing.lg,
  },

  fieldBlock: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  fieldLabel: { letterSpacing: 1 },
  fieldInput: {
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.light,
    backgroundColor: colors['base.elevated'],
    borderWidth: 1,
    borderColor: colors['neutral.border'],
    borderRadius: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  fieldInputMulti: { minHeight: 80, textAlignVertical: 'top' },

  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },
  addWordBtn: { height: 44, justifyContent: 'center' },
  addWordRow: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
  },

  publishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  deleteRow: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
  deletePackBtn: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.sm,
  },

  errorText: { textAlign: 'center', margin: spacing.lg },
  bottomBar: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    backgroundColor: colors.base,
    borderTopWidth: 1,
    borderTopColor: colors['neutral.border'],
  },
  aiBlock: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors['neutral.border'],
    backgroundColor: colors['base.elevated'],
  }
});
