import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Palette, Radius, Type } from '@/constants/theme';
import { deleteMoodEntry, getEntryById, type MoodEntry } from '@/services/moodService';
import { formatTimeId } from '@/utils/date';

export default function DeleteCheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getEntryById(Number(id))
      .then((found) => active && setEntry(found))
      .catch((error) => console.warn('Gagal memuat check-in', error));
    return () => {
      active = false;
    };
  }, [id]);

  const onDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteMoodEntry(Number(id));
      // Back to the Riwayat tab; the detail screen of the deleted entry is dropped.
      router.dismissTo('/riwayat');
    } catch (error) {
      console.warn('Gagal menghapus check-in', error);
      Alert.alert('Belum terhapus', 'Check-in ini belum bisa dihapus. Coba lagi sebentar lagi.');
      setDeleting(false);
    }
  };

  const time = entry ? formatTimeId(new Date(entry.createdAt)) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <Icon name="trash" />
        <Text accessibilityRole="header" style={Type.title}>
          Hapus check-in ini?
        </Text>
        <Text style={Type.bodyLg}>
          {time
            ? `Catatan hari ini pukul ${time} akan terhapus dari ponselmu. Kamu nggak bisa mengembalikannya.`
            : 'Catatan ini akan terhapus dari ponselmu. Kamu nggak bisa mengembalikannya.'}
        </Text>
        <Button label="Tetap simpan" onPress={() => router.back()} />
        <Button variant="danger" label="Ya, hapus check-in" onPress={onDelete} disabled={deleting} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Palette.background,
  },
  card: {
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surface,
  },
});
