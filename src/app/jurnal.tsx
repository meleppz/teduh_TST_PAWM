import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { HeaderAction, StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { listNotes, type JournalNote } from '@/services/journalService';
import { formatDayMonthYear } from '@/utils/date';

const newNote = () => router.push({ pathname: '/jurnal/[id]', params: { id: 'baru' } });

export default function JournalScreen() {
  // undefined = still loading
  const [notes, setNotes] = useState<JournalNote[] | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      listNotes()
        .then((found) => active && setNotes(found))
        .catch((error) => {
          console.warn('Gagal memuat jurnal', error);
          if (active) setNotes([]);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const hasNotes = !!notes && notes.length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader
        title="Jurnal"
        right={<HeaderAction icon="add" label="Tambah catatan" onPress={newNote} />}
      />
      {notes === undefined ? null : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Icon name="lock" />
            <Text style={Type.body}>Hanya tersimpan di ponselmu</Text>

            {hasNotes ? (
              <>
                <Text accessibilityRole="header" style={Type.title}>
                  {'Hal kecil,\nboleh diceritakan.'}
                </Text>
                {notes.map((note) => (
                  <InfoCard
                    key={note.id}
                    tone="blueSoft"
                    title={note.title.trim() || 'Tanpa judul'}
                    body={`${formatDayMonthYear(new Date(note.createdAt))}\n${note.body.trim()}`}
                    bodyLines={3}
                    onPress={() =>
                      router.push({ pathname: '/jurnal/[id]', params: { id: String(note.id) } })
                    }
                  />
                ))}
              </>
            ) : (
              <>
                <Mascot name="hug" width={140} />
                <Text accessibilityRole="header" style={Type.title}>
                  {'Halamanmu\nmasih terbuka.'}
                </Text>
                <Text style={Type.bodyLg}>
                  Nggak harus panjang atau rapi. Mulai dari apa yang paling ingin kamu tulis.
                </Text>
              </>
            )}
          </ScrollView>
          <View style={styles.actionBar}>
            <Button label="Tulis catatan" onPress={newNote} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
