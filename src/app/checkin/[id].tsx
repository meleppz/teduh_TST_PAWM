import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/checkin/Chip';
import { MoodScale } from '@/components/checkin/MoodScale';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { MoodColors, Palette, Type } from '@/constants/theme';
import { MOOD_DETAIL_HEADLINES } from '@/data/labels';
import { mascotForMood } from '@/data/mascot';
import { getEntryById, type MoodEntry } from '@/services/moodService';
import { formatDateId, formatTimeId, localDay } from '@/utils/date';

export default function CheckInDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // undefined = still loading, null = not found
  const [entry, setEntry] = useState<MoodEntry | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
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
    }, [id]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Detail check-in" />
      {entry === undefined ? null : entry === null ? (
        <View style={styles.content}>
          <Text style={Type.bodyLg}>Check-in ini tidak ditemukan. Mungkin sudah dihapus.</Text>
        </View>
      ) : (
        <Detail entry={entry} />
      )}
    </SafeAreaView>
  );
}

function Detail({ entry }: { entry: MoodEntry }) {
  const date = new Date(entry.createdAt);
  // FR-10: a check-in can only be changed or deleted on the day it was made.
  const editable = entry.day === localDay();

  const about = [
    [formatTimeId(date), entry.contexts.join(', ')].filter(Boolean).join(' · '),
    entry.energy ? `Energi ${entry.energy} dari 5` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headline}>
        <View style={styles.headlineText}>
          <Text style={Type.body}>{formatDateId(date)}</Text>
          <Text accessibilityRole="header" style={Type.title}>
            {MOOD_DETAIL_HEADLINES[entry.mood]}
          </Text>
        </View>
        <Mascot name={mascotForMood(entry.mood)} width={84} />
      </View>
      <MoodScale value={entry.mood} highlight />

      {entry.emotions.length > 0 ? (
        <View style={styles.chips}>
          {entry.emotions.map((emotion) => (
            <Chip key={emotion} label={emotion} selected />
          ))}
        </View>
      ) : null}

      <InfoCard title="Tentang hari ini" body={about} fill={MoodColors[entry.mood].tint} />

      {editable ? (
        <>
          <Button
            label="Edit check-in"
            onPress={() =>
              router.push({ pathname: '/checkin/[id]/edit', params: { id: String(entry.id) } })
            }
          />
          <Button
            variant="outline"
            label="Hapus check-in"
            onPress={() =>
              router.push({ pathname: '/checkin/[id]/hapus', params: { id: String(entry.id) } })
            }
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  headline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headlineText: { flex: 1, gap: 2 },
});
