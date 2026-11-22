import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Palette, Radius, Type } from '@/constants/theme';
import { clearAllData } from '@/services/privacyService';

/** Confirmation before wiping everything on the phone (UC-13, FR-06). */
export default function DeleteAllDataScreen() {
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await clearAllData();
      router.replace('/privasi/terhapus');
    } catch (error) {
      console.warn('Gagal menghapus data', error);
      Alert.alert('Belum terhapus', 'Datamu belum bisa dihapus. Coba lagi sebentar lagi.');
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <Icon name="lock" />
        <Text accessibilityRole="header" style={Type.title}>
          Hapus semua data?
        </Text>
        <Text style={Type.bodyLg}>
          Semua check-in, jurnal, hasil WHO-5, dan riwayat coping di ponsel ini akan terhapus
          permanen. Langkah ini nggak bisa dibatalkan.
        </Text>
        <Button label="Batal, tetap simpan" onPress={() => router.back()} />
        <Button variant="danger" label="Ya, hapus semuanya" onPress={onDelete} disabled={deleting} />
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
