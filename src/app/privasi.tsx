import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { InfoCard } from '@/components/InfoCard';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';

export default function PrivacyScreen() {
  const version = Constants.expoConfig?.version ?? '1.0';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Privasi & Tentang" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={Type.title}>
          {'Ceritamu tetap\npunya kamu.'}
        </Text>
        <Icon name="lock" />
        <InfoCard
          tone="blue"
          title="Tersimpan di ponselmu"
          body="Mood, jurnal, dan hasil WHO-5 disimpan secara lokal di ponsel ini, bukan dikirim ke server Teduh."
        />
        <InfoCard
          tone="yellowSoft"
          title="Kamu yang pegang kendali"
          body="Kamu bisa menghapus seluruh data kapan saja. Menghapus aplikasi juga bisa menghapus catatanmu."
        />
        <Text style={Type.subheading}>Tentang Teduh</Text>
        <Text style={Type.bodyLg}>
          Teman refleksi untuk keseharian mahasiswa. Teduh bukan pengganti bantuan profesional.
        </Text>
        <Text style={Type.caption}>{`Teduh · Versi ${version}`}</Text>
        <Button variant="danger" label="Hapus semua data" onPress={() => router.push('/privasi/hapus')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
});
