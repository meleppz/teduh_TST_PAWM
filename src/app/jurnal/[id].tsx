import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { createNote, getNote, updateNote } from '@/services/journalService';
import { formatFullDate, formatTimeId } from '@/utils/date';

const PLACEHOLDER = `${Palette.text}80`;
const AUTOSAVE_DELAY_MS = 700;

/** Writing screen. A note is created on the first keystroke and saved as you type. */
export default function JournalEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'baru';

  const [loaded, setLoaded] = useState(isNew);
  const [missing, setMissing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [createdAt, setCreatedAt] = useState(() => new Date());

  const noteId = useRef<number | null>(isNew ? null : Number(id));
  // Always holds the latest text, so saving on exit never uses stale values.
  const latest = useRef({ title, body, dirty });
  useEffect(() => {
    latest.current = { title, body, dirty };
  });

  useEffect(() => {
    if (isNew) return;
    let active = true;
    getNote(Number(id))
      .then((note) => {
        if (!active) return;
        if (!note) {
          setMissing(true);
        } else {
          setTitle(note.title);
          setBody(note.body);
          setCreatedAt(new Date(note.createdAt));
        }
        setLoaded(true);
      })
      .catch((error) => {
        console.warn('Gagal memuat catatan', error);
        if (active) setMissing(true);
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id, isNew]);

  /** Writes the current text. An empty new note is not stored. */
  const persist = useCallback(async () => {
    const { title: t, body: b, dirty: isDirty } = latest.current;
    if (!isDirty) return;
    if (noteId.current === null && !t.trim() && !b.trim()) {
      setDirty(false);
      return;
    }
    try {
      if (noteId.current === null) {
        const created = await createNote({ title: t, body: b });
        noteId.current = created.id;
      } else {
        await updateNote(noteId.current, { title: t, body: b });
      }
      setSavedAt(new Date());
      setDirty(false);
    } catch (error) {
      console.warn('Gagal menyimpan catatan', error);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !dirty) return;
    const timer = setTimeout(persist, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [title, body, dirty, loaded, persist]);

  // Leaving by any route (including the Android back button) still keeps the last words.
  useEffect(() => () => void persist(), [persist]);

  const finish = async () => {
    await persist();
    router.back();
  };

  const status = dirty
    ? 'Menyimpan…'
    : savedAt
      ? `Tersimpan otomatis · ${formatTimeId(savedAt)}`
      : isNew
        ? 'Catatan baru'
        : 'Belum ada perubahan';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Jurnal" onBack={finish} />
      {!loaded ? null : missing ? (
        <View style={styles.content}>
          <Text style={Type.bodyLg}>Catatan ini tidak ditemukan.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text accessibilityLiveRegion="polite" style={Type.captionBold}>
              {status}
            </Text>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setDirty(true);
              }}
              placeholder="Judul"
              placeholderTextColor={PLACEHOLDER}
              accessibilityLabel="Judul catatan"
              style={[Type.title, styles.titleInput]}
            />
            <Text style={Type.body}>{formatFullDate(createdAt)}</Text>
            <TextInput
              value={body}
              onChangeText={(text) => {
                setBody(text);
                setDirty(true);
              }}
              placeholder="Mulai dari apa yang paling ingin kamu tulis…"
              placeholderTextColor={PLACEHOLDER}
              accessibilityLabel="Isi catatan"
              multiline
              textAlignVertical="top"
              style={[Type.bodyLg, styles.bodyInput]}
            />
          </ScrollView>
          <View style={styles.actionBar}>
            <Button label="Selesai" onPress={finish} />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  // Inputs have no box in the design: they read like plain text.
  titleInput: { padding: 0 },
  bodyInput: { padding: 0, minHeight: 240 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
