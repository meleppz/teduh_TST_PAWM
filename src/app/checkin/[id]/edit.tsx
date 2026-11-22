import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/checkin/Chip';
import { ChipGroup } from '@/components/checkin/ChipGroup';
import { MoodScale } from '@/components/checkin/MoodScale';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { CONTEXTS, EMOTIONS, ENERGY_LEVELS, type MoodValue } from '@/data/labels';
import { getEntryById, updateMoodEntry, type MoodEntry } from '@/services/moodService';
import { formatDateId, formatTimeId } from '@/utils/date';

export default function EditCheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<MoodEntry | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getEntryById(Number(id))
      .then((found) => active && setEntry(found))
      .catch((error) => {
        console.warn('Gagal memuat check-in', error);
        if (active) setEntry(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Edit check-in" />
      {entry === undefined ? null : entry === null ? (
        <View style={styles.content}>
          <Text style={Type.bodyLg}>Check-in ini tidak ditemukan. Mungkin sudah dihapus.</Text>
        </View>
      ) : (
        <EditForm entry={entry} />
      )}
    </SafeAreaView>
  );
}

function EditForm({ entry }: { entry: MoodEntry }) {
  const [mood, setMood] = useState<MoodValue>(entry.mood);
  const [energy, setEnergy] = useState<number | null>(entry.energy);
  const [emotions, setEmotions] = useState<string[]>(entry.emotions);
  const [contexts, setContexts] = useState<string[]>(entry.contexts);
  const [saving, setSaving] = useState(false);

  const date = new Date(entry.createdAt);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateMoodEntry(entry.id, { mood, energy, emotions, contexts });
      router.back();
    } catch (error) {
      console.warn('Gagal menyimpan perubahan', error);
      Alert.alert('Belum tersimpan', 'Perubahan kamu belum bisa disimpan. Coba lagi sebentar lagi.');
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={Type.heading}>Ubah cerita hari ini</Text>
        <Text style={Type.body}>{`${formatDateId(date)} · ${formatTimeId(date)}`}</Text>

        <MoodScale value={mood} onChange={setMood} />

        <Text style={Type.bodyLgBold}>
          {energy ? `Energi kamu · ${energy} dari 5` : 'Energi kamu'}
        </Text>
        <View style={styles.chips}>
          {ENERGY_LEVELS.map((level) => (
            <Chip
              key={level}
              label={String(level)}
              selected={energy === level}
              onPress={() => setEnergy(energy === level ? null : level)}
            />
          ))}
        </View>

        <Text style={Type.bodyLgBold}>Emosi</Text>
        <ChipGroup options={EMOTIONS} selected={emotions} onChange={setEmotions} />

        <Text style={Type.bodyLgBold}>Konteks</Text>
        <ChipGroup options={CONTEXTS} selected={contexts} onChange={setContexts} />
      </ScrollView>

      <View style={styles.actionBar}>
        <Button label="Simpan perubahan" onPress={onSave} disabled={saving} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
